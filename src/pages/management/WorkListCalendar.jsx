import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../data/DataContext'
import { colorForId, isSameDay, startOfWeek } from '../../lib/utils'

const EVENT_LIMIT = 1
const WEEKDAY_LABELS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']

// Stand-in for the plain Odoo <calendar> view used by WorkList
// (operation_calendar): mode="week", hide_time, quick_create="0" (view-only,
// no create-on-click - matches the tree's create="false"), colored by
// patient, with Patient/Doctor filter checkboxes.
export default function WorkListCalendar({ onSwitchToList }) {
  const navigate = useNavigate()
  const { getAll } = useData()

  const managements = getAll('managements')
  const patients = getAll('patients')
  const doctors = getAll('doctors')

  const [scale, setScale] = useState('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [patientFilter, setPatientFilter] = useState(() => new Set(patients.map((p) => p.id)))
  const [doctorFilter, setDoctorFilter] = useState(() => new Set(doctors.map((d) => d.id)))
  const [expanded, setExpanded] = useState(() => new Set())

  const events = useMemo(() => {
    return managements
      .filter((m) => m.examDate)
      .filter((m) => patientFilter.has(m.patientId))
      .filter((m) => !m.doctorId || doctorFilter.has(m.doctorId))
      .map((m) => ({
        ...m,
        _date: new Date(m.examDate),
        _patientName: patients.find((p) => p.id === m.patientId)?.nickname ?? '—',
      }))
  }, [managements, patientFilter, doctorFilter, patients])

  const eventsForDay = (date) => events.filter((ev) => isSameDay(ev._date, date)).sort((a, b) => a._date - b._date)

  const goPrev = () => setCurrentDate((d) => {
    const n = new Date(d)
    if (scale === 'day') n.setDate(n.getDate() - 1)
    else if (scale === 'week') n.setDate(n.getDate() - 7)
    else n.setMonth(n.getMonth() - 1)
    return n
  })
  const goNext = () => setCurrentDate((d) => {
    const n = new Date(d)
    if (scale === 'day') n.setDate(n.getDate() + 1)
    else if (scale === 'week') n.setDate(n.getDate() + 7)
    else n.setMonth(n.getMonth() + 1)
    return n
  })
  const goToday = () => setCurrentDate(new Date())

  const togglePatient = (id) => setPatientFilter((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleDoctor = (id) => setDoctorFilter((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleExpanded = (key) => setExpanded((s) => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n })

  const headerTitle = useMemo(() => {
    if (scale === 'day') return currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    if (scale === 'month') return currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    const s = startOfWeek(currentDate)
    const e = new Date(s)
    e.setDate(s.getDate() + 6)
    return `${s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
  }, [scale, currentDate])

  const renderDayChips = (date, dense) => {
    const dayEvents = eventsForDay(date)
    const key = date.toDateString()
    const isExpanded = expanded.has(key)
    const visible = isExpanded ? dayEvents : dayEvents.slice(0, EVENT_LIMIT)
    const hidden = dayEvents.length - visible.length

    return (
      <div className="space-y-1">
        {visible.map((ev) => (
          <button
            key={ev.id}
            type="button"
            onClick={() => navigate(`/management/${ev.id}`)}
            className="w-full text-left text-xs px-2 py-1 rounded-md text-white truncate block"
            style={{ background: colorForId(ev.patientId) }}
            title={`${ev._patientName} - ${ev._date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`}
          >
            {!dense && <span className="opacity-80 mr-1">{ev._date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>}
            {ev._patientName}
          </button>
        ))}
        {hidden > 0 && (
          <button type="button" onClick={() => toggleExpanded(key)} className="text-xs text-brand-700 font-semibold hover:underline">
            +{hidden} more
          </button>
        )}
        {isExpanded && dayEvents.length > EVENT_LIMIT && (
          <button type="button" onClick={() => toggleExpanded(key)} className="text-xs text-gray-400 hover:underline block">
            show less
          </button>
        )}
      </div>
    )
  }

  const monthGrid = useMemo(() => {
    const first = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const last = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const startPad = (first.getDay() - 6 + 7) % 7
    const days = []
    for (let i = 0; i < startPad; i++) days.push(null)
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), d))
    while (days.length % 7 !== 0) days.push(null)
    const rows = []
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7))
    return rows
  }, [currentDate])

  const weekDays = useMemo(() => {
    const s = startOfWeek(currentDate)
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(s); d.setDate(s.getDate() + i); return d })
  }, [currentDate])

  const today = new Date()

  return (
    <div className="flex gap-4">
      <div className="w-56 flex-shrink-0 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs font-semibold text-gray-500 mb-2">Patients</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {patients.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={patientFilter.has(p.id)} onChange={() => togglePatient(p.id)} />
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: colorForId(p.id) }} />
                {p.nickname}
              </label>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs font-semibold text-gray-500 mb-2">Doctors</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {doctors.map((d) => (
              <label key={d.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={doctorFilter.has(d.id)} onChange={() => toggleDoctor(d.id)} />
                {d.partnerName}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button onClick={goPrev} className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200">‹</button>
            <button onClick={goToday} className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-semibold">Today</button>
            <button onClick={goNext} className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200">›</button>
            <span className="font-bold text-brand-700 ml-2">{headerTitle}</span>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-md p-1">
            {['day', 'week', 'month'].map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`px-3 py-1 rounded text-sm font-semibold capitalize ${scale === s ? 'bg-white shadow text-brand-700' : 'text-gray-500'}`}
              >
                {s}
              </button>
            ))}
            <button onClick={onSwitchToList} className="px-3 py-1 rounded text-sm font-semibold text-gray-500 hover:text-brand-700">
              List
            </button>
          </div>
        </div>

        <div className="p-4">
          {scale === 'day' && (
            <div className="border rounded-lg p-3">
              <p className="font-semibold text-brand-700 mb-2">{currentDate.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              {renderDayChips(currentDate, false)}
              {eventsForDay(currentDate).length === 0 && <p className="text-sm text-gray-400">No bookings</p>}
            </div>
          )}

          {scale === 'week' && (
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((d, i) => (
                <div key={i} className={`border rounded-lg p-2 min-h-[140px] ${isSameDay(d, today) ? 'border-brand-500' : 'border-gray-200'}`}>
                  <p className="text-xs font-semibold text-gray-500 mb-1">{WEEKDAY_LABELS[i]} {d.getDate()}</p>
                  {renderDayChips(d, false)}
                </div>
              ))}
            </div>
          )}

          {scale === 'month' && (
            <div>
              <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 mb-1">
                {WEEKDAY_LABELS.map((w) => <span key={w}>{w}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthGrid.flat().map((d, i) => (
                  <div key={i} className={`border rounded-md p-1 min-h-[90px] ${d && isSameDay(d, today) ? 'border-brand-500' : 'border-gray-100'}`}>
                    {d && (
                      <>
                        <p className="text-xs text-gray-400 mb-1">{d.getDate()}</p>
                        {renderDayChips(d, true)}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
