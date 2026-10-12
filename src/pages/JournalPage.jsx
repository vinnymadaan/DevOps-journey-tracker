import { useMemo, useState } from 'react'
import { Pencil, Search, Trash2 } from 'lucide-react'
import { formatDate, getFormattedDate, getTopicOptions, validateJournalEntry } from '../utils/devopsUtils'

const emptyForm = {
  date: getFormattedDate(),
  topic: '',
  duration: '',
  notes: '',
  challenges: '',
  takeaways: '',
}

function JournalPage({ entries, onSaveEntry, onDeleteEntry }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [topicFilter, setTopicFilter] = useState('all')

  const topicOptions = useMemo(() => getTopicOptions(entries), [entries])

  const filteredEntries = useMemo(() => {
    return [...entries]
      .filter((entry) => {
        const matchesSearch =
          !searchTerm ||
          entry.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.notes.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesDate = !dateFilter || entry.date === dateFilter
        const matchesTopic = topicFilter === 'all' || entry.topic === topicFilter

        return matchesSearch && matchesDate && matchesTopic
      })
      .sort((left, right) => new Date(right.date) - new Date(left.date))
  }, [entries, searchTerm, dateFilter, topicFilter])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextEntry = {
      ...form,
      duration: Number(form.duration),
      id: editingId || crypto.randomUUID?.() || `entry-${Date.now()}`,
    }

    const validationErrors = validateJournalEntry(nextEntry)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    onSaveEntry(nextEntry)
    setForm(emptyForm)
    setErrors([])
    setEditingId(null)
  }

  const handleEdit = (entry) => {
    setForm({
      date: entry.date,
      topic: entry.topic,
      duration: String(entry.duration),
      notes: entry.notes,
      challenges: entry.challenges || '',
      takeaways: entry.takeaways || '',
    })
    setEditingId(entry.id)
    setErrors([])
  }

  const handleDelete = (entryId) => {
    onDeleteEntry(entryId)
    if (editingId === entryId) {
      setForm(emptyForm)
      setEditingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-orange-400">Daily learning journal</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Capture your DevOps progress</h2>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
        <form className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5" onSubmit={handleSubmit}>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">{editingId ? 'Edit entry' : 'Add journal entry'}</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-slate-200">Date</label>
              <input id="date" name="date" type="date" value={form.date} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
            </div>

            <div>
              <label htmlFor="topic" className="mb-1.5 block text-sm font-medium text-slate-200">Topic studied</label>
              <input id="topic" name="topic" value={form.topic} onChange={handleChange} placeholder="Docker, AWS, CI/CD..." className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
            </div>

            <div>
              <label htmlFor="duration" className="mb-1.5 block text-sm font-medium text-slate-200">Learning duration (hours)</label>
              <input id="duration" name="duration" type="number" min="0.5" step="0.5" value={form.duration} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
            </div>

            <div>
              <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-slate-200">Notes</label>
              <textarea id="notes" name="notes" rows="3" value={form.notes} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
            </div>

            <div>
              <label htmlFor="challenges" className="mb-1.5 block text-sm font-medium text-slate-200">Challenges faced</label>
              <textarea id="challenges" name="challenges" rows="2" value={form.challenges} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
            </div>

            <div>
              <label htmlFor="takeaways" className="mb-1.5 block text-sm font-medium text-slate-200">Key takeaways</label>
              <textarea id="takeaways" name="takeaways" rows="2" value={form.takeaways} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
            </div>

            {errors.length > 0 ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {errors.map((error) => <p key={error}>{error}</p>)}
              </div>
            ) : null}

            <div className="flex gap-3">
              <button type="submit" className="flex-1 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400">
                {editingId ? 'Save changes' : 'Add learning log'}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={() => {
                    setForm(emptyForm)
                    setEditingId(null)
                    setErrors([])
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm font-semibold text-slate-200"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </form>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search entries"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 py-2.5 pl-9 pr-3 text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none"
              />
              <select
                value={topicFilter}
                onChange={(event) => setTopicFilter(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="all">All topics</option>
                {topicOptions.map((topic) => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <article key={entry.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">{entry.topic}</p>
                      <p className="text-xs text-slate-400">{formatDate(entry.date)} • {entry.duration} hours</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleEdit(entry)} className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-200 transition hover:border-orange-500/40 hover:text-white">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => handleDelete(entry.id)} className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-red-300 transition hover:border-red-500/40 hover:text-red-200">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-300">
                    <p><span className="font-medium text-white">Notes:</span> {entry.notes}</p>
                    <p><span className="font-medium text-white">Challenges:</span> {entry.challenges || 'No major blockers.'}</p>
                    <p><span className="font-medium text-white">Takeaways:</span> {entry.takeaways || 'No key takeaway captured yet.'}</p>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-center text-sm text-slate-400">
                No journal entries match your current filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JournalPage
