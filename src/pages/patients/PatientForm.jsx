import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../../data/DataContext'
import { computeAge } from '../../lib/utils'
import { TextField, DateField, SelectField, NumberField } from '../../components/ui/fields'
import { GENDER_OPTIONS_CAP } from '../../data/seed'

const EMPTY = {
  nickname: '',
  firstName: '',
  middleName: '',
  lastName: '',
  dob: '',
  natId: '',
  gender: 'Male',
  phone: '',
  address: '',
  contractId: null,
  plansId: null,
  pid: '',
}

export default function PatientForm() {
  const { id } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const { getById, create, update, remove } = useData()

  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isNew) {
      const rec = getById('patients', id)
      if (rec) setForm(rec)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  const validate = () => {
    if (!form.nickname) return 'Nickname is required.'
    if (form.phone) {
      const digits = form.phone.replace(/\D/g, '')
      if (digits.length !== 11 || !digits.startsWith('01')) {
        return "Phone number must be 11 digits and start with '01'."
      }
    }
    if (form.dob) {
      const dob = new Date(form.dob)
      const today = new Date()
      if (dob > today) return 'Date of birth cannot be in the future.'
      const age = (today - dob) / (1000 * 60 * 60 * 24 * 365.25)
      if (age > 120) return "Patient's age cannot exceed 120 years."
    }
    return ''
  }

  const handleSave = () => {
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setError('')
    const vals = { ...form, phone: form.phone?.replace(/\D/g, '') }
    if (isNew) {
      const seq = Date.now().toString().slice(-4)
      const created = create('patients', { ...vals, pid: vals.pid || `P-${seq}` })
      navigate(`/patients/${created.id}`)
    } else {
      update('patients', id, vals)
    }
  }

  const handleDelete = () => {
    if (!isNew && confirm('Delete this patient?')) {
      remove('patients', id)
      navigate('/patients')
    }
  }

  const age = computeAge(form.dob)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/patients')} className="text-sm text-brand-700 hover:underline">
          ← Back to Patients
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
          <h1 className="text-xl font-bold">🏥 Patient Registration</h1>
          <p className="text-white/80 text-sm mt-1">Complete the form below to register a patient</p>
        </div>
        <div className="section-card !mb-0 !border-0 !rounded-none">
          <div className="section-title">Personal Information</div>
          {error && <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <TextField label="Nickname" value={form.nickname} onChange={set('nickname')} />
            <DateField label="Date Of Birth" value={form.dob} onChange={set('dob')} />
            <TextField label="First Name" value={form.firstName} onChange={set('firstName')} />
            <TextField label="National ID" value={form.natId} onChange={set('natId')} />
            <TextField label="Middle Name" value={form.middleName} onChange={set('middleName')} />
            <SelectField label="Gender" value={form.gender} onChange={set('gender')} options={GENDER_OPTIONS_CAP} />
            <TextField label="Last Name" value={form.lastName} onChange={set('lastName')} />
            <TextField label="Phone Number" value={form.phone} onChange={set('phone')} />
            <NumberField label="Age" value={age} disabled />
            <TextField label="Address" value={form.address} onChange={set('address')} />
          </div>
        </div>
      </div>
    </div>
  )
}
