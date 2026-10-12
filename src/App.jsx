import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import AnalyticsPage from './pages/AnalyticsPage'
import DashboardPage from './pages/DashboardPage'
import JournalPage from './pages/JournalPage'
import ProjectsPage from './pages/ProjectsPage'
import RoadmapPage from './pages/RoadmapPage'
import { defaultJournalEntries, defaultProjects, roadmapTemplate, STORAGE_KEYS } from './data/defaultData'
import {
  addJournalEntry,
  removeJournalEntry,
  safeLocalStorageRead,
  safeLocalStorageWrite,
  updateRoadmapTopicStatus,
} from './utils/devopsUtils'

function App() {
  const [roadmap, setRoadmap] = useState(() => safeLocalStorageRead(STORAGE_KEYS.roadmap, roadmapTemplate))
  const [journalEntries, setJournalEntries] = useState(() => safeLocalStorageRead(STORAGE_KEYS.journal, defaultJournalEntries))
  const [projects, setProjects] = useState(() => safeLocalStorageRead(STORAGE_KEYS.projects, defaultProjects))

  useEffect(() => {
    safeLocalStorageWrite(STORAGE_KEYS.roadmap, roadmap)
  }, [roadmap])

  useEffect(() => {
    safeLocalStorageWrite(STORAGE_KEYS.journal, journalEntries)
  }, [journalEntries])

  useEffect(() => {
    safeLocalStorageWrite(STORAGE_KEYS.projects, projects)
  }, [projects])

  const handleRoadmapUpdate = (phaseId, topicId, nextStatus) => {
    setRoadmap((currentRoadmap) => updateRoadmapTopicStatus(currentRoadmap, phaseId, topicId, nextStatus))
  }

  const handleJournalSave = (entry) => {
    setJournalEntries((currentEntries) => {
      const exists = currentEntries.some((item) => item.id === entry.id)

      if (exists) {
        return currentEntries.map((item) => (item.id === entry.id ? { ...item, ...entry } : item))
      }

      return addJournalEntry(currentEntries, entry)
    })
  }

  const handleJournalDelete = (entryId) => {
    setJournalEntries((currentEntries) => removeJournalEntry(currentEntries, entryId))
  }

  const handleProjectSave = (project) => {
    setProjects((currentProjects) => {
      const exists = currentProjects.some((item) => item.id === project.id)

      if (exists) {
        return currentProjects.map((item) => (item.id === project.id ? { ...item, ...project } : item))
      }

      return [{ ...project, id: project.id || crypto.randomUUID?.() || `project-${Date.now()}` }, ...currentProjects]
    })
  }

  const handleProjectDelete = (projectId) => {
    setProjects((currentProjects) => currentProjects.filter((project) => project.id !== projectId))
  }

  const handleResetData = () => {
    const confirmed = window.confirm('Reset all tracked progress, journal entries, and projects to the default state?')
    if (!confirmed) {
      return
    }

    setRoadmap(roadmapTemplate)
    setJournalEntries(defaultJournalEntries)
    setProjects(defaultProjects)
  }

  return (
    <Layout onResetData={handleResetData}>
      <Routes>
        <Route path="/" element={<DashboardPage roadmap={roadmap} journalEntries={journalEntries} projects={projects} />} />
        <Route path="/roadmap" element={<RoadmapPage roadmap={roadmap} onUpdateRoadmap={handleRoadmapUpdate} />} />
        <Route path="/journal" element={<JournalPage entries={journalEntries} onSaveEntry={handleJournalSave} onDeleteEntry={handleJournalDelete} />} />
        <Route path="/projects" element={<ProjectsPage projects={projects} onSaveProject={handleProjectSave} onDeleteProject={handleProjectDelete} />} />
        <Route path="/analytics" element={<AnalyticsPage journalEntries={journalEntries} projects={projects} roadmap={roadmap} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
