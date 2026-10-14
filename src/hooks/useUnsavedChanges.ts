import {useEffect} from 'react';

/** Keep the browser's native warning while a form has unsaved work. */
export function useUnsavedChanges(enabled:boolean) {
  useEffect(()=>{
    if(!enabled)return;
    const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};
    window.addEventListener('beforeunload',warn);
    return()=>window.removeEventListener('beforeunload',warn);
  },[enabled]);
}
