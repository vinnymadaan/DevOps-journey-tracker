# DevOps Journey Tracker

A modern personal learning dashboard for aspiring DevOps engineers to track study progress, journal daily learning, manage projects, and monitor growth through analytics and roadmap updates.

## Overview

DevOps Journey Tracker is designed as a polished SaaS-style productivity dashboard for structured learning. It helps users organize a DevOps roadmap, track daily progress, assess momentum with a streak system, and keep a portfolio of hands-on projects—without needing any backend or external authentication.

## Features

- Premium dark dashboard inspired by Linear, Vercel, and GitHub
- DevOps roadmap with topic status tracking and automatic progress calculation
- Daily journal with add, edit, delete, search, and date/topic filters
- Hands-on project tracker with filterable cards and status management
- Learning streak tracker with GitHub-style heatmap
- Analytics dashboard powered by real journal activity data
- Browser localStorage persistence for roadmap, journal entries, and projects
- Responsive layout optimized for desktop, tablet, and mobile screens

## Tech Stack

- React
- Vite
- Tailwind CSS
- Lucide React
- Recharts
- React Router
- Vitest
- React Testing Library
- Browser localStorage

## Installation

```bash
npm install
```

## Running locally

```bash
npm run dev -- --host 0.0.0.0
```

Then open the local URL shown in the terminal, typically:

```text
http://localhost:5173/
```

## Running tests

```bash
npm test -- --run
```

## Production build

```bash
npm run build
```

This generates a production-ready `dist` directory.

## Project structure

```text
src/
├── components/
│   └── Layout.jsx
├── data/
│   └── defaultData.js
├── pages/
│   ├── AnalyticsPage.jsx
│   ├── DashboardPage.jsx
│   ├── JournalPage.jsx
│   ├── ProjectsPage.jsx
│   └── RoadmapPage.jsx
├── tests/
│   ├── devopsJourney.test.jsx
│   └── setup.js
├── utils/
│   └── devopsUtils.js
├── App.jsx
├── index.css
├── main.jsx
├── App.css
└── assets/
```

## Notes

- The application uses localStorage for persistence in this v1 release.
- Reset actions are available from the sidebar for quick cleanup during testing.
- No backend or authentication is required.
