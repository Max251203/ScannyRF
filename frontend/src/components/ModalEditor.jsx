import { useEffect, useRef, useState } from 'react'
import { ensureScripts } from '../utils/scriptLoader'

export default function ModalEditor({
  open, onClose,
  title = 'Редактор',
  initialTitle = '',
  initialHTML = '',
  onSave,
  allowImport = true,
  width = 'min(900px,96vw)',
}) {
  const [locTitle, setLocTitle] = useState(initialTitle || '')
  const areaId = 'editor-' + Math.random().toString(36).slice(2)
  const fileRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setLocTitle(initialTitle || '')
    const urls = ['/Scripts/ckeditor.js', '/Scripts/mammoth.browser.min.js']
    ensureScripts(urls).then(() => {
      if (window.CKEDITOR) {
        window.CKEDITOR.replace(areaId)
        window.CKEDITOR.instances[areaId].setData(initialHTML || '')
      }
    }).catch(err => console.error(err))
    return () => {
      try { window.CKEDITOR?.instances[areaId]?.destroy(true) } catch {}
    }
  }, [open, initialHTML, initialTitle])

  const importFile = async e => {
    const f = e.target.files?.[0]; if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (ext === 'txt') {
      const t = await f.text()
      window.CKEDITOR?.instances[areaId]?.setData(`<p>${t.replace(/\n/g,'<br>')}</p>`)
    } else if (ext === 'docx') {
      if (!window.mammoth) return
      const ab = await f.arrayBuffer()
      const res = await window.mammoth.convertToHtml({ arrayBuffer: ab })
      window.CKEDITOR?.instances[areaId]?.setData(res.value)
    }
    e.target.value = ''
  }

  const handleSave = () => {
    const html = window.CKEDITOR?.instances[areaId]?.getData() || ''
    onSave && onSave({ title: locTitle, html })
  }

  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth: width}}>
        <button className="modal-x" onClick={onClose}>×</button>
        <h3 className="modal-title">{title}</h3>
        <div className="form-row"><input placeholder="Заголовок" value={locTitle} onChange={e => setLocTitle(e.target.value)} /></div>
        <div className="form-row"><textarea id={areaId} style={{width:'100%',height:'360px'}} defaultValue=""/></div>
        <div className="form-row two">
          {allowImport && (
            <label className="btn btn-lite" style={{cursor:'pointer'}}>
              <input ref={fileRef} type="file" hidden accept=".txt,.docx" onChange={importFile}/>
              <span className="label">Загрузить текст (TXT/DOCX)</span>
            </label>
          )}
          <button className="btn" onClick={handleSave}><span className="label">Сохранить</span></button>
        </div>
      </div>
    </div>
  )
}