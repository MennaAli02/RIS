import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { CalendarClock, ScanLine, Users, Stethoscope, Microscope, FileText, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

const NAV_SECTIONS = [
  {
    items: [
      { to: '/appointments', label: 'Appointment', icon: CalendarClock },
      { to: '/management', label: 'WorkList', icon: ScanLine },
    ],
  },
  {
    title: 'CRM',
    items: [
      { to: '/patients', label: 'Patients', icon: Users },
      { to: '/doctors', label: 'Doctors', icon: Stethoscope },
      { to: '/radiographers', label: 'Radiographers', icon: Microscope },
    ],
  },
  {
    items: [{ to: '/document-templates', label: 'Document Templates', icon: FileText }],
  },
]

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen flex">
      <aside
        className={[
          'bg-brand-700 text-white flex-shrink-0 flex flex-col transition-all duration-200',
          collapsed ? 'w-16' : 'w-64',
        ].join(' ')}
      >
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2">
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-base font-bold leading-tight">Appointment</h1>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex-shrink-0 h-7 w-7 flex items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-4">
          {NAV_SECTIONS.map((section, i) => (
            <div key={i} className="space-y-1">
              {section.title && !collapsed && (
                <p className="px-3 pt-2 pb-1 text-xs font-bold uppercase tracking-wider text-white/40">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors',
                        collapsed ? 'justify-center' : '',
                        isActive ? 'bg-white text-brand-700' : 'text-white/85 hover:bg-white/10',
                      ].join(' ')
                    }
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

      </aside>
      <main className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
