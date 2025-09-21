import { useEffect, useRef, useState } from 'react'
import { AuthAPI } from '../api'
import camIcon from '../assets/icons/cam.png'
import { toast } from '../components/Toast.jsx'

export default function Profile(){
  const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem('user')||'null'))
  const [tab,setTab]=useState('info')
  useEffect(()=>{ if(!user){ AuthAPI.me().then(u=>setUser(u)).catch(()=>{}) }},[])
  const isAdmin=!!user?.is_staff
  return (
    <div className="container section">
      <h1>Личный кабинет</h1>
      <div className="tabs">
        <button className={`tab ${tab==='info'?'active':''}`} onClick={()=>setTab('info')}>Личные данные</button>
        <button className={`tab ${tab==='history'?'active':''}`} onClick={()=>setTab('history')}>История</button>
        <button className={`tab ${tab==='plan'?'active':''}`} onClick={()=>setTab('plan')}>Тариф</button>
        {isAdmin && <button className={`tab ${tab==='users'?'active':''}`} onClick={()=>setTab('users')}>Пользователи</button>}
      </div>
      {tab==='info' && <InfoSection user={user} onUpdated={(u)=>{ setUser(u); window.dispatchEvent(new CustomEvent('user:update',{detail:u})); }} />}
      {tab==='history' && <div className="card"><p>Здесь будет история работы с документами.</p></div>}
      {tab==='plan' && <div className="card"><p>Текущий тариф: Бесплатный.</p></div>}
      {isAdmin && tab==='users' && <AdminUsers/>}
    </div>
  )
}

function InfoSection({user,onUpdated}){
  const [email,setEmail]=useState(user?.email||'')
  const [username,setUsername]=useState(user?.username||'')
  const [avatar,setAvatar]=useState(null)
  const [pwdMode,setPwdMode]=useState('known')
  const [oldPwd,setOldPwd]=useState('')
  const [newPwd,setNewPwd]=useState('')
  const [code,setCode]=useState('')
  const fileRef=useRef(null)

  const onFileChange=(e)=>{ const f=e.target.files?.[0]; if(f){ setAvatar(f); } e.target.value=''; }
  const removeAvatar=()=>{ setAvatar('remove') }

  const saveProfile=async()=>{
    try{
      const fd=new FormData()
      if(email) fd.append('email',email)
      fd.append('username',username||'')
      if(avatar==='remove') fd.append('remove_avatar','true')
      else if(avatar) fd.append('avatar',avatar)
      const u=await AuthAPI.updateProfile(fd)
      setAvatar(null); onUpdated(u); toast('Сохранено','success')
    }catch(e){ toast(e.message,'error') }
  }

  const sendCode=async()=>{ try{ await AuthAPI.requestCode(email); toast('Код отправлен','success') }catch(e){ toast(e.message,'error') } }
  const changePassword=async()=>{
    try{
      if(pwdMode==='known'){
        if(!oldPwd||!newPwd){ toast('Введите старый и новый пароль','error'); return }
        await AuthAPI.changePassword(oldPwd,newPwd)
        setOldPwd(''); setNewPwd(''); toast('Пароль изменён','success')
      }else{
        if(!code||!newPwd){ toast('Введите код и новый пароль','error'); return }
        await AuthAPI.confirmCode(email,code,newPwd)
        setCode(''); setNewPwd(''); toast('Пароль изменён','success')
      }
    }catch(e){ toast(e.message,'error') }
  }

  return (
    <div className="card">
      <div className="form-grid">
        <div>
          <div className="avatar-uploader hint" onClick={()=>fileRef.current?.click()}>
            {avatar && avatar!=='remove'
              ? <img alt="" src={URL.createObjectURL(avatar)}/>
              : user?.avatar_url
                ? <img alt="" src={user.avatar_url}/>
                : <div className="avatar-placeholder"><img src={camIcon} alt="" className="cam-img"/><span>Добавить фото</span></div>}
            <input ref={fileRef} type="file" hidden accept="image/*" onChange={onFileChange}/>
          </div>
          {(user?.avatar_url || (avatar && avatar!=='remove')) &&
            <button className="link-btn" onClick={removeAvatar}>Удалить фото</button>}
        </div>
        <div>
          <div className="form-row"><input placeholder="E‑mail" value={email} onChange={e=>setEmail(e.target.value)}/></div>
          <div className="form-row"><input placeholder="Логин (необязательно)" value={username} onChange={e=>setUsername(e.target.value)}/></div>
          <div className="form-row"><button className="btn" onClick={saveProfile}><span className="label">Сохранить</span></button></div>
        </div>
      </div>

      <hr/>
      <h3>Смена пароля</h3>
      <div className="form-row">
        <label className="agree-line"><input type="radio" name="pwd" checked={pwdMode==='known'} onChange={()=>setPwdMode('known')}/> <span>Знаю старый пароль</span></label>
        <label className="agree-line" style={{marginLeft:12}}><input type="radio" name="pwd" checked={pwdMode==='forgot'} onChange={()=>setPwdMode('forgot')}/> <span>Забыл пароль</span></label>
      </div>
      {pwdMode==='known' ? (
        <div className="two-col">
          <input placeholder="Старый пароль" type="password" value={oldPwd} onChange={e=>setOldPwd(e.target.value)}/>
          <input placeholder="Новый пароль" type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)}/>
          <button className="btn" onClick={changePassword}><span className="label">Изменить</span></button>
        </div>
      ):(
        <div className="two-col">
          <button className="btn btn-lite" onClick={sendCode}><span className="label">Отправить код</span></button>
          <input placeholder="Код из письма" value={code} onChange={e=>setCode(e.target.value)}/>
          <input placeholder="Новый пароль" type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)}/>
          <button className="btn" onClick={changePassword}><span className="label">Изменить</span></button>
        </div>
      )}
    </div>
  )
}

function AdminUsers(){
  const [list,setList]=useState([])
  const [form,setForm]=useState({email:'',username:'',password:''})
  const [edit,setEdit]=useState(null)

  const load=async()=>{
    const r=await fetch(AuthAPI.getApiBase()+'/admin/users/',{headers:{...authHeader()}})
    if(!r.ok){ toast('Нет доступа или ошибка загрузки','error'); return }
    const d=await r.json(); setList(Array.isArray(d)?d:[])
  }
  useEffect(()=>{ load() },[])

  const authHeader=()=>({ 'Content-Type':'application/json', ... (localStorage.getItem('access')? {Authorization:`Bearer ${localStorage.getItem('access')}`} : {}) })

  const save=async()=>{
    const url=AuthAPI.getApiBase()+'/admin/users/'+(edit? edit.id+'/' : '')
    const method=edit?'PUT':'POST'
    const payload={email:form.email, username:form.username, password:form.password, is_staff:false}
    const r=await fetch(url,{method,headers:authHeader(),body:JSON.stringify(payload)})
    if(!r.ok){ const t=await r.text(); toast(t||'Ошибка сохранения','error'); return }
    setForm({email:'',username:'',password:''}); setEdit(null); toast('Сохранено','success'); load()
  }
  const del=async(id)=>{ if(!confirm('Удалить пользователя?')) return; const r=await fetch(AuthAPI.getApiBase()+'/admin/users/'+id+'/',{method:'DELETE',headers:authHeader()}); if(!r.ok){ toast('Ошибка удаления','error'); return } toast('Удалено','success'); load() }
  const startEdit=(u)=>{ setEdit(u); setForm({email:u.email, username:u.username||'', password:''}) }
  const cancel=()=>{ setEdit(null); setForm({email:'',username:'',password:''}) }

  return (
    <div className="card">
      <h3>Пользователи</h3>
      <div className="admin-grid">
        <div className="admin-list">
          {list.map(u=>(
            <div className="row" key={u.id}>
              <div>{u.username || u.email}</div>
              <div className="actions">
                <button className="link-btn" onClick={()=>startEdit(u)}>Редактировать</button>
                <button className="link-btn" onClick={()=>del(u.id)}>Удалить</button>
              </div>
            </div>
          ))}
          {list.length===0 && <p>Пользователи не найдены.</p>}
        </div>
        <div className="admin-form">
          <div className="form-row"><input placeholder="E‑mail" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          <div className="form-row"><input placeholder="Логин (опц.)" value={form.username} onChange={e=>setForm({...form,username:e.target.value})}/></div>
          <div className="form-row"><input placeholder="Пароль" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div>
          <div className="form-row two">
            <button className="btn" onClick={save}><span className="label">{edit?'Сохранить':'Создать'}</span></button>
            {edit && <button className="link-btn" onClick={cancel}>Отмена</button>}
          </div>
        </div>
      </div>
    </div>
  )
}