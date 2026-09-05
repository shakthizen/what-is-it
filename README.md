# `what-is-it` ⚡

> **Live Project Memory, Task Tracker & Interactive Wiki for Vibe Coding**  
> Eliminates "vibe coding amnesia" by giving both humans and AI agents a persistent, live, self-updating anchor.  
> 🌐 **Live Demo & Built-in Wiki**: [https://shakthizen.github.io/what-is-it/](https://shakthizen.github.io/what-is-it/)

---

## 🎯 The Problem: Vibe Coding Amnesia

When rapidly building with AI agents:
1. **Context Decay**: After 3–5 days, you lose track of what’s built, what’s planned, why decisions were made, and where files live.
2. **The "Separate Wiki" Trap**: Creating a separate web app for documentation quickly gets abandoned because keeping two codebases in sync is too heavy.
3. **Lossy Agent Sessions**: Every new AI agent chat session starts blank, leading to hallucinations, duplicate work, and broken architectural assumptions.

---

## 💡 The `what-is-it` Solution

- 🗜️ **Single Compressed Binary (`.what-is-it.bin`)**: Microscopic (< 15 KB), lightning fast, zero bloat. Stores all features, tasks, wiki docs, and React Flow user journeys.
- 📄 **Simple Markdown Overview (`WHAT_IS_IT.md`)**: Automatically updated on save for clean git diffs and GitHub review.
- 🦴 **Caveman-Style Agent Communication**: Ultra-dense, telegraphic, token-efficient output designed specifically for LLM context windows (`npx what-is-it status`).
- 🖥️ **Instant Interactive Web Dashboard (`npx what-is-it`)**:
  - **Dynamic Progress Bar**: Live completion % + feature-grouped task boards clearly documenting **Why**, **How**, **Where**, and **When**.
  - **Wiki Documentation**: Sectioned, structured documentation with a sticky right-side bookmarks/TOC navigation that highlights on scroll.
  - **Visual Node Graph (React Flow)**: Interactive graph mapping user flows, actor/role actions (Guest, User, Admin), screen states, and vector **SVG Mockup Frames** (Desktop browser, Mobile chassis, Modal dialog) for visual UI guidelines.
  - **Live SSE Sync**: Browser updates in real time whenever an agent marks a task done.
- 🤖 **Auto-Installed Agent Skill (`what-is-it init`)**: Automatically provisions `.agents/skills/what-is-it/SKILL.md` and repository guidelines (`AGENTS.md`) so *every* future agent knows how to keep the memory alive.

---

## 🚀 Quick Start

### 1. Initialize in Any Existing Project
Run inside your project directory:
```bash
npx what-is-it init
```
*`what-is-it` automatically maps your codebase (frameworks, routes, components, git history), creates `.what-is-it.bin`, generates `WHAT_IS_IT.md`, and installs the agent skill.*

### 2. Launch the Interactive Web Dashboard
```bash
npx what-is-it
```
*Opens your browser to `http://localhost:3456` with live SSE updates.*

### 3. Check Live Status (Agent-Friendly Caveman Style)
```bash
npx what-is-it status
```
Output:
```text
UGG. PROJECT: my-app [75% DONE] TYPE: web
TASKS: 3 DONE / 1 ACTIVE / 1 TODO (TOTAL: 5)

FEATURES:
- [100%] Core Architecture (1/1 tasks)
- [100%] UI Screens & Navigation (1/1 tasks)
- [0%] Data & APIs (0/2 tasks)

CURRENT FOCUS (DO NOW):
* [task-3] "Implement user authentication flow"
  WHY:   Enable member access and route protection
  WHERE: src/routes/auth.tsx
  HOW:   JWT cookie session with AuthContext
  WHEN:  Sprint 1 MVP

AGENT COMMANDS:
- Mark done: npx what-is-it task done <id>
- Add task:  npx what-is-it task add --title "..." --why "..." --where "..."
- Open UI:   npx what-is-it
```

---

## 🛠️ CLI Commands

| Command | Description |
| :--- | :--- |
| `what-is-it` / `what-is-it ui` | Launches live interactive browser dashboard (default port: 3456) |
| `what-is-it init [--force]` | Auto-maps project, creates binary, and installs agent skill |
| `what-is-it status` | Prints dense caveman-style project status for agents |
| `what-is-it task done <id>` | Marks task as completed and recalculates progress |
| `what-is-it task add [opts]` | Adds task with `--why`, `--how`, `--where`, `--when` |
| `what-is-it task list` | Lists all tasks with status and locations |
| `what-is-it feature add [opts]`| Creates a new feature category |
| `what-is-it export [--format]` | Dumps state as JSON or Markdown |
| `what-is-it import <file>` | Loads JSON data into `.what-is-it.bin` |

---

## 🎨 Visual SVG Mockup Frames (React Flow)

In the **Visual Graph & UI** tab, screens render as custom vector SVG frames:
- 🖥️ **Desktop Frame**: macOS-style browser window with traffic light buttons, address bar, sidebar navigation, and wireframe layout blocks.
- 📱 **Mobile Frame**: Smartphone chassis with status bar, dynamic island, screen layout, and bottom navigation tabs.
- 🪟 **Modal Frame**: Floating dialog with backdrop blur, title, action buttons, and form wireframes.
- 👤 **Actor Node**: Starting node specifying user role (Guest, Authenticated Member, Admin).
- 📋 **UI Specs Drawer**: Click any frame to inspect design tokens (colors, typography, spacing), responsive layout rules, and interaction guidelines.

---

## 📄 License
MIT © Pearkoder
