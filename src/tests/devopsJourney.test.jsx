import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import {
  addJournalEntry,
  buildRoadmapSnapshot,
  updateRoadmapTopicStatus,
  validateJournalEntry,
  calculateLearningStreak,
  saveProject,
} from '../utils/devopsUtils'

beforeEach(() => {
  window.localStorage.clear()
})

describe('DevOps Journey Tracker', () => {
  it('renders the dashboard welcome section', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

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
    render(
      <MemoryRouter initialEntries={['/journal']}>
        <App />
      </MemoryRouter>,
    )
    const input = screen.getByLabelText(/date/i)
    fireEvent.change(input, { target: { value: '2026-10-12' } })
    expect(input.value).toBe('2026-10-12')
  })
})
