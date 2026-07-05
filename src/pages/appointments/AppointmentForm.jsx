import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useData } from '../../data/DataContext'
import { computeAge, formatCurrency } from '../../lib/utils'
import {
  TextField,
  NumberField,
  DateField,
  DateTimeField,
  SelectField,
  Many2OneField,
} from '../../components/ui/fields'
import StatusBar from '../../components/ui/StatusBar'
import SectionCard from '../../components/ui/SectionCard'
import Accordion from '../../components/ui/Accordion'
import PatientIdCard from './PatientIdCard'
import BasketTables from './BasketTables'
import {
  STATE_OPTIONS,
  STATE2_OPTIONS,
  STATE_OF_EXAM_OPTIONS,
  PATIENT_CONDITION_OPTIONS,
  PATIENT_TYPE_OPTIONS,
  PATIENT_STATE_OPTIONS,
  GENDER_OPTIONS_CAP,
} from '../../data/seed'

const EMPTY = {
  // patient / id-card
  foreigner: false,
  cardImageName: '',
  patientId: null,
  natId: '',
  passportNumber: '',
  dob: '',
  gender: 'Male',
  phone: '',
  address: '',
  landline: '',
  patientState: 'normal',
  patientType: 'insurance',
  // contract
  contractId: null,
  plansId: null,
  pricelistId: null,
  insurancePlanLineId: null,
  // visit notes
  examReason: '',
  medicalInfo: '',
  description: '',
  otherComments: '',
  // vitals
  weight: 0,
  height: 0,
  temperature: 0,
  bloodSugar: 0,
  bloodPressure: 0,
  // visit info
  examDate: '',
  stateOfExamSelection: '1',
  createUid: null,
  machineId: null,
  cashProductId: null,
  bodyPartModelId: null,
  doctorId: null,
  technicianId: null,
  patientCondition: 'Natural',
  singleAmountFromGeneral: '',
  singleDiscountAmount: 0,
  singleDiscountPercentage: 0,
  accession: '',
  linkedProcedures: [],
  // basket
  consumableServiceIds: [],
  extraServiceIds: [],
  basketLocationId: null,
  // accounting
  companyShare: 0,
  patientShare: 0,
  discountReason1Id: null,
  totalRecordAmountDiscount: 0,
  generalAmountDiscount: 0,
  generalPercentageDiscount: 0,
  cash: 0,
  cashReceipt: '',
  // workflow / meta
  state: '4',
  state2: 'draft',
  reportState: 'partial',
  durationDisplay: '',
  totalDurationDisplay: '',
}

const toOptions = (list, nameKey) => list.map((i) => ({ id: i.id, name: i[nameKey] }))

export default function AppointmentForm() {
  const { id } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const location = useLocation()
  const { getById, getAll, create, update, remove } = useData()

  const [form, setForm] = useState(EMPTY)
  const [showAddProcedure, setShowAddProcedure] = useState(false)
  const [procToAdd, setProcToAdd] = useState('')

  useEffect(() => {
    if (!isNew) {
      const rec = getById('managements', id)
      if (rec) setForm({ ...EMPTY, ...rec })
    } else {
      // Booking from a calendar cell click passes a prefill (exam date /
      // modality / machine) via router state, same as the widget's
      // `default_exam_date` / `default_category_id` context.
      setForm({
        ...EMPTY,
        accession: `ACC-${Date.now().toString().slice(-6)}`,
        createUid: 1,
        ...(location.state || {}),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  const patients = getAll('patients')
  const insuranceCompanies = getAll('insuranceCompanies')
  const insurancePlans = getAll('insurancePlans')
  const pricelists = getAll('pricelists')
  const products = getAll('products')
  const doctors = getAll('doctors')
  const technicians = getAll('technicians')
  const machines = getAll('machines')
  const bodyParts = getAll('bodyParts')
  const discountReasons = getAll('discountReasons')
  const users = getAll('users')

  const age = computeAge(form.dob)
  const bmi = useMemo(() => {
    const h = Number(form.height) / 100
    if (!h) return 0
    return Math.round((Number(form.weight) / (h * h)) * 10) / 10
  }, [form.weight, form.height])

  const handlePatientChange = (patientId) => {
    const patient = patients.find((p) => p.id === patientId)
    setForm((f) => ({
      ...f,
      patientId,
      natId: patient?.natId ?? '',
      passportNumber: patient?.passportNumber ?? '',
      dob: patient?.dob ?? '',
      gender: patient?.gender ?? 'Male',
      phone: patient?.phone ?? '',
      address: patient?.address ?? '',
      contractId: patient?.contractId ?? null,
      plansId: patient?.plansId ?? null,
    }))
  }

  const handleExtract = (kind) => {
    if (kind === 'crop') {
      alert('Manual Crop tool would open here to crop the scanned ID image.')
      return
    }
    if (kind === 'national') {
      setForm((f) => ({
        ...f,
        natId: `2${Math.floor(Math.random() * 9e12).toString().padStart(13, '0')}`,
        dob: '1990-01-01',
        gender: 'Male',
      }))
    } else {
      setForm((f) => ({ ...f, passportNumber: `P${Math.floor(Math.random() * 9e7)}`, dob: '1990-01-01' }))
    }
  }

  const handleProductChange = (productId) => {
    setForm((f) => ({ ...f, cashProductId: productId }))
  }

  const plansOptions = insurancePlans.filter((p) => !form.contractId || p.companyId === form.contractId)

  const examPrice = useMemo(() => products.find((p) => p.id === form.cashProductId)?.price ?? 0, [products, form.cashProductId])

  const addLinkedProcedure = () => {
    if (!procToAdd) return
    const product = products.find((p) => p.id === Number(procToAdd))
    if (!product) return
    setForm((f) => ({
      ...f,
      linkedProcedures: [...f.linkedProcedures, { id: Date.now(), productId: product.id, price: product.price }],
    }))
    setProcToAdd('')
    setShowAddProcedure(false)
  }

  const removeLinkedProcedure = (lineId) => {
    setForm((f) => ({ ...f, linkedProcedures: f.linkedProcedures.filter((p) => p.id !== lineId) }))
  }

  const totalProceduresPrice = examPrice + form.linkedProcedures.reduce((sum, p) => sum + (Number(p.price) || 0), 0)
  const extraItemsAmount = form.extraServiceIds.reduce((sum, l) => sum + (Number(l.extraItemPrice) || 0), 0)

  const totalAmountAfterAll = useMemo(() => {
    return totalProceduresPrice - (Number(form.generalAmountDiscount) || 0) - (Number(form.singleDiscountAmount) || 0)
  }, [totalProceduresPrice, form.generalAmountDiscount, form.singleDiscountAmount])

  const remaining = totalAmountAfterAll - (form.patientType === 'insurance' ? Number(form.companyShare) || 0 : 0) - (Number(form.cash) || 0)

  const accountingDisplay = [
    form.cashProductId && { label: products.find((p) => p.id === form.cashProductId)?.name, price: examPrice },
    ...form.linkedProcedures.map((p) => ({ label: products.find((pr) => pr.id === p.productId)?.name, price: p.price })),
  ].filter(Boolean)

  const registerTags = [form.cashProductId, ...form.linkedProcedures.map((p) => p.productId)]
    .filter(Boolean)
    .map((pid) => products.find((p) => p.id === pid)?.name)
    .filter(Boolean)

  const handleSave = () => {
    const vals = {
      ...form,
      examPrice,
      totalAmountAfterAll,
      remaining,
      extraItemsAmount,
      totalRecordAmountDiscount: form.singleDiscountAmount,
    }
    if (isNew) {
      const created = create('managements', vals)
      navigate(`/appointments/${created.id}`)
    } else {
      update('managements', id, vals)
    }
  }

  const handleDelete = () => {
    if (!isNew && confirm('Delete this appointment?')) {
      remove('managements', id)
      navigate('/appointments')
    }
  }

  const mockPrint = (label) => alert(`${label} would be generated here (no report engine connected).`)

  return (
    <div dir="ltr">
      <div className="flex items-center justify-between mb-4" dir="ltr">
        <button onClick={() => navigate('/appointments')} className="text-sm text-brand-700 hover:underline">
          ← Back to Ris Appointment
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

      <div className="bg-brand-700 rounded-xl p-3 mb-4 flex flex-wrap items-center gap-3" dir="ltr">
        <StatusBar options={STATE2_OPTIONS} value={form.state2} onChange={set('state2')} />
        <StatusBar options={STATE_OPTIONS} value={form.state} onChange={set('state')} />
        <span className="text-white text-sm ml-auto">Duration: {form.durationDisplay || '—'}</span>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => mockPrint('Print Invoice')} className="bg-white text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-md">
            🖨 Print Invoice
          </button>
          <button onClick={() => mockPrint('Print Job Order')} className="bg-white text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-md">
            📄 Print Job Order
          </button>
          <button onClick={() => mockPrint('Print Label')} className="bg-white text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-md">
            🏷 Print Label
          </button>
          <button onClick={() => mockPrint('Apply Template')} className="bg-white text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-md">
            Apply Template
          </button>
        </div>
      </div>

      <PatientIdCard
        foreigner={form.foreigner}
        onForeignerChange={set('foreigner')}
        cardImageName={form.cardImageName}
        onCardImageChange={set('cardImageName')}
        onExtract={handleExtract}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-9 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <SectionCard title="Patient Info">
                <div className="grid grid-cols-2 gap-3">
                  <Many2OneField label="Patient" value={form.patientId} onChange={handlePatientChange} options={toOptions(patients, 'nickname')} className="col-span-2" />
                  {!form.foreigner ? (
                    <TextField label="National ID" value={form.natId} onChange={set('natId')} />
                  ) : (
                    <TextField label="Passport Number" value={form.passportNumber} onChange={set('passportNumber')} />
                  )}
                  <TextField label="Phone" value={form.phone} onChange={set('phone')} />
                  <DateField label="Date of Birth" value={form.dob} onChange={set('dob')} />
                  <NumberField label="Age" value={age} disabled />
                  <SelectField label="Gender" value={form.gender} onChange={set('gender')} options={GENDER_OPTIONS_CAP} />
                  <TextField label="Address" value={form.address} onChange={set('address')} />
                  <TextField label="Landline" value={form.landline} onChange={set('landline')} />
                  <SelectField label="Patient State" value={form.patientState} onChange={set('patientState')} options={PATIENT_STATE_OPTIONS} />
                  <SelectField label="Payment Method" value={form.patientType} onChange={set('patientType')} options={PATIENT_TYPE_OPTIONS} />
                </div>
              </SectionCard>

              {form.patientType !== 'cash' && (
                <SectionCard title="Contract Info">
                  {form.patientType === 'pricelist' ? (
                    <Many2OneField label="Price List" value={form.pricelistId} onChange={set('pricelistId')} options={toOptions(pricelists, 'name')} />
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Many2OneField
                        label="Contract"
                        value={form.contractId}
                        onChange={(v) => setForm((f) => ({ ...f, contractId: v, plansId: null }))}
                        options={toOptions(insuranceCompanies, 'name')}
                      />
                      <Many2OneField label="Plans" value={form.plansId} onChange={set('plansId')} options={toOptions(plansOptions, 'name')} />
                    </div>
                  )}
                </SectionCard>
              )}

              <Accordion title="Visit Notes">
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Exam Reason" value={form.examReason} onChange={set('examReason')} />
                  <TextField label="Medical Info" value={form.medicalInfo} onChange={set('medicalInfo')} />
                  <TextField label="Description" value={form.description} onChange={set('description')} />
                  <TextField label="Other Comments" value={form.otherComments} onChange={set('otherComments')} />
                </div>
              </Accordion>

              <Accordion title="Patient Vital Signs">
                <div className="grid grid-cols-2 gap-3">
                  <NumberField label="Weight (kg)" value={form.weight} onChange={set('weight')} />
                  <NumberField label="Height (cm)" value={form.height} onChange={set('height')} />
                  <NumberField label="BMI" value={bmi} disabled />
                  <NumberField label="Temperature (°C)" value={form.temperature} onChange={set('temperature')} />
                  <NumberField label="Blood Sugar (mg/dL)" value={form.bloodSugar} onChange={set('bloodSugar')} />
                  <NumberField label="Blood Pressure (mg/dL)" value={form.bloodPressure} onChange={set('bloodPressure')} />
                </div>
              </Accordion>
            </div>

            <div className="space-y-4">
              <SectionCard title="Visit Info">
                <div className="grid grid-cols-2 gap-3">
                  <DateTimeField label="Exam Date" value={form.examDate} onChange={set('examDate')} />
                  <SelectField label="State of Exam" value={form.stateOfExamSelection} onChange={set('stateOfExamSelection')} options={STATE_OF_EXAM_OPTIONS} />
                  <Many2OneField label="Created By" value={form.createUid} disabled options={toOptions(users, 'name')} />
                  <Many2OneField label="Machine" value={form.machineId} onChange={set('machineId')} options={toOptions(machines, 'name')} />
                  <Many2OneField label="Procedure" value={form.cashProductId} onChange={handleProductChange} options={toOptions(products, 'name')} />
                  <Many2OneField label="Body Part" value={form.bodyPartModelId} onChange={set('bodyPartModelId')} options={toOptions(bodyParts, 'name')} />
                  <Many2OneField label="Doctor" value={form.doctorId} onChange={set('doctorId')} options={toOptions(doctors, 'partnerName')} />
                  <Many2OneField label="Technician" value={form.technicianId} onChange={set('technicianId')} options={toOptions(technicians, 'partnerName')} />
                  <SelectField label="Patient Condition" value={form.patientCondition} onChange={set('patientCondition')} options={PATIENT_CONDITION_OPTIONS} />
                  <TextField label="Accession" value={form.accession} disabled />
                </div>

                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Single Discount</p>
                  <div className="grid grid-cols-3 gap-3">
                    <TextField label="Gen Discount" value={form.singleAmountFromGeneral} onChange={set('singleAmountFromGeneral')} />
                    <NumberField label="Amount" value={form.singleDiscountAmount} onChange={set('singleDiscountAmount')} />
                    <NumberField label="Percentage" value={form.singleDiscountPercentage} onChange={set('singleDiscountPercentage')} />
                  </div>
                </div>

                <div className="mt-3">
                  <p className="field-label mb-1">Procedures</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {registerTags.length === 0 && <span className="text-xs text-gray-400">None</span>}
                    {registerTags.map((name, i) => (
                      <span key={i} className="bg-brand-100 text-brand-700 text-xs font-medium px-2 py-1 rounded-full">{name}</span>
                    ))}
                  </div>
                  {form.linkedProcedures.length > 0 && (
                    <div className="mb-2 border rounded-md divide-y text-sm">
                      {form.linkedProcedures.map((p) => (
                        <div key={p.id} className="flex justify-between items-center px-3 py-1.5">
                          <span>{products.find((pr) => pr.id === p.productId)?.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{formatCurrency(p.price)}</span>
                            <button type="button" onClick={() => removeLinkedProcedure(p.id)} className="text-red-500 text-xs">✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!showAddProcedure ? (
                    <button type="button" onClick={() => setShowAddProcedure(true)} className="btn w-full bg-gray-100 hover:bg-gray-200 text-sm font-semibold px-3 py-2 rounded-md">
                      + Add Procedure
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <select className="field-input" value={procToAdd} onChange={(e) => setProcToAdd(e.target.value)}>
                        <option value="">Select procedure...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <button type="button" onClick={addLinkedProcedure} className="bg-brand-500 text-white text-sm font-semibold px-3 py-2 rounded-md">Add</button>
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>
          </div>

          {['7', '8'].includes(form.state) && (
            <SectionCard title="Basket Items">
              <BasketTables
                lines={form.consumableServiceIds}
                onLinesChange={set('consumableServiceIds')}
                extraLines={form.extraServiceIds}
                onExtraLinesChange={set('extraServiceIds')}
                basketLocationId={form.basketLocationId}
                onBasketLocationChange={set('basketLocationId')}
              />
            </SectionCard>
          )}
        </div>

        <div className="lg:col-span-3">
          <Accordion title="Checking Account" defaultOpen headerClassName="bg-amber-100">
            <div className="mb-3 text-sm bg-white rounded-md border border-gray-200 divide-y">
              {accountingDisplay.length === 0 && <div className="px-3 py-2 text-gray-400">No services yet</div>}
              {accountingDisplay.map((item, i) => (
                <div key={i} className="flex justify-between px-3 py-1.5">
                  <span>{item.label}</span>
                  <span className="font-semibold">{formatCurrency(item.price)}</span>
                </div>
              ))}
            </div>

            {form.patientType === 'insurance' && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <NumberField label="Company Share" value={form.companyShare} onChange={set('companyShare')} />
                <NumberField label="Patient Share" value={form.patientShare} onChange={set('patientShare')} />
              </div>
            )}

            <hr className="my-3" />

            {form.patientType !== 'insurance' && (
              <>
                <Many2OneField label="Discount Reason" value={form.discountReason1Id} onChange={set('discountReason1Id')} options={toOptions(discountReasons, 'name')} className="mb-3" />
                <NumberField label="Total Service Discount" value={form.totalRecordAmountDiscount} disabled className="mb-3" />
                <div className="grid grid-cols-2 gap-3">
                  <NumberField label="Gen Amount Discount" value={form.generalAmountDiscount} onChange={set('generalAmountDiscount')} disabled={!!form.discountReason1Id} />
                  <NumberField label="Gen % Discount" value={form.generalPercentageDiscount} onChange={set('generalPercentageDiscount')} disabled={!!form.discountReason1Id} />
                </div>
              </>
            )}

            <hr className="my-3" />

            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Total After All" value={totalAmountAfterAll} disabled />
              <NumberField label="Cash (Current Payment)" value={form.cash} onChange={set('cash')} disabled={form.state === '2'} />
              <NumberField label="Extra Items Price" value={extraItemsAmount} disabled />
              <NumberField label="Remaining" value={remaining} disabled />
            </div>
          </Accordion>
        </div>
      </div>
    </div>
  )
}
