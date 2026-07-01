import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../../data/DataContext'
import { TextField, TextAreaField, SelectField, CheckboxField, BinaryField } from '../../components/ui/fields'
import { FILE_TYPE_OPTIONS } from '../../data/seed'

const EMPTY = {
  name: '',
  fileName: '',
  fileType: '',
  description: '',
  active: true,
  userId: null,
}

function deriveFileType(fileName) {
  if (!fileName) return ''
  const ext = fileName.split('.').pop().toLowerCase()
  if (['doc', 'docx', 'odt'].includes(ext)) return 'docx'
  if (['xls', 'xlsx', 'ods'].includes(ext)) return 'xlsx'
  if (['ppt', 'pptx', 'odp'].includes(ext)) return 'pptx'
  return ''
}

export default function DocumentTemplateForm() {
  const { id } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const { getById, create, update, remove } = useData()

  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isNew) {
      const rec = getById('documentTemplates', id)
      if (rec) setForm(rec)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  const handleFileChange = (fileName) => {
    setForm((f) => ({ ...f, fileName, fileType: deriveFileType(fileName) }))
  }

  const handleSave = () => {
    if (!form.name?.trim()) {
      setError('Template Name is required.')
      return
    }
    if (!form.fileName) {
      setError('Template File is required.')
      return
    }
    setError('')
    if (isNew) {
      const created = create('documentTemplates', form)
      navigate(`/document-templates/${created.id}`)
    } else {
      update('documentTemplates', id, form)
    }
  }

  const handleDelete = () => {
    if (!isNew && confirm('Delete this document template?')) {
      remove('documentTemplates', id)
      navigate('/document-templates')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/document-templates')} className="text-sm text-brand-700 hover:underline">
          ← Back to Document Templates
        </button>
        <div className="flex gap-2">
          {!isNew && (
            <button onClick={handleDelete} className="px-4 py-2 rounded-md text-sm font-semibold bg-red-100 text-red-700">
              Delete
            </button>
          )}
          <button onClick={handleSave} className="px-4 py-2 rounded-md text-sm font-semibold bg-brand-500 text-white">
            Save
          </button>
        </div>
      </div>

      <div className="section-card max-w-3xl">
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          <TextField label="Template Name" value={form.name} onChange={set('name')} />
          <SelectField label="File Type" value={form.fileType} onChange={() => {}} options={FILE_TYPE_OPTIONS} disabled placeholder="—" />
          <BinaryField label="Template File" fileName={form.fileName} onChange={handleFileChange} />
          <CheckboxField label="Active" checked={form.active} onChange={set('active')} />
        </div>
        <div className="mt-3">
          <TextAreaField label="Description" value={form.description} onChange={set('description')} rows={4} />
        </div>
      </div>
    </div>
  )
}
