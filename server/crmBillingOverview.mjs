import {billingSummary} from './crmBillingModel.mjs';
import {parisToday} from '../shared/followUp.mjs';
export function billingRow(d,today=parisToday()){const summary=billingSummary(d,today);return {id:d.id,number:d.number,kind:d.kind,invoiceId:d.invoiceId,leadId:d.leadId,clientName:d.snapshot.clientName,issueDate:d.issueDate,dueDate:d.dueDate,createdAt:d.createdAt,amountTTC:d.amountTTC,creditedTTC:d.creditedTTC||0,...summary};}
export function billingOverview(records,today=parisToday()){
 const docs=records.filter(d=>d.mode==='live'),invoices=docs.filter(d=>d.kind!=='avoir'),month=today.slice(0,7);
 let dueCents=0,overdueCents=0,refundDueCents=0,receivedCents=0,refundedCents=0,overdueCount=0,openCount=0;
 const priorities=[];
 for(const d of invoices){const row=billingRow(d,today);dueCents+=row.dueCents;refundDueCents+=row.refundDueCents;if(row.dueCents>0)openCount++;const overdue=row.dueCents>0&&row.dueDate<today;if(overdue){overdueCount++;overdueCents+=row.dueCents;}for(const p of d.payments){if(p.reversedAt||p.date?.slice(0,7)!==month||p.date>today)continue;if(p.kind==='refund')refundedCents+=p.amountCents;else receivedCents+=p.amountCents;}
 if(row.refundDueCents>0||row.dueCents>0)priorities.push({...row,reason:row.refundDueCents>0?'refund':overdue?'overdue':row.dueDate===today?'today':'upcoming',daysOverdue:overdue?Math.floor((Date.parse(today)-Date.parse(row.dueDate))/86400000):0});
 }
 const order={refund:0,overdue:1,today:2,upcoming:3};priorities.sort((a,b)=>order[a.reason]-order[b.reason]||a.dueDate.localeCompare(b.dueDate)||a.id.localeCompare(b.id));
 return {asOf:new Date().toISOString(),today,month,documentCount:docs.length,invoiceCount:invoices.length,creditCount:docs.length-invoices.length,dueCents,overdueCents,refundDueCents,receivedCents,refundedCents,netReceivedCents:receivedCents-refundedCents,openCount,overdueCount,priorityCount:priorities.length,priorities:priorities.slice(0,8)};
}
