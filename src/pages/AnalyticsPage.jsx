import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { buildWeeklyActivity, getMonthSummary, calculateRoadmapProgress } from '../utils/devopsUtils'

function AnalyticsPage({ journalEntries, projects, roadmap }) {
  const weeklyData = buildWeeklyActivity(journalEntries)
  const monthlyData = getMonthSummary(journalEntries)
  const totalHours = journalEntries.reduce((sum, entry) => sum + Number(entry.duration || 0), 0)
  const completedProjects = projects.filter((project) => project.status === 'Completed').length
  const completedTopics = roadmap.flatMap((phase) => phase.topics).filter((topic) => topic.status === 'completed').length
  const consistency = Math.min(100, Math.round((new Set(journalEntries.map((entry) => entry.date)).size / 30) * 100))

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-orange-400">Analytics</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Learning performance</h2>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm text-slate-400">Total learning hours</p>
          <p className="mt-2 text-2xl font-semibold text-white">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm text-slate-400">Weekly hours</p>
          <p className="mt-2 text-2xl font-semibold text-white">{weeklyData.reduce((sum, item) => sum + item.hours, 0).toFixed(1)}h</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm text-slate-400">Monthly hours</p>
          <p className="mt-2 text-2xl font-semibold text-white">{monthlyData.reduce((sum, item) => sum + item.hours, 0).toFixed(1)}h</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm text-slate-400">Completed topics</p>
          <p className="mt-2 text-2xl font-semibold text-white">{completedTopics}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm text-slate-400">Learning consistency</p>
          <p className="mt-2 text-2xl font-semibold text-white">{consistency}%</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <h3 className="mb-4 text-xl font-semibold text-white">Weekly learning hours</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid stroke="#2f3b4a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="hours" fill="#ff6500" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <h3 className="mb-4 text-xl font-semibold text-white">Monthly trends</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid stroke="#2f3b4a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="hours" stroke="#fb923c" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Roadmap coverage</h3>
          <p className="text-sm text-slate-300">{calculateRoadmapProgress(roadmap)}% complete</p>
        </div>

        <div className="space-y-3">
          {roadmap.map((phase) => {
            const done = phase.topics.filter((topic) => topic.status === 'completed').length
            const percent = Math.round((done / phase.topics.length) * 100)
            return (
              <div key={phase.id}>
                <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
                  <span>{phase.title}</span>
                  <span>{percent}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500" style={{ width: `${percent}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default AnalyticsPage
