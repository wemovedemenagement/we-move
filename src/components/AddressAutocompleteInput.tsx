import {useId} from 'react';
import {AddressAutocomplete} from './AddressAutocomplete';
type Props={id?:string;name?:string;value:string;onChange:(value:string)=>void;placeholder?:string;required?:boolean;className?:string;iconColor?:string};
export function AddressAutocompleteInput({id,name,value,onChange,placeholder='Numéro et rue, code postal, ville',required=false,className=''}:Props){
 const generated=useId();
 return <div className={className}><AddressAutocomplete id={id||generated} label={placeholder} value={value} onChange={onChange} placeholder={placeholder} required={required}/>{name&&<input type="hidden" name={name} value={value}/>}</div>;
}
