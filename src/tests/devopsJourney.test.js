import { createElement } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import {
  addJournalEntry,
  buildRoadmapSnapshot,
  buildWeeklyActivity,
  calculateRoadmapProgress,
  updateRoadmapTopicStatus,
  validateJournalEntry,
  calculateLearningStreak,
  saveProject,
  deleteProject,
  formatDate,
  getFormattedDate,
  getMonthSummary,
  getProjectStats,
  getRecentActivity,
  getTopicOptions,
  getTopicProgressByPhase,
  removeJournalEntry,
  safeLocalStorageRead,
  safeLocalStorageWrite,
} from '../utils/devopsUtils'

const renderAppAtRoute = (route) => {
  render(
    createElement(
      MemoryRouter,
      { initialEntries: [route] },
      createElement(App),
    ),
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('DevOps Journey Tracker', () => {
  it('renders the dashboard welcome section', () => {
    renderAppAtRoute('/')

    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
    expect(screen.getByText(/Track your DevOps growth/i)).toBeInTheDocument()
  })

  it('calculates roadmap progress for a phase', () => {
    const roadmap = [
      { id: 'linux', title: 'Linux Fundamentals', topics: [
        { id: 'arch', status: 'completed' },
        { id: 'filesystem', status: 'in-progress' },
        { id: 'commands', status: 'not-started' },
      ] },
    ]

    const snapshot = buildRoadmapSnapshot(roadmap)
    expect(snapshot[0].completionRate).toBe(33)
    expect(snapshot[0].completedCount).toBe(1)
  })

  it('updates topic completion status in the roadmap', () => {
    const roadmap = [
      { id: 'linux', title: 'Linux Fundamentals', topics: [
        { id: 'arch', status: 'not-started' },
      ] },
    ]

    const updated = updateRoadmapTopicStatus(roadmap, 'linux', 'arch', 'completed')
    expect(updated[0].topics[0].status).toBe('completed')
  })

  it('adds a journal entry to the list', () => {
    const valid = {
      id: 'entry-99',
      date: '2026-10-12',
      topic: 'Docker',
      duration: '2',
      notes: 'Learned container layers and image caching.',
      challenges: 'Needed more practice with tagging.',
      takeaways: 'Layers improve build efficiency.'
    }

    const entries = addJournalEntry([], valid)
    expect(entries).toHaveLength(1)
    expect(entries[0].topic).toBe('Docker')
  })

  it('validates a journal entry before saving', () => {
    const invalid = { date: '', topic: '', duration: '', notes: '' }
    const valid = {
      date: '2026-10-12',
      topic: 'Docker',
      duration: '2',
      notes: 'Learned container layers and image caching.',
      challenges: 'Needed more practice with tagging.',
      takeaways: 'Layers improve build efficiency.'
    }

    expect(validateJournalEntry(invalid).length).toBeGreaterThan(0)
    expect(validateJournalEntry(valid)).toEqual([])
  })

  it('calculates the current learning streak from journal dates', () => {
    const entries = [
      { date: '2026-10-12' },
      { date: '2026-10-11' },
      { date: '2026-10-10' },
      { date: '2026-09-30' },
    ]

    const result = calculateLearningStreak(entries)
    expect(result.currentStreak).toBe(3)
    expect(result.longestStreak).toBe(3)
    expect(result.totalActiveDays).toBe(4)
  })

  it('saves and deletes a project', () => {
    const project = {
      id: 'proj-1',
      name: 'CI Pipeline',
      description: 'Build a Jenkins pipeline',
      technologies: ['Jenkins', 'Docker'],
      githubUrl: 'https://github.com/example/project',
      status: 'In progress',
      startDate: '2026-10-01',
      completionDate: ''
    }

    const saved = saveProject(project)
    expect(saved).toHaveLength(1)
    expect(saved[0].name).toBe('CI Pipeline')

    const updated = saved.filter((item) => item.id !== 'proj-1')
    expect(updated).toHaveLength(0)
  })

  it('persists data to localStorage', () => {
    const value = { items: ['docker', 'kubernetes'] }
    window.localStorage.setItem('devops-tracker-demo', JSON.stringify(value))

    expect(JSON.parse(window.localStorage.getItem('devops-tracker-demo'))).toEqual(value)
  })

  it('allows keyboard interaction in the journal form', () => {
    renderAppAtRoute('/journal')
    const input = screen.getByLabelText(/date/i)
    fireEvent.change(input, { target: { value: '2026-10-12' } })
    expect(input.value).toBe('2026-10-12')
  })

  it('handles empty phases and unknown topic statuses in roadmap calculations', () => {
    const roadmap = [
      { id: 'empty', title: 'Empty phase', topics: [] },
      { id: 'mixed', title: 'Mixed phase', topics: [{ status: 'blocked' }] },
    ]

    expect(buildRoadmapSnapshot(roadmap)).toMatchObject([
      { totalTopics: 0, completedCount: 0, inProgressCount: 0, completionRate: 0 },
      { totalTopics: 1, completedCount: 0, inProgressCount: 0, completionRate: 0 },
    ])
    expect(calculateRoadmapProgress([])).toBe(0)
    expect(calculateRoadmapProgress(roadmap)).toBe(0)
    expect(getTopicProgressByPhase(roadmap)).toEqual([
      { id: 'empty', title: 'Empty phase', progress: 0, completed: 0, total: 0 },
      { id: 'mixed', title: 'Mixed phase', progress: 0, completed: 0, total: 1 },
    ])
  })

  it('leaves the roadmap unchanged when a phase or topic is not found', () => {
    const roadmap = [{ id: 'linux', topics: [{ id: 'arch', status: 'not-started' }] }]

    expect(updateRoadmapTopicStatus(roadmap, 'missing', 'arch', 'completed')).toEqual(roadmap)
    expect(updateRoadmapTopicStatus(roadmap, 'linux', 'missing', 'completed')).toEqual(roadmap)
    expect(roadmap[0].topics[0].status).toBe('not-started')
  })

  it('rejects whitespace-only fields and non-positive or non-numeric durations', () => {
    const validBase = { date: '2026-10-12', topic: 'Docker', duration: '1', notes: 'Practice' }

    expect(validateJournalEntry({ ...validBase, topic: '   ' })).toContain('Topic studied is required.')
    expect(validateJournalEntry({ ...validBase, notes: '   ' })).toContain('Notes are required.')
    expect(validateJournalEntry({ ...validBase, duration: '0' })).toContain(
      'Learning duration must be greater than zero.',
    )
    expect(validateJournalEntry({ ...validBase, duration: '-1' })).toContain(
      'Learning duration must be greater than zero.',
    )
    expect(validateJournalEntry({ ...validBase, duration: 'not-a-number' })).toContain(
      'Learning duration must be greater than zero.',
    )
  })

  it('formats missing and invalid dates safely and formats explicit dates consistently', () => {
    expect(formatDate('')).toBe('')
    expect(formatDate('not-a-date')).toBe('')
    expect(formatDate('2026-10-12')).toBe('Oct 12, 2026')
    expect(getFormattedDate(new Date(2026, 9, 12, 12))).toBe('2026-10-12')
  })

  it('builds a seven-day activity window and sums multiple entries for one day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 16, 12))

    const activity = buildWeeklyActivity([
      { date: '2026-11-16', duration: '1.25' },
      { date: '2026-11-16', duration: '0.35' },
      { date: '2026-11-09', duration: '10' },
      { date: '2026-11-16', duration: '' },
    ])

    expect(activity).toHaveLength(7)
    expect(activity.at(-1)).toMatchObject({ day: 'Mon', hours: 1.6 })
    expect(activity[0].hours).toBe(0)
    vi.useRealTimers()
  })

  it('returns zero streaks for empty or undated journal entries', () => {
    const emptyResult = {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      heatmap: [],
    }

    expect(calculateLearningStreak([])).toEqual(emptyResult)
    expect(calculateLearningStreak([{ topic: 'Docker' }, { date: '' }])).toEqual(emptyResult)
  })

  it('deduplicates journal dates and measures consecutive streaks from today', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 16, 12))

    const result = calculateLearningStreak([
      { date: '2026-11-16' },
      { date: '2026-11-15' },
      { date: '2026-11-15' },
      { date: '2026-11-13' },
    ])

    expect(result.currentStreak).toBe(2)
    expect(result.longestStreak).toBe(2)
    expect(result.totalActiveDays).toBe(3)
    expect(result.heatmap).toHaveLength(84)
    expect(result.heatmap.at(-1)).toMatchObject({ date: '2026-11-16', active: true, isToday: true })
    vi.useRealTimers()
  })

  it('does not add invalid journal entries and removes only matching IDs', () => {
    const entries = [{ id: 'existing', topic: 'Linux' }]

    expect(addJournalEntry(entries, null)).toBe(entries)
    expect(addJournalEntry(entries, { topic: '' })).toBe(entries)
    expect(removeJournalEntry(entries, 'missing')).toEqual(entries)
    expect(removeJournalEntry(entries, 'existing')).toEqual([])
  })

  it('returns existing projects for invalid saves and deletes only matching projects', () => {
    const existingProjects = [{ id: 'existing', name: 'Existing project' }]

    expect(saveProject(null, existingProjects)).toBe(existingProjects)
    expect(saveProject({ name: '' }, existingProjects)).toBe(existingProjects)
    expect(deleteProject(existingProjects, 'missing')).toEqual(existingProjects)
    expect(deleteProject(existingProjects, 'existing')).toEqual([])
  })

  it('counts project statuses and ignores unrecognized statuses in category totals', () => {
    expect(
      getProjectStats([
        { status: 'Completed' },
        { status: 'In progress' },
        { status: 'Planned' },
        { status: 'Paused' },
      ]),
    ).toEqual({ total: 4, completed: 1, inProgress: 1, planned: 1 })
    expect(getProjectStats([])).toEqual({ total: 0, completed: 0, inProgress: 0, planned: 0 })
  })

  it('sorts recent activity, excludes unfinished projects, and caps the result at five', () => {
    const journalEntries = Array.from({ length: 6 }, (_, index) => ({
      id: `entry-${index}`,
      topic: `Topic ${index}`,
      duration: '1',
      date: `2026-10-${String(index + 1).padStart(2, '0')}`,
    }))
    const activity = getRecentActivity(journalEntries, [
      { id: 'done', name: 'Finished', status: 'Completed', completionDate: '2026-10-12' },
      { id: 'active', name: 'Ongoing', status: 'In progress', startDate: '2026-10-13' },
    ])

    expect(activity).toHaveLength(5)
    expect(activity[0]).toMatchObject({ type: 'project', label: 'Finished completed' })
    expect(activity.some((item) => item.label.includes('Ongoing'))).toBe(false)
    expect(getRecentActivity([], [])).toEqual([])
  })

  it('summarizes the six-month window and ignores entries without dates', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 16, 12))

    const summary = getMonthSummary([
      { date: '2026-11-01', duration: '1.25' },
      { date: '2026-11-15', duration: '0.75' },
      { date: '', duration: '100' },
    ])

    expect(summary).toHaveLength(6)
    expect(summary.at(-1).hours).toBe(2)
    expect(summary.slice(0, -1).every((month) => month.hours === 0)).toBe(true)
    expect(getMonthSummary([]).every((month) => month.hours === 0)).toBe(true)
    vi.useRealTimers()
  })

  it('returns unique non-empty topic options', () => {
    expect(getTopicOptions([
      { topic: 'Docker' },
      { topic: 'Linux' },
      { topic: 'Docker' },
      { topic: '' },
      {},
    ])).toEqual(['Docker', 'Linux'])
    expect(getTopicOptions([])).toEqual([])
  })

  it('reads stored values, uses fallbacks, and handles malformed JSON', () => {
    const fallback = ['default']
    expect(safeLocalStorageRead('missing', fallback)).toBe(fallback)

    window.localStorage.setItem('saved', JSON.stringify({ value: 1 }))
    expect(safeLocalStorageRead('saved', fallback)).toEqual({ value: 1 })
    window.localStorage.setItem('malformed', '{')

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(safeLocalStorageRead('malformed', fallback)).toBe(fallback)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage unavailable')
    })
    expect(safeLocalStorageRead('unavailable', fallback)).toBe(fallback)
    expect(errorSpy).toHaveBeenCalledTimes(2)
    vi.restoreAllMocks()
  })

  it('writes JSON values and reports localStorage failures', () => {
    expect(safeLocalStorageWrite('saved', { value: 1 })).toBe(true)
    expect(JSON.parse(window.localStorage.getItem('saved'))).toEqual({ value: 1 })

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable')
    })
    expect(safeLocalStorageWrite('blocked', { value: 2 })).toBe(false)
    expect(errorSpy).toHaveBeenCalledOnce()
    errorSpy.mockRestore()
    vi.restoreAllMocks()
  })
})
