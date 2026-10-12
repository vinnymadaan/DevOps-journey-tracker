import { NavLink } from 'react-router-dom'
import { BarChart3, BookOpenText, FolderKanban, House, Map, Flame, RotateCcw } from 'lucide-react'

const navigationItems = [
  { to: '/', label: 'Dashboard', icon: House },
  { to: '/roadmap', label: 'Roadmap', icon: Map },
  { to: '/journal', label: 'Journal', icon: BookOpenText },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

function Layout({ children, onResetData }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-slate-800 bg-slate-900/80 p-4 backdrop-blur lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-lg font-bold text-orange-400 shadow-lg shadow-orange-500/20">
              D
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">DevOps</p>
              <h1 className="text-lg font-semibold text-white">Journey Tracker</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {navigationItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-lg shadow-slate-900/50'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
                }
              >
                <Icon size={18} className="text-orange-400" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-10 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
            <div className="mb-3 flex items-center gap-2 text-orange-300">
              <Flame size={18} />
              <span className="text-sm font-semibold">Streak tracker</span>
            </div>
            <p className="text-xs text-slate-300">
              Update your journal daily to keep momentum and improve consistency.
            </p>
          </div>

          <button
            type="button"
            onClick={onResetData}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:border-orange-500/50 hover:text-white"
          >
            <RotateCcw size={16} className="text-orange-400" />
            Reset data
          </button>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}

export default Layout
