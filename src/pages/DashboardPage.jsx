import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarRange,
  CheckCircle2,
  Flame,
  ListTodo,
  Target,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { buildWeeklyActivity, calculateLearningStreak, calculateRoadmapProgress, getRecentActivity, getTopicProgressByPhase } from '../utils/devopsUtils'

function StatCard({ icon: Icon, label, value, accent, helper }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div className={`rounded-xl p-2 ${accent}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      {helper ? <p className="mt-2 text-xs text-slate-400">{helper}</p> : null}
    </div>
  )
}

function DashboardPage({ roadmap, journalEntries, projects }) {
  const stats = {
    totalLearningDays: new Set(journalEntries.map((entry) => entry.date)).size,
    topicsCompleted: roadmap.flatMap((phase) => phase.topics).filter((topic) => topic.status === 'completed').length,
    currentStreak: calculateLearningStreak(journalEntries).currentStreak,
    projectsCompleted: projects.filter((project) => project.status === 'Completed').length,
    overallRoadmapProgress: calculateRoadmapProgress(roadmap),
  }

  const weeklyActivity = buildWeeklyActivity(journalEntries)
  const roadmapProgress = getTopicProgressByPhase(roadmap)
  const recentActivity = getRecentActivity(journalEntries, projects)
  const streakSummary = calculateLearningStreak(journalEntries)

  const inProgressTopics = roadmap
    .flatMap((phase) => phase.topics.map((topic) => ({ ...topic, phaseTitle: phase.title, phaseId: phase.id })))
    .filter((topic) => topic.status === 'in-progress')
    .slice(0, 4)

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-2xl shadow-slate-950/40">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-orange-400">Welcome back</p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Track your DevOps growth</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })} • Keep your momentum strong and turn everyday learning into a measurable career advantage.
            </p>
          </div>

          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Focus</p>
            <p className="mt-2 text-lg font-semibold text-white">Keep building the pipeline</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={CalendarRange} label="Total learning days" value={stats.totalLearningDays} accent="bg-orange-500" helper="Across your journal entries" />
        <StatCard icon={CheckCircle2} label="Topics completed" value={stats.topicsCompleted} accent="bg-emerald-500" helper="Roadmap milestones reached" />
        <StatCard icon={Flame} label="Current streak" value={`${stats.currentStreak} days`} accent="bg-rose-500" helper="Daily learning habit" />
        <StatCard icon={BriefcaseBusiness} label="Projects completed" value={stats.projectsCompleted} accent="bg-indigo-500" helper="Hands-on deliverables" />
        <StatCard icon={Target} label="Roadmap progress" value={`${stats.overallRoadmapProgress}%`} accent="bg-cyan-500" helper="Overall completion" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-300">Learning activity</p>
              <h3 className="text-xl font-semibold text-white">Weekly hours</h3>
            </div>
            <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-200">
              {weeklyActivity.reduce((sum, item) => sum + item.hours, 0).toFixed(1)}h this week
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyActivity}>
                <defs>
                  <linearGradient id="activityFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#ff6500" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#ff6500" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#263244" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                  }}
                />
                <Area type="monotone" dataKey="hours" stroke="#ff6500" fill="url(#activityFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-300">Momentum</p>
              <h3 className="text-xl font-semibold text-white">Learning streak</h3>
            </div>
            <div className="rounded-full bg-orange-500/10 p-2 text-orange-400">
              <Flame size={18} />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {streakSummary.heatmap.slice(-28).map((cell, index) => (
              <div
                key={`${cell.date}-${index}`}
                className={`h-7 rounded-md border ${
                  cell.active ? 'border-orange-500/30 bg-orange-500/80' : 'border-slate-700 bg-slate-800'
                } ${cell.isToday ? 'ring-1 ring-orange-300' : ''}`}
                title={cell.date}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Current</p>
              <p className="mt-1 text-2xl font-semibold text-white">{streakSummary.currentStreak}d</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Longest</p>
              <p className="mt-1 text-2xl font-semibold text-white">{streakSummary.longestStreak}d</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Active</p>
              <p className="mt-1 text-2xl font-semibold text-white">{streakSummary.totalActiveDays}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-300">Current focus</p>
              <h3 className="text-xl font-semibold text-white">Learning topics</h3>
            </div>
            <Link to="/roadmap" className="flex items-center gap-1 text-sm text-orange-300 hover:text-orange-200">
              View roadmap <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {inProgressTopics.length > 0 ? (
              inProgressTopics.map((topic) => (
                <div key={topic.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">{topic.name}</p>
                      <p className="text-xs text-slate-400">{topic.phaseTitle}</p>
                    </div>
                    <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-200">
                      In progress
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500"
                      style={{
                        width: `${
                          Math.max(
                            12,
                            roadmapProgress.find((phase) => phase.id === topic.phaseId)?.progress || 35,
                          )
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-center text-sm text-slate-400">
                No active topics yet. Start a new learning objective from the roadmap page.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-300">Quick actions</p>
              <h3 className="text-xl font-semibold text-white">Launch next step</h3>
            </div>
          </div>

          <div className="space-y-3">
            <Link to="/journal" className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-left text-white transition hover:border-orange-500/40 hover:bg-slate-900">
              <span className="flex items-center gap-3">
                <BookOpen size={16} className="text-orange-400" />
                Add learning log
              </span>
              <ArrowRight size={16} className="text-slate-400" />
            </Link>
            <Link to="/projects" className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-left text-white transition hover:border-orange-500/40 hover:bg-slate-900">
              <span className="flex items-center gap-3">
                <BriefcaseBusiness size={16} className="text-orange-400" />
                Add project
              </span>
              <ArrowRight size={16} className="text-slate-400" />
            </Link>
            <Link to="/roadmap" className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-left text-white transition hover:border-orange-500/40 hover:bg-slate-900">
              <span className="flex items-center gap-3">
                <ListTodo size={16} className="text-orange-400" />
                Update roadmap progress
              </span>
              <ArrowRight size={16} className="text-slate-400" />
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">Recent activity</p>
            <h3 className="text-xl font-semibold text-white">Latest wins</h3>
          </div>
        </div>

        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-sm">
                <div>
                  <p className="font-medium text-white">{activity.label}</p>
                  <p className="text-xs text-slate-400">{activity.type === 'journal' ? 'Journal entry' : 'Project milestone'}</p>
                </div>
                <span className="text-xs text-slate-300">{new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-center text-sm text-slate-400">
            Add your first learning log to populate your activity timeline.
          </div>
        )}
      </section>
    </div>
  )
}

export default DashboardPage
