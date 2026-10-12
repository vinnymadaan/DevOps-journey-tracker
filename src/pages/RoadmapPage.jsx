import { buildRoadmapSnapshot } from '../utils/devopsUtils'

const statusOptions = [
  { value: 'not-started', label: 'Not started' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
]

function RoadmapPage({ roadmap, onUpdateRoadmap }) {
  const snapshot = buildRoadmapSnapshot(roadmap)

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-orange-400">Learning roadmap</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">DevOps progression map</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Track your knowledge by phase, then update the status of each topic as you build confidence in real-world DevOps workflows.
        </p>
      </section>

      <div className="space-y-5">
        {snapshot.map((phase) => (
          <section key={phase.id} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">{phase.title}</h3>
                <p className="text-sm text-slate-400">{phase.completedCount}/{phase.totalTopics} topics complete</p>
              </div>
              <div className="w-full max-w-xs">
                <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                  <span>Progress</span>
                  <span>{phase.completionRate}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500"
                    style={{ width: `${phase.completionRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {phase.topics.map((topic) => (
                <div key={topic.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{topic.name}</p>
                    <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                      {topic.status === 'not-started' ? 'New' : topic.status === 'in-progress' ? 'Active' : 'Done'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => {
                      const isSelected = topic.status === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => onUpdateRoadmap(phase.id, topic.id, option.value)}
                          className={`rounded-full border px-2.5 py-1.5 text-xs font-medium transition ${
                            isSelected
                              ? 'border-orange-500 bg-orange-500/15 text-orange-200'
                              : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:text-white'
                          }`}
                        >
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default RoadmapPage
