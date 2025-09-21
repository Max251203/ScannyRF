import { useEffect, useMemo, useState } from 'react'
import ModalEditor from '../components/ModalEditor.jsx'
import { toast } from '../components/Toast.jsx'
import iconAdd from '../assets/icons/add.png'
import iconEdit from '../assets/icons/edit.png'
import iconDelete from '../assets/icons/delete.png'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
const authHeaders = () => {
  const t = localStorage.getItem('access') || ''
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export default function Help() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  const [admin, setAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editRow, setEditRow] = useState(null)

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    setAdmin(!!u?.is_staff)
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API}/cms/faq/`)
      if (!r.ok) { toast('Не удалось загрузить вопросы','error'); return }
      const d = await r.json()
      setItems(Array.isArray(d) ? d : [])
    } finally { setLoading(false) }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return items
    return items.filter(x => x.title.toLowerCase().includes(s))
  }, [q, items])

  const openNew = () => { setEditRow(null); setEditorOpen(true) }
  const openEdit = (row) => { setEditRow(row); setEditorOpen(true) }
  const remove = async (row) => {
    if (!confirm('Удалить вопрос?')) return
    const r = await fetch(`${API}/cms/faq/${row.id}/`, { method:'DELETE', headers:{...authHeaders()} })
    if (!r.ok) { toast('Не удалось удалить','error'); return }
    toast('Удалено','success'); load()
  }
  const onSave = async ({ title, html }) => {
    const url = editRow ? `${API}/cms/faq/${editRow.id}/` : `${API}/cms/faq/`
    const method = editRow ? 'PUT':'POST'
    const r = await fetch(url, {
      method, headers:{'Content-Type':'application/json', ...authHeaders()},
      body: JSON.stringify({ title, body: html })
    })
    if (!r.ok) { toast('Ошибка сохранения','error'); return }
    toast('Сохранено','success')
    setEditorOpen(false)
    load()
  }

  return (
    <div className="help-page">
      <div className="container">
        <div className="help-head" style={{justifyContent:'space-between'}}>
          <div className="help-search only-input">
            <input type="search" placeholder="Поиск по вопросам…" value={q} onChange={e=>setQ(e.target.value)} />
          </div>
          {admin && (
            <button className="btn" onClick={openNew}><span className="label" style={{display:'inline-flex',alignItems:'center',gap:8}}><img src={iconAdd} alt="" style={{width:16,height:16}}/>Добавить</span></button>
          )}
        </div>
        <h1 className="help-title">Общие вопросы</h1>

        <div className="help-grid">
          {loading && <div>Загрузка…</div>}
          {!loading && filtered.map(q => (
            <div className="help-card" key={q.id}>
              <div className="help-card-title">{q.title}</div>
              <div className="help-card-go" aria-hidden="true">›</div>
              {admin && (
                <div style={{position:'absolute', right:52, bottom:12, display:'flex', gap:8}}>
                  <button className="icon-btn" title="Редактировать" onClick={()=>openEdit(q)}>
                    <img src={iconEdit} alt="" style={{width:18,height:18}}/>
                  </button>
                  <button className="icon-btn" title="Удалить" onClick={()=>remove(q)}>
                    <img src={iconDelete} alt="" style={{width:18,height:18}}/>
                  </button>
                </div>
              )}
            </div>
          ))}
          {!loading && filtered.length===0 && <div className="help-empty">Ничего не найдено</div>}
        </div>
      </div>

      <ModalEditor
        open={editorOpen}
        onClose={()=>setEditorOpen(false)}
        title={editRow ? 'Редактирование вопроса' : 'Новый вопрос'}
        initialTitle={editRow?.title || ''}
        initialHTML={editRow?.body || ''}
        onSave={onSave}
      />
    </div>
  )
}