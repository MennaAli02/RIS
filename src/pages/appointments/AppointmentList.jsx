import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../data/DataContext'
import Badge from '../../components/ui/Badge'
import { STATE_OPTIONS } from '../../data/seed'
import { formatDateTime } from '../../lib/utils'

// Stand-in for the "Ris Appointment" tree view (ris_tree_view): default
// landing screen for the module, grouped by patient by default (matches the
// view's search_default_group_by_main_ris context).
export default function AppointmentList() {
  const navigate = useNavigate()
  const { getAll } = useData()
  const [query, setQuery] = useState('')
  const [groupByPatient, setGroupByPatient] = useState(true)

  const records = getAll('managements')
  const patients = getAll('patients')
  const machines = getAll('machines')
  const products = getAll('products')
  const doctors = getAll('doctors')
  const users = getAll('users')
  const insurancePlans = getAll('insurancePlans')

  const nameOf = (list, id) => list.find((r) => r.id === id)?.name ?? list.find((r) => r.id === id)?.partnerName ?? '—'
  const stateLabel = (value) => STATE_OPTIONS.find((o) => o.value === value)?.label ?? value

  const rows = useMemo(() => {
    return records.map((r) => {
      const patient = patients.find((p) => p.id === r.patientId)
      return {
        ...r,
        _patient: patient?.nickname ?? '—',
        _patientId: patient?.id ?? null,
        _pid: patient?.pid ?? '—',
        _natId: patient?.natId ?? '—',
        _phone: patient?.phone ?? '—',
        _machine: nameOf(machines, r.machineId),
        _product: nameOf(products, r.cashProductId),
        _plan: insurancePlans.find((p) => p.id === r.plansId)?.name ?? '—',
        _doctor: nameOf(doctors, r.doctorId),
        _createUid: nameOf(users, r.createUid),
      }
    })
  }, [records, patients, machines, products, doctors, users, insurancePlans])

  const filtered = useMemo(() => {
    if (!query.trim()) return rows
    const q = query.toLowerCase()
    return rows.filter((r) => [r._patient, r._pid, r.accession].some((v) => String(v ?? '').toLowerCase().includes(q)))
  }, [rows, query])

  const groups = useMemo(() => {
    if (!groupByPatient) return null
    const map = new Map()
    filtered.forEach((row) => {
      const key = row._patientId ?? 'unknown'
      if (!map.has(key)) map.set(key, { patientId: row._patientId, patientName: row._patient, rows: [] })
      map.get(key).rows.push(row)
    })
    return Array.from(map.values())
  }, [filtered, groupByPatient])

  const columns = [
    { key: '_pid', label: 'PID' },
    { key: '_patient', label: 'Patient' },
    { key: '_natId', label: 'National ID' },
    { key: '_phone', label: 'Phone' },
    { key: '_machine', label: 'Machine' },
    { key: '_product', label: 'Procedure' },
    { key: '_plan', label: 'Insurance Plan' },
    { key: '_doctor', label: 'Doctor' },
    { key: 'examDate', label: 'Exam Date', render: (row) => formatDateTime(row.examDate) },
    { key: '_createUid', label: 'Created By' },
    { key: 'durationDisplay', label: 'Duration' },
    {
      key: 'state',
      label: 'Status',
      render: (row) => <Badge text={stateLabel(row.state)} color={row.state === '2' ? 'success' : 'gray'} />,
    },
    { key: 'totalDurationDisplay', label: 'Total Duration' },
  ]

  const renderTable = (tableRows) => (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 text-gray-600 text-left">
          {columns.map((c) => (
            <th key={c.key} className="px-4 py-2 font-semibold whitespace-nowrap">{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tableRows.map((row) => (
          <tr key={row.id} onClick={() => navigate(`/appointments/${row.id}`)} className="border-t border-gray-100 hover:bg-brand-50 cursor-pointer">
            {columns.map((c) => (
              <td key={c.key} className="px-4 py-2 whitespace-nowrap">{c.render ? c.render(row) : row[c.key]}</td>
            ))}
          </tr>
        ))}
        {tableRows.length === 0 && (
          <tr>
            <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-400">No records found</td>
          </tr>
        )}
      </tbody>
    </table>
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-brand-700">Ris Appointment</h2>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm text-gray-600">
            <input type="checkbox" checked={groupByPatient} onChange={(e) => setGroupByPatient(e.target.checked)} />
            Group by Patient
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="field-input w-56"
          />
          <button
            type="button"
            onClick={() => navigate('/appointments/new')}
            className="bg-brand-500 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-md"
          >
            + New
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {groupByPatient
          ? groups.map((g) => (
              <div key={g.patientId ?? 'unknown'} className="border-b border-gray-200">
                <div className="flex items-center gap-2 bg-brand-50 px-4 py-2">
                  <span className="font-semibold text-brand-700">{g.patientName}</span>
                  <span className="text-xs text-gray-500">({g.rows.length})</span>
                  {g.patientId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/patients/${g.patientId}`)
                      }}
                      className="ml-auto text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full"
                    >
                      ↗ Open Patient
                    </button>
                  )}
                </div>
                {renderTable(g.rows)}
              </div>
            ))
          : renderTable(filtered)}
      </div>
    </div>
  )
}
