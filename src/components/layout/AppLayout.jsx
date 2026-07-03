import { NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/appointments', label: 'Ris Appointment', icon: '📅' },
  { to: '/management', label: 'WorkList', icon: '🩻' },
  { to: '/patients', label: 'Patients', icon: '🧑‍🤝‍🧑' },
  { to: '/doctors', label: 'Doctors', icon: '🩺' },
  { to: '/technicians', label: 'Technicians', icon: '🔬' },
  { to: '/document-templates', label: 'Document Templates', icon: '📄' },
]

export default function AppLayout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-brand-700 text-white flex-shrink-0 flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <h1 className="text-lg font-bold">RIS</h1>
          <p className="text-xs text-white/60">Radiology Information System</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive ? 'bg-white text-brand-700' : 'text-white/85 hover:bg-white/10',
                ].join(' ')
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 text-xs text-white/50 border-t border-white/10">
          Local mock data only — no backend connected.
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
