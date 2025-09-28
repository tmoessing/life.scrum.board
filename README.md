# Life Scrum Board

A personal life management application built with React, TypeScript, and Vite. Organize your life using Scrum methodologies with stories, sprints, and kanban boards.

## Features

- **Story Management**: Create, edit, and organize life stories
- **Sprint Planning**: Plan your weeks with sprint-based organization
- **Kanban Boards**: Visualize your work with drag-and-drop boards
- **Data Visualization**: Pie charts and burndown/burnup charts
- **Backup & Restore**: Full data export/import functionality
- **Multiple Views**: Sprint, Story Boards, Importance, Planner, and Settings views

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: Jotai
- **Drag & Drop**: @dnd-kit
- **Charts**: Recharts
- **Icons**: Lucide React

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Deployment

This project is set up for automatic deployment to GitHub Pages:

1. Push to the `main` branch
2. GitHub Actions will automatically build and deploy
3. Your app will be available at `https://yourusername.github.io/life-scrum-board`

## Data Storage

All data is stored locally in your browser's localStorage. Use the backup/restore feature in Settings to export your data.

## License

MIT