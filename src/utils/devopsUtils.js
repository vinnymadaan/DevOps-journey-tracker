export function buildRoadmapSnapshot(roadmap) {
  return roadmap.map((phase) => {
    const totalTopics = phase.topics.length
    const completedCount = phase.topics.filter((topic) => topic.status === 'completed').length
    const inProgressCount = phase.topics.filter((topic) => topic.status === 'in-progress').length
    const completionRate = totalTopics === 0 ? 0 : Math.round((completedCount / totalTopics) * 100)

    return {
      ...phase,
      totalTopics,
      completedCount,
      inProgressCount,
      completionRate,
    }
  })
}

export function calculateRoadmapProgress(roadmap) {
  const allTopics = roadmap.flatMap((phase) => phase.topics)
  if (allTopics.length === 0) {
    return 0
  }

  const completed = allTopics.filter((topic) => topic.status === 'completed').length
  return Math.round((completed / allTopics.length) * 100)
}

export function updateRoadmapTopicStatus(roadmap, phaseId, topicId, nextStatus) {
  return roadmap.map((phase) => {
    if (phase.id !== phaseId) {
      return phase
    }

    return {
      ...phase,
      topics: phase.topics.map((topic) => ({
        ...topic,
        status: topic.id === topicId ? nextStatus : topic.status,
      })),
    }
  })
}

export function validateJournalEntry(entry) {
  const errors = []

  if (!entry.date) {
    errors.push('Date is required.')
  }

  if (!entry.topic || !String(entry.topic).trim()) {
    errors.push('Topic studied is required.')
  }

  if (!entry.duration || Number(entry.duration) <= 0) {
    errors.push('Learning duration must be greater than zero.')
  }

  if (!entry.notes || !String(entry.notes).trim()) {
    errors.push('Notes are required.')
  }

  return errors
}

export function formatDate(dateValue) {
  if (!dateValue) {
    return ''
  }

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getFormattedDate(date = new Date()) {
  const value = new Date(date)
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function buildWeeklyActivity(entries) {
  const days = []
  const now = new Date()

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(now)
    date.setDate(now.getDate() - index)
    const key = getFormattedDate(date)
    const totalHours = entries
      .filter((entry) => entry.date === key)
      .reduce((sum, entry) => sum + Number(entry.duration || 0), 0)

    days.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      hours: Number(totalHours.toFixed(1)),
    })
  }

  return days
}

export function calculateLearningStreak(entries) {
  const dates = [...new Set(entries.filter((entry) => entry.date).map((entry) => entry.date))].sort((a, b) => new Date(b) - new Date(a))

  if (dates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      heatmap: [],
    }
  }

  const sortedDates = [...new Set(dates)].sort((a, b) => new Date(a) - new Date(b))
  let longestStreak = 1
  let currentRun = 1

  for (let index = 1; index < sortedDates.length; index += 1) {
    const previousDate = new Date(sortedDates[index - 1])
    const currentDate = new Date(sortedDates[index])
    const diffDays = Math.round((currentDate - previousDate) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      currentRun += 1
      longestStreak = Math.max(longestStreak, currentRun)
    } else {
      currentRun = 1
    }
  }

  let currentStreak = 0
  let pointer = new Date(dates[0])
  const uniqueDates = new Set(dates)

  while (uniqueDates.has(getFormattedDate(pointer))) {
    currentStreak += 1
    pointer.setDate(pointer.getDate() - 1)
  }

  const today = new Date()
  const startOfHeatmap = new Date(today)
  startOfHeatmap.setDate(today.getDate() - 83)
  const heatmap = []

  for (let index = 0; index < 84; index += 1) {
    const date = new Date(startOfHeatmap)
    date.setDate(startOfHeatmap.getDate() + index)
    const key = getFormattedDate(date)
    const isActive = uniqueDates.has(key)

    heatmap.push({
      date: key,
      active: isActive,
      isToday: key === getFormattedDate(today),
    })
  }

  return {
    currentStreak,
    longestStreak,
    totalActiveDays: sortedDates.length,
    heatmap,
  }
}

export function addJournalEntry(entries, entry) {
  if (!entry || !entry.topic) {
    return entries
  }

  const nextEntry = {
    ...entry,
    id: entry.id || crypto.randomUUID?.() || `entry-${Date.now()}`,
  }

  return [nextEntry, ...entries]
}

export function removeJournalEntry(entries, entryId) {
  return entries.filter((entry) => entry.id !== entryId)
}

export function saveProject(project, existingProjects = []) {
  if (!project || !project.name) {
    return existingProjects
  }

  const nextProjects = [...existingProjects, { ...project, id: project.id || crypto.randomUUID?.() || `project-${Date.now()}` }]
  return nextProjects
}

export function deleteProject(projects, projectId) {
  return projects.filter((project) => project.id !== projectId)
}

export function getProjectStats(projects) {
  const completed = projects.filter((project) => project.status === 'Completed').length
  const inProgress = projects.filter((project) => project.status === 'In progress').length
  const planned = projects.filter((project) => project.status === 'Planned').length

  return {
    total: projects.length,
    completed,
    inProgress,
    planned,
  }
}

export function getRecentActivity(journalEntries, projects) {
  const activities = []

  journalEntries.forEach((entry) => {
    activities.push({
      id: `journal-${entry.id}`,
      type: 'journal',
      label: `${entry.topic} • ${entry.duration}h`,
      date: entry.date,
    })
  })

  projects.forEach((project) => {
    if (project.status === 'Completed') {
      activities.push({
        id: `project-${project.id}`,
        type: 'project',
        label: `${project.name} completed`,
        date: project.completionDate || project.startDate,
      })
    }
  })

  return activities.sort((left, right) => new Date(right.date) - new Date(left.date)).slice(0, 5)
}

export function getTopicProgressByPhase(roadmap) {
  return buildRoadmapSnapshot(roadmap).map((phase) => ({
    id: phase.id,
    title: phase.title,
    progress: phase.completionRate,
    completed: phase.completedCount,
    total: phase.totalTopics,
  }))
}

export function getMonthSummary(entries) {
  const totals = Array.from({ length: 6 }, (_, index) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - index))
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    const hours = entries
      .filter((entry) => {
        if (!entry.date) {
          return false
        }
        const entryDate = new Date(entry.date)
        return `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}` === monthKey
      })
      .reduce((total, entry) => total + Number(entry.duration || 0), 0)

    return {
      name: monthName,
      hours: Number(hours.toFixed(1)),
    }
  })

  return totals
}

export function getTopicOptions(entries) {
  return [...new Set(entries.map((entry) => entry.topic).filter(Boolean))]
}

export function safeLocalStorageRead(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return fallback
    }

    return JSON.parse(raw)
  } catch (error) {
    console.error(`Unable to read localStorage key: ${key}`, error)
    return fallback
  }
}

export function safeLocalStorageWrite(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Unable to write localStorage key: ${key}`, error)
    return false
  }
}
