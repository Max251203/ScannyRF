import { useEffect, useState } from 'react'
import ModalEditor from '../components/ModalEditor.jsx'
import { toast } from '../components/Toast.jsx'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
const authHeaders = () => { const t=localStorage.getItem('access')||''; return t?{Authorization:`Bearer ${t}`}:{ } }

export default function Privacy(){
  const [data,setData]=useState(null)
  const [open,setOpen]=useState(false)
  const [admin,setAdmin]=useState(false)

  useEffect(()=>{ const u=JSON.parse(localStorage.getItem('user')||'null'); setAdmin(!!u?.is_staff); load() },[])
  const load=async()=>{ const r=await fetch(`${API}/cms/legal/`); const d=await r.json(); const page=Array.isArray(d)? d.find(x=>x.slug==='privacy'):null; setData(page||null) }

  const onSave=async({title,html})=>{
    const payload={slug:'privacy', title: title||'Политика конфиденциальности', body: html}
    const url = data ? `${API}/cms/legal/${data.id}/` : `${API}/cms/legal/`
    const method = data ? 'PUT':'POST'
    const r=await fetch(url,{method,headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify(payload)})
    if(!r.ok){ toast('Ошибка сохранения','error'); return }
    toast('Сохранено','success'); setOpen(false); load()
  }

  return (
    <div className="container section legal">
      <h1>{data?.title || 'Политика конфиденциальности'}</h1>
      {admin && <button className="btn btn-lite" onClick={()=>setOpen(true)}><span className="label">Редактировать</span></button>}
      <div dangerouslySetInnerHTML={{__html: data?.body || ''}}/>
      {!data && <p>Страница пуста.</p>}
      <ModalEditor open={open} onClose={()=>setOpen(false)} title="Редактирование" initialTitle={data?.title||''} initialHTML={data?.body||''} onSave={onSave}/>
    </div>
  )
}