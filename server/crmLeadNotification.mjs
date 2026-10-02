import {leadNotificationTransaction,customerReceiptTransaction} from './crmStore.mjs';
import {resendSend} from './crmResend.mjs';
import {leadNotificationContent} from './crmLeadEmailTemplate.mjs';

const websiteSources=new Set(['site','page_devis','modal_devis','modal_devis_rapide','formulaire_site','formulaire_client','estimation_volume']);
const address='contact@we-move.fr';
export async function notifyCustomerLead(lead,{enabled=process.env.CRM_CUSTOMER_RECEIPTS==='true',send=resendSend,transaction=customerReceiptTransaction}={}) {
 if(!enabled||!websiteSources.has(lead.source)||! /^[^\s<>\r\n,;@]+@[^\s<>\r\n,;@]+\.[^\s<>\r\n,;@]+$/.test(lead.email||''))return;
 const to=lead.email.trim();
 const claim=await transaction(lead.id,current=>current.customerNotification?{write:false}:{write:true,notification:{state:'sending',to,createdAt:new Date().toISOString()}});
 if(!claim.write)return;
 let notification;
 try {
  const result=await send({from:{address},to:{address:to},messageId:`customer-receipt-${lead.id}`,subject:'Votre demande de déménagement a bien été reçue — WE MOVE',attachments:[],...leadNotificationContent(lead,{customer:true})});
  notification={...claim.notification,state:'accepted',providerId:result.messageId,updatedAt:new Date().toISOString()};
 }catch(error){notification={...claim.notification,state:error.code==='EPROVIDER_REJECTED'?'failed':'uncertain',updatedAt:new Date().toISOString()};console.error(JSON.stringify({event:'customer_receipt_error',leadId:lead.id,state:notification.state}));}
 await transaction(lead.id,()=>({write:true,notification}));
}
export async function notifyWebsiteLead(lead,{enabled=process.env.CRM_LEAD_NOTIFICATIONS==='true',send=resendSend,transaction=leadNotificationTransaction}={}) {
  if(!enabled||!websiteSources.has(lead.source))return;
  // Claim before sending: concurrent calls cannot send the same notification twice.
  const claim=await transaction(lead.id,current=>current.notification
    ? {write:false}
    : {write:true,notification:{state:'sending',to:address,createdAt:new Date().toISOString()}});
  if(!claim.write)return;
  let notification;
  try {
    const result=await send({from:{address},to:{address},messageId:`website-lead-${lead.id}`,
      subject:'Nouvelle demande de devis — WE MOVE',attachments:[],
      ...leadNotificationContent(lead)});
    notification={...claim.notification,state:'accepted',providerId:result.messageId,updatedAt:new Date().toISOString()};
  } catch(error) {
    notification={...claim.notification,state:error.code==='EPROVIDER_REJECTED'?'failed':'uncertain',updatedAt:new Date().toISOString()};
    console.error(JSON.stringify({event:'lead_notification_error',leadId:lead.id,state:notification.state}));
  }
  // Keep "sending" if this write fails; never retry automatically after an uncertain send.
  await transaction(lead.id,()=>({write:true,notification}));
}
