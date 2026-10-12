import { useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { getProjectStats } from '../utils/devopsUtils'

const emptyForm = {
  name: '',
  description: '',
  technologies: '',
  githubUrl: '',
  status: 'Planned',
  startDate: '',
  completionDate: '',
}

function ProjectsPage({ projects, onSaveProject, onDeleteProject }) {
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState('All')

  const filteredProjects = useMemo(() => {
    if (filter === 'All') {
      return projects
    }

    return projects.filter((project) => project.status === filter)
  }, [projects, filter])

  const stats = getProjectStats(projects)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextProject = {
      ...form,
      id: editingId || crypto.randomUUID?.() || `project-${Date.now()}`,
      technologies: form.technologies
        .split(',')
        .map((technology) => technology.trim())
        .filter(Boolean),
    }

    if (!nextProject.name || !nextProject.description || !nextProject.startDate) {
      return
    }

    onSaveProject(nextProject)
    setForm(emptyForm)
    setEditingId(null)
  }

  const handleEdit = (project) => {
    setForm({
      name: project.name,
      description: project.description,
      technologies: project.technologies.join(', '),
      githubUrl: project.githubUrl,
      status: project.status,
      startDate: project.startDate,
      completionDate: project.completionDate || '',
    })
    setEditingId(project.id)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-orange-400">Project tracker</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Hands-on DevOps builds</h2>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm text-slate-400">Total projects</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm text-slate-400">Completed</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.completed}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm text-slate-400">In progress</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.inProgress}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm text-slate-400">Planned</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.planned}</p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">{editingId ? 'Edit project' : 'Add project'}</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="project-name" className="mb-1.5 block text-sm font-medium text-slate-200">Project name</label>
              <input id="project-name" name="name" value={form.name} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
            </div>

            <div>
              <label htmlFor="project-description" className="mb-1.5 block text-sm font-medium text-slate-200">Description</label>
              <textarea id="project-description" name="description" rows="3" value={form.description} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
            </div>

            <div>
              <label htmlFor="project-tech" className="mb-1.5 block text-sm font-medium text-slate-200">Technologies used</label>
              <input id="project-tech" name="technologies" value={form.technologies} onChange={handleChange} placeholder="Jenkins, Docker, Terraform" className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
            </div>

            <div>
              <label htmlFor="project-github" className="mb-1.5 block text-sm font-medium text-slate-200">GitHub repository URL</label>
              <input id="project-github" name="githubUrl" value={form.githubUrl} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="project-status" className="mb-1.5 block text-sm font-medium text-slate-200">Status</label>
                <select id="project-status" name="status" value={form.status} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none">
                  <option>Planned</option>
                  <option>In progress</option>
                  <option>Completed</option>
                </select>
              </div>

              <div>
                <label htmlFor="project-start" className="mb-1.5 block text-sm font-medium text-slate-200">Start date</label>
                <input id="project-start" type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
              </div>
            </div>

            <div>
              <label htmlFor="project-finish" className="mb-1.5 block text-sm font-medium text-slate-200">Completion date</label>
              <input id="project-finish" type="date" name="completionDate" value={form.completionDate} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="flex-1 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400">
                {editingId ? 'Save project' : 'Add project'}
              </button>
              {editingId ? (
                <button type="button" onClick={() => { setForm(emptyForm); setEditingId(null) }} className="rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm font-semibold text-slate-200">
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </form>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Project board</h3>
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-white focus:border-orange-500 focus:outline-none">
              <option>All</option>
              <option>Planned</option>
              <option>In progress</option>
              <option>Completed</option>
            </select>
          </div>

          <div className="grid gap-4">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <article key={project.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">{project.name}</p>
                      <p className="text-xs text-slate-400">{project.startDate} {project.completionDate ? `• ${project.completionDate}` : ''}</p>
                    </div>
                    <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-200">
                      {project.status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-300">{project.description}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.technologies.map((technology) => (
                      <span key={`${project.id}-${technology}`} className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                        {technology}
                      </span>
                    ))}
                  </div>

                  {project.githubUrl ? (
                    <a href={project.githubUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-orange-300 hover:text-orange-200">
                      View repository
                    </a>
                  ) : null}

                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => handleEdit(project)} className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-200 transition hover:border-orange-500/40 hover:text-white">
                      <Pencil size={14} />
                    </button>
                    <button type="button" onClick={() => onDeleteProject(project.id)} className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-red-300 transition hover:border-red-500/40 hover:text-red-200">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-center text-sm text-slate-400">
                No projects match the current filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectsPage
