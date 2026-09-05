---
name: what-is-it
description: Live project memory, task tracker, and visual wiki. Use when starting work, completing tasks, adding features, or checking architecture.
---

# WHAT-IS-IT: LIVE PROJECT MEMORY & WIKI

Ugg. Agent listen good.
This project uses `@shakthizen/what-is-it` to track tasks, architecture, and UI flows.

## PROJECT CONTEXT:
- **Project Name**: what-is-it
- **Project Type**: `cli`
- **Frameworks**: React, Vite, Tailwind CSS, CLI
- **Binary State File (Primary)**:
  - Relative: `./.what-is-it.bin`
  - Absolute: `/Users/shakthizen/Pearkoder/what-is-it/.what-is-it.bin`
- **Markdown Overview (Mirror)**: `./WHAT_IS_IT.md`
- **Web Dashboard**: Run `npx @shakthizen/what-is-it` to view live dynamic progress, right-rail wiki, and SVG React Flow canvas.

## AGENT GUIDELINES & PROTOCOL (FOLLOW STRICT):

### 1. SESSION START / ORIENTATION:
- ALWAYS run `npx @shakthizen/what-is-it status` first before modifying files or answering architecture questions.
- Inspect the active task under **CURRENT FOCUS (DO NOW)**:
  - **WHY**: Rationale and business value.
  - **WHERE**: Exact file paths, routes, or components to inspect/edit.
  - **HOW**: Recommended technical approach and libraries.
  - **WHEN**: Target milestone or phase.
- If no task is active, check **NEXT QUEUED TASK** or verify priorities with the developer.

### 2. TASK COMPLETION:
- As soon as your code implementation is verified (automated tests pass, static analysis clean):
  `npx @shakthizen/what-is-it task done <task-id>`
- This immediately updates `.what-is-it.bin`, recalculates feature and overall progress %, regenerates `WHAT_IS_IT.md`, and pushes live SSE updates to the browser viewer.

### 3. RECORDING DISCOVERED TASKS (THE 4 W's):
- When you discover bugs, required refactors, or new architectural work, never leave them in chat alone. Persist them:
  `npx @shakthizen/what-is-it task add --feature "<feature-id>" --title "<title>" --why "<rationale>" --how "<implementation>" --where "<file-paths>" --when "<phase>" [--priority high|medium|low|urgent]`

### 4. FEATURE SCOPING:
- When planning a major architectural module or domain:
  `npx @shakthizen/what-is-it feature add --id "<feature-id>" --title "<title>" --desc "<description>" --category "<category>"`

### 5. TASK LISTING, SCHEMA & EXPORT:
- List all tasks with statuses: `npx @shakthizen/what-is-it task list`
- Inspect JSON schema: `npx @shakthizen/what-is-it schema`
- Export raw state: `npx @shakthizen/what-is-it export --format json`
- Bulk import state: `npx @shakthizen/what-is-it import <file.json>`
- Launch web dashboard: `npx @shakthizen/what-is-it`

### 6. DEEP CODEBASE BOOTSTRAP (/what-is-it-init):
- When user runs `/what-is-it-init` in chat:
  1. Deeply analyze this codebase (manifests, routes, components, services, database models).
  2. Formulate real features, tasks with (Why, How, Where, When), multi-page Wiki docs, and React Flow user journeys with SVG mockup frames.
  3. Run `npx @shakthizen/what-is-it schema` if you need the exact JSON schema.
  4. Save the synthesized state to a temporary JSON file (e.g. `scratch/what-is-it-state.json`).
  5. Execute: `npx @shakthizen/what-is-it import scratch/what-is-it-state.json`.
  6. Run `npx @shakthizen/what-is-it status` to confirm.

### 7. CORE TENETS:
- **No Vibe Amnesia**: If it is not recorded in `.what-is-it.bin`, future agent sessions will lose context.
- **Telegraphic Output**: Keep CLI outputs dense and token-efficient to preserve LLM context windows.
- **Keep Fresh**: Always keep memory state aligned with code reality.
