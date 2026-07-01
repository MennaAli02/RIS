import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../../data/DataContext'
import { computeAge } from '../../lib/utils'
import { TextField, DateField, NumberField, RadioField } from '../../components/ui/fields'
import { GENDER_OPTIONS_LOWER } from '../../data/seed'

const EMPTY = {
  partnerName: '',
  specialization: '',
  degree: '',
  phone: '',
  email: '',
  gender: 'male',
  dob: '',
  age: 0,
}

export default function TechnicianForm() {
  const { id } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const { getById, create, update, remove } = useData()

  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isNew) {
      const rec = getById('technicians', id)
      if (rec) setForm(rec)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (form.dob) setForm((f) => ({ ...f, age: computeAge(f.dob) }))
  }, [form.dob])

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  const validate = () => {
    if (!form.partnerName) return 'Name is required. Please select or create a partner.'
    if (!form.specialization?.trim()) return 'Specialization cannot be empty.'
    if (!form.degree?.trim()) return 'Degree cannot be empty.'
    if (!form.phone?.trim()) return 'Phone Number cannot be empty.'
    if (form.email && !form.email.includes('@')) return 'Please enter a valid email address.'
    if (form.age && (form.age < 0 || form.age > 150)) return 'Age must be between 0 and 150.'
    return ''
  }

  const handleSave = () => {
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setError('')
    if (isNew) {
      const created = create('technicians', form)
      navigate(`/technicians/${created.id}`)
    } else {
      update('technicians', id, form)
    }
  }

  const handleDelete = () => {
    if (!isNew && confirm('Delete this technician?')) {
      remove('technicians', id)
      navigate('/technicians')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/technicians')} className="text-sm text-brand-700 hover:underline">
          ← Back to Technicians
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

      <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 max-w-4xl">
        <div className="bg-brand-700 text-white text-center py-5">
          <h1 className="text-xl font-bold">🔬 Technician Registration</h1>
          <p className="text-white/80 text-sm mt-1">Complete the form below to register a new technician</p>
        </div>
        <div className="p-6">
          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}

          <div className="section-card">
            <div className="section-title">Professional Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <TextField label="Name (Partner)" value={form.partnerName} onChange={set('partnerName')} placeholder="اختر أو أنشئ شريك" />
              <TextField label="Phone" value={form.phone} onChange={set('phone')} placeholder="+20 XXX XXX XXXX" />
              <TextField label="Specialization" value={form.specialization} onChange={set('specialization')} placeholder="e.g. Radiology Technician" />
              <TextField label="Email" value={form.email} onChange={set('email')} placeholder="technician@example.com" />
              <TextField label="Degree" value={form.degree} onChange={set('degree')} placeholder="e.g. Diploma, Bachelor" />
            </div>
          </div>

          <div className="section-card">
            <div className="section-title">Personal Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <RadioField label="Gender" value={form.gender} onChange={set('gender')} options={GENDER_OPTIONS_LOWER} />
              <NumberField label="Age (years)" value={form.age} onChange={set('age')} />
              <DateField label="Date of Birth" value={form.dob} onChange={set('dob')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
