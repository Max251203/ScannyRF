import { useEffect, useState } from 'react'
import ModalEditor from '../components/ModalEditor.jsx'
import { toast } from '../components/Toast.jsx'
import { AuthAPI } from '../api'

export default function Terms(){
  const [data,setData]=useState(null)
  const [open,setOpen]=useState(false)
  const [admin,setAdmin]=useState(false)

  useEffect(()=>{ const u = JSON.parse(localStorage.getItem('user')||'null'); setAdmin(!!u?.is_staff); load() },[])

  const load=async()=>{
    const d=await fetch(AuthAPI.getApiBase()+'/cms/legal/').then(r=>r.json())
    const page = Array.isArray(d)? d.find(x=>x.slug==='terms'):null
    setData(page||null)
  }

  const onSave=async({title,html})=>{
    const payload={slug:'terms', title: title || (data?.title || 'Пользовательское соглашение'), body: html}
    const url = data ? `/cms/legal/${data.id}/` : `/cms/legal/`
    const method = data ? 'PUT':'POST'
    try {
      await AuthAPI.authed(url,{ method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      toast('Сохранено','success'); setOpen(false); load()
    } catch (e) {
      toast(e.message || 'Ошибка сохранения','error')
    }
  }

  return (
    <div className="container section legal">
      <h1>{data?.title || 'Пользовательское соглашение'}</h1>
      {admin && <button className="btn btn-lite" onClick={()=>setOpen(true)}><span className="label">Редактировать</span></button>}
      <div dangerouslySetInnerHTML={{__html: data?.body || ''}}/>
      {!data && <p>Страница пуста.</p>}
      <ModalEditor
        open={open}
        onClose={()=>setOpen(false)}
        title="Редактирование"
        initialTitle={data?.title||''}
        initialHTML={data?.body||''}
        onSave={onSave}
        protectTitle={true}
        requireTitle={false}
      />
    </div>
  )
}