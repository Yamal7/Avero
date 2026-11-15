import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from './icon';
export function ListHeader({category,title,children}:{category:string;title:string;children?:ReactNode}){
 return <div className="page-heading list-heading"><div><p className="eyebrow">{category}</p><h1>{title}</h1></div><div className="button-group">{children}</div></div>;
}
export function ListSearch({action,value,name='q',placeholder,hidden={}}:{action:string;value:string;name?:string;placeholder:string;hidden?:Record<string,string>}){
 return <form className="list-search" action={action} role="search">{Object.entries(hidden).map(([key,value])=><input type="hidden" key={key} name={key} value={value}/>)}<label><span className="sr-only">{placeholder}</span><Icon name="search" size={21}/><input type="search" name={name} defaultValue={value} maxLength={200} placeholder={placeholder}/></label><button type="submit" className="list-search-submit" aria-label="Szukaj"><Icon name="arrow" size={20}/></button></form>;
}
export function ListTabs({label,items}:{label:string;items:{label:string;href:string;active:boolean}[]}){
 return <nav className="list-tabs" aria-label={label}>{items.map(item=><Link key={item.href} href={item.href} className={item.active?'is-active':''} aria-current={item.active?'page':undefined}>{item.label}</Link>)}</nav>;
}
export function ListTable({children,label}:{children:ReactNode;label:string}){
 return <div className="list-table table-scroll"><table aria-label={label}>{children}</table></div>;
}
