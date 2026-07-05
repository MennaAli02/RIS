import { useState } from 'react'
import AppointmentList from './AppointmentList'
import RisScheduler from './RisScheduler'

export default function AppointmentHome() {
  const [view, setView] = useState('list')

  return (
    <div>
      <div className="flex gap-1 bg-gray-100 rounded-md p-1 w-fit mb-4">
        <button
          type="button"
          onClick={() => setView('list')}
          className={`px-4 py-1.5 rounded text-sm font-semibold ${view === 'list' ? 'bg-white shadow text-brand-700' : 'text-gray-500'}`}
        >
          📋 List
        </button>
        <button
          type="button"
          onClick={() => setView('calendar')}
          className={`px-4 py-1.5 rounded text-sm font-semibold ${view === 'calendar' ? 'bg-white shadow text-brand-700' : 'text-gray-500'}`}
        >
          🗓 Calendar
        </button>
      </div>

      {view === 'list' ? <AppointmentList /> : <RisScheduler onSwitchToList={() => setView('list')} />}
    </div>
  )
}
