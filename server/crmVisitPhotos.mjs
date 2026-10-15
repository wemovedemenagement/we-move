import sharp from 'sharp';
import {Storage} from '@google-cloud/storage';
import {mkdir,readFile,writeFile,unlink} from 'node:fs/promises';
import path from 'node:path';
import {mailSecretClient} from './crmMailSecret.mjs';
import {getDossierRecords} from './crmStore.mjs';

const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const MAX_PHOTOS=12;
let bucketPromise,processing=0;
function key(id,slot){
  if(!/^[A-Za-z0-9_-]{1,180}$/.test(id)||!Number.isInteger(slot)||slot<1||slot>MAX_PHOTOS)fail(400,'Référence de photo invalide.');
  return `visits/${id}/${slot}.jpg`;
}
async function bucket(){
  const name=process.env.CRM_PHOTO_BUCKET;
  if(!name)fail(503,'Le stockage privé des photos n’est pas encore configuré.');
  bucketPromise ||= (async()=>{
    const authClient=await mailSecretClient().auth.getClient();
    const result=new Storage({authClient}).bucket(name);
    const [metadata]=await result.getMetadata();
    if(metadata.iamConfiguration?.publicAccessPrevention!=='enforced'||!metadata.iamConfiguration?.uniformBucketLevelAccess?.enabled)fail(503,'Le stockage des photos doit rester strictement privé.');
    return result;
  })().catch(error=>{bucketPromise=null;throw error;});
  return bucketPromise;
}
function localPath(object){
  if(process.env.CRM_STORAGE!=='sqlite')return null;
  if(process.env.NODE_ENV==='production'||process.env.K_SERVICE||!process.env.CRM_DATA_DIR)fail(503,'Stockage local des photos interdit ici.');
  return path.join(process.env.CRM_DATA_DIR,'photos',object);
}
async function ensureLead(id){
  key(id,1);
  if(!(await getDossierRecords(id)).lead)fail(404,'Dossier introuvable.');
}
export async function listVisitPhotos(id){
  await ensureLead(id);
  const photos=[];
  if(!localPath(key(id,1))){
    const [files]=await (await bucket()).getFiles({prefix:`visits/${id}/`,maxResults:13,autoPaginate:false});
    return files.filter(f=>/^([1-9]|1[0-2])\.jpg$/.test(f.name.split('/').at(-1))).map(f=>({slot:Number(f.name.split('/').at(-1).replace('.jpg','')),caption:f.metadata.metadata?.caption||'',area:f.metadata.metadata?.area||'mobilier',createdAt:f.metadata.timeCreated,generation:f.metadata.generation})).sort((a,b)=>a.slot-b.slot);
  }
  for(let slot=1;slot<=MAX_PHOTOS;slot++){
    const object=key(id,slot),local=localPath(object);
    try{
      if(local){const data=JSON.parse(await readFile(local+'.json','utf8'));photos.push({...data,slot});}
      else {const [meta]=await (await bucket()).file(object).getMetadata();photos.push({slot,caption:meta.metadata?.caption||'',area:meta.metadata?.area||'mobilier',createdAt:meta.timeCreated,generation:meta.generation});}
    }catch(error){if(!['ENOENT',404].includes(error.code))throw error;}
  }
  return photos;
}
export async function addVisitPhoto(id,slot,bytes,{caption='',area='mobilier'}={}){
  await ensureLead(id);const object=key(id,slot),local=localPath(object);
  if(typeof caption!=='string'||caption.length>200||!['depart','arrivee','mobilier'].includes(area))fail(400,'Légende ou emplacement invalide.');
  if(!Buffer.isBuffer(bytes)||bytes.length===0||bytes.length>8*1024*1024)fail(400,'Choisissez une image de 8 Mo maximum.');
  if(processing>=2)fail(409,'Deux photos sont déjà en cours de traitement. Réessayez dans quelques instants.');
  processing++;
  let image;
  try{
    const source=sharp(bytes,{limitInputPixels:40000000,animated:false});
    const meta=await source.metadata();
    if(!['jpeg','png','webp'].includes(meta.format)||(meta.pages||1)>1)fail(400,'Formats acceptés : JPEG, PNG et WebP non animés.');
    // Re-encoding removes EXIF/GPS and any trailing payload; never serve originals.
    image=await source.rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).flatten({background:'#ffffff'}).jpeg({quality:80}).toBuffer();
  }catch(error){if(error.status)throw error;fail(400,'Cette image ne peut pas être lue. Choisissez un JPEG, PNG ou WebP valide.');}
  finally{processing--;}
  const metadata={caption:caption.trim(),area,createdAt:new Date().toISOString()};
  try{
    if(local){
      await mkdir(path.dirname(local),{recursive:true});
      await writeFile(local,image,{flag:'wx'});
      await writeFile(local+'.json',JSON.stringify({...metadata,generation:String(BigInt(Date.now())*1000000n+BigInt(Math.floor(Math.random()*1000000)))}));
    }else await (await bucket()).file(object).save(image,{resumable:false,preconditionOpts:{ifGenerationMatch:0},metadata:{contentType:'image/jpeg',cacheControl:'private, no-store',metadata:{caption:metadata.caption,area}}});
  }catch(error){if(error.code==='EEXIST'||error.code===412)fail(409,'Cet emplacement a été utilisé entre-temps. Actualisez les photos puis réessayez.');throw error;}
}
export async function readVisitPhoto(id,slot){
  await ensureLead(id);const object=key(id,slot),local=localPath(object);
  try{return local?await readFile(local):(await (await bucket()).file(object).download())[0];}
  catch(error){if(['ENOENT',404].includes(error.code))fail(404,'Photo introuvable.');throw error;}
}
export async function deleteVisitPhoto(id,slot,generation){
  await ensureLead(id);const object=key(id,slot),local=localPath(object);
  if(typeof generation!=='string'||!/^\d{1,30}$/.test(generation))fail(400,'Version de photo invalide.');
  try{
    if(local){const meta=JSON.parse(await readFile(local+'.json','utf8'));if(meta.generation!==generation)fail(409,'Cette photo a changé. Actualisez la liste.');await unlink(local);await unlink(local+'.json');}
    else await (await bucket()).file(object).delete({ifGenerationMatch:generation});
  }catch(error){if(['ENOENT',404].includes(error.code))return;if(error.code===412)fail(409,'Cette photo a changé. Actualisez la liste.');throw error;}
}
