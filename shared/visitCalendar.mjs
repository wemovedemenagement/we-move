export function calendarDays(anchor,view='month') {
  const d=new Date(anchor+'T12:00:00Z');
  if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==anchor)throw new Error('Date invalide');
  if(view==='month')d.setUTCDate(1);
  d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);
  return Array.from({length:view==='week'?7:42},(_,i)=>{const day=new Date(d);day.setUTCDate(day.getUTCDate()+i);return day.toISOString().slice(0,10);});
}
export function shiftCalendar(anchor,view,step) {
 const d=new Date(anchor+'T12:00:00Z');
 if(view==='month'){d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+step);}else d.setUTCDate(d.getUTCDate()+7*step);
 return d.toISOString().slice(0,10);
}
export function visitDay(value='') {
 const day=value.slice(0,10);
 return /^\d{4}-\d{2}-\d{2}$/.test(day)&&Number.isFinite(Date.parse(day))&&new Date(day).toISOString().slice(0,10)===day?day:null;
}
