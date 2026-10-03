import {readFileSync} from 'node:fs';
export function crmUiVersion(){
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const version=html.match(/\/assets\/(index-[A-Za-z0-9_-]+\.js)/)?.[1];
 if(!version)throw new Error('Version du build indisponible');
 return version;
}
