# @shakthizen/what-is-it — Architectural Spec & Live Memory

> Live Project Memory, Task Tracker & Interactive Wiki for Vibe Coding

### Live Completion
```text
[██████████████████░░░░░░] 73%
Sub-Features: 30 Total | 22 Implemented | 0 In Progress | 8 Missing Gaps
```

| Attribute | Details |
| :--- | :--- |
| **Project Type** | `cli` |
| **Frameworks / Stack** | `React`, `Vite`, `Tailwind CSS`, `CLI`, `@xyflow/react`, `Commander` |
| **Version** | `v1.1.0` |
| **Last Updated** | 9/6/2026, 4:25:33 PM |
| **Interactive Dashboard** | Run `npx @shakthizen/what-is-it` to open visual Spec Explorer & Graph |

## Features & Sub-Feature Specs

### Core Storage & Schema Engine (🟡 In Progress — `75%`)
*Zlib-compressed binary persistence, schema-driven progress computation, and payload validation.*

| Status | Sub-Feature | Capability (What) | Target Files (Where) | Phase (When) |
| :--- | :--- | :--- | :--- | :--- |
| 🟢 Implemented | **Compressed Binary Persistence** | Reads/writes .what-is-it.bin with a magic header, zlib deflate/inflate, and atomic rename-on-write. | `src/core/storage.ts` | Phase 1 MVP |
| 🟢 Implemented | **Schema-Driven Progress Computation** | computeProgress() derives feature/overall completion from SubFeature.status when subFeatures exist, falling back to legacy Task.status only when they don't. | `src/core/storage.ts` | Phase 1 MVP |
| 🟢 Implemented | **Payload Validation Guard** | validateProjectData() structurally checks incoming JSON (schemaVersion, meta, features[], wiki[], flows[]) before it's ever compressed and written to disk. | `src/core/schema.ts` | Security hardening pass |
| 🔴 Missing | **Atomic Multi-Process File Locking** | Advisory file lock protocol with timeout, auto-retry, and stale-lock eviction. | `src/core/storage.ts` | Not yet scheduled |

### Codebase Scanner & Baseline Synthesis (✅ Completed — `100%`)
*The two-stage model: a fast, honest file-path scan now backs `init`, with a separate deep agent pass for real understanding.*

| Status | Sub-Feature | Capability (What) | Target Files (Where) | Phase (When) |
| :--- | :--- | :--- | :--- | :--- |
| 🟢 Implemented | **Real File-Based Feature Inventory** | synthesizeProjectData() builds features/wiki/flows purely from what scanProject() actually found (real routes/components/services/CLI/core files) instead of a fixed narrative. | `src/core/scanner.ts` | Accuracy rewrite |
| 🟢 Implemented | **Two-Phase Init → Deep-Pass Model** | `init` never fabricates gaps or rationale; `/wii-init` (agent-driven) is the only place real Why/How and `missingDetails` get written. | `src/core/scanner.ts, src/cli/skills.ts` | Accuracy rewrite |

### CLI Command Suite (🟡 In Progress — `50%`)
*init/status/task/feature/export/import/schema/install-skill commands and the default local-dashboard launcher.*

| Status | Sub-Feature | Capability (What) | Target Files (Where) | Phase (When) |
| :--- | :--- | :--- | :--- | :--- |
| 🟢 Implemented | **Command Dispatcher** | Commander.js-based suite: init, status, schema, install-skill, task add/done/list, feature add, export, import. | `src/cli/index.ts` | Phase 1 MVP |
| 🟢 Implemented | **Task ↔ SubFeature Linked Completion** | Task now carries an optional subFeatureId; `task done <id>` flips both the task and its linked SubFeature to implemented. | `src/cli/index.ts, src/core/scanner.ts, src/core/schema.ts` | Progress-tracking fix |
| 🔴 Missing | **Direct Sub-Feature Status CLI Command** | A command like `feature subfeature done <id>` to flip a single SubFeature's status without a full JSON re-import. | `src/cli/index.ts` | Not yet scheduled |
| 🔴 Missing | **Interactive Feature & Milestone CLI Wizard** | Terminal questionnaire for guiding developers through feature/gap definitions interactively. | `src/cli/wizard.ts (does not exist yet)` | Not yet scheduled |

### Multi-Agent Skill & Slash Command Installer (✅ Completed — `100%`)
*Generates SKILL.md, per-IDE slash commands, and the AGENTS.md/CLAUDE.md/.cursorrules onboarding block.*

| Status | Sub-Feature | Capability (What) | Target Files (Where) | Phase (When) |
| :--- | :--- | :--- | :--- | :--- |
| 🟢 Implemented | **Cross-IDE Rule & Slash Command Generator** | Writes .agents/skills/what-is-it/SKILL.md, .agent/workflows/*.md, .claude/commands/*.md, .cursor/rules/what-is-it.mdc, and idempotently updates AGENTS.md/CLAUDE.md/.cursorrules/.windsurfrules/.clinerules via a marker block. | `src/cli/skills.ts` | Phase 1 MVP |
| 🟢 Implemented | **Two-Phase Deep-Analysis Instructions** | The generated /wii-init workflow now explicitly sequences Phase 1 (verify real features/flows, generate mockupSvg per screen) before Phase 2 (flag missing/bugs/security), instead of one flat list. | `src/cli/skills.ts` | Accuracy rewrite |

### Local Web Server & Live Sync (🟡 In Progress — `60%`)
*Zero-dependency HTTP server serving the SPA, a small REST API, and Server-Sent Events for live updates.*

| Status | Sub-Feature | Capability (What) | Target Files (Where) | Phase (When) |
| :--- | :--- | :--- | :--- | :--- |
| 🟢 Implemented | **Static Asset Server, REST API & SSE Broadcast** | Serves the built SPA, GET/POST /api/project, POST /api/task/toggle, and a text/event-stream /api/events channel that broadcasts on every fs.watch change to .what-is-it.bin. | `src/cli/server.ts` | Phase 1 MVP |
| 🟢 Implemented | **Same-Origin Enforcement on /api/*** | Every /api/* request is checked against Origin/Referer; anything not matching this server's own localhost:<port> (or lacking the header entirely, e.g. curl/the CLI) gets a 403. | `src/cli/server.ts` | Security hardening pass |
| 🟢 Implemented | **Request Payload Schema Validation on Write Endpoints** | POST /api/project now runs the body through validateProjectData() and rejects (400) anything that doesn't match before calling saveProjectData(). | `src/cli/server.ts` | Security hardening pass |
| 🔴 Missing | **Automated Test Coverage for Server Security Behavior** | No test file exercises the HTTP server directly — the origin check, payload validation, and SSE broadcast were only verified manually (curl + a live browser CSRF attempt) during this session, not committed as a regression test. | `test/server.test.ts (does not exist yet)` | Not yet scheduled |
| 🔴 Missing | **Client SSE Reconnect with Exponential Backoff** | EventSource reconnect currently relies on the browser's default retry; no backoff or offline banner. | `src/web/App.tsx` | Not yet scheduled |

### Web Dashboard: Feature Spec Explorer (🟡 In Progress — `67%`)
*The default tab — feature/sub-feature cards with 4-W drawers, filters, and a per-feature task checklist.*

| Status | Sub-Feature | Capability (What) | Target Files (Where) | Phase (When) |
| :--- | :--- | :--- | :--- | :--- |
| 🟢 Implemented | **Feature/Sub-Feature Cards with 4-W Detail & Filters** | Search + category/status/role filters over expandable sub-feature cards showing What/Why/How/Where/When and a 'Missing & Planned Gaps' callout. | `src/web/components/ProgressDashboard.tsx` | Feature-spec pivot |
| 🟢 Implemented | **Per-Feature Task Checklist Wired to Live Toggle** | Each feature now renders its linked legacy Tasks as real checkboxes; checking one calls the App-level handleToggleTask, which was previously fully implemented but never passed down to this component — a completely dead code path. | `src/web/components/ProgressDashboard.tsx, src/web/App.tsx` | Progress-tracking fix |
| 🔴 Missing | **Dark/Light Theme Switcher** | Persistent theme toggle; UI is currently dark-only. | `src/web/components/Navbar.tsx` | Not yet scheduled |

### Web Dashboard: Wiki Docs Viewer (✅ Completed — `100%`)
*Sectioned markdown documentation with scroll-spy bookmarks.*

| Status | Sub-Feature | Capability (What) | Target Files (Where) | Phase (When) |
| :--- | :--- | :--- | :--- | :--- |
| 🟢 Implemented | **Markdown Rendering with Scroll-Spy Bookmarks** | marked-based renderer with heading IDs, a left page index, and a right-rail table of contents that highlights on scroll. | `src/web/components/WikiView.tsx` | Phase 1 MVP |
| 🟢 Implemented | **XSS-Sanitized HTML/Link/Image Rendering** | The renderer now escapes raw inline/block HTML tokens and restricts link/image URLs to http/https/mailto before the result ever reaches dangerouslySetInnerHTML. | `src/web/components/WikiView.tsx` | Security hardening pass |

### Web Dashboard: Visual Flow Graph (🟡 In Progress — `67%`)
*React Flow canvas with actor/frame nodes and an inspector drawer, now supporting agent-generated per-screen mockups.*

| Status | Sub-Feature | Capability (What) | Target Files (Where) | Phase (When) |
| :--- | :--- | :--- | :--- | :--- |
| 🟢 Implemented | **React Flow Canvas with Actor/Frame Nodes & Inspector Drawer** | Desktop/mobile/modal frame nodes and actor nodes, connected by edges, with role filtering and a click-to-inspect drawer showing UI guidelines/layout blueprint. | `src/web/components/UserFlowGraph.tsx, src/web/components/Drawer.tsx` | Phase 1 MVP |
| 🟢 Implemented | **Agent-Generated Per-Screen SVG Mockups** | FlowNodeData.mockupSvg lets an agent supply a real, screen-specific inline SVG; frame node components render it (sanitized: scripts/event handlers/unsafe URLs stripped) instead of the generic wireframe template, which remains the fallback when mockupSvg is absent. | `src/web/sanitizeSvg.ts, src/web/components/nodes/*.tsx, src/core/schema.ts` | This session |
| 🔴 Missing | **Mobile Touch Gestures & Minimap Zoom-to-Fit Toggle** | Pinch-zoom/swipe support and a minimap zoom-to-fit control for the canvas. | `src/web/components/UserFlowGraph.tsx` | Not yet scheduled |

### Static Export & GitHub Pages Mode (✅ Completed — `100%`)
*The same SPA bundle can run with no server at all, reading a pre-exported data.json.*

| Status | Sub-Feature | Capability (What) | Target Files (Where) | Phase (When) |
| :--- | :--- | :--- | :--- | :--- |
| 🟢 Implemented | **Static data.json Export with LocalStorage Task Overrides** | scripts/export-static.js snapshots the current binary state to docs/data.json; the SPA falls back to fetching it when /api/project 404s, and persists task toggles to localStorage instead of a server. | `scripts/export-static.js, src/web/App.tsx` | Phase 1 MVP |
| 🟢 Implemented | **Persistent Docs-Mode Navigation** | Switching tabs (Wiki/Graph/Specs) in static/GitHub-Pages mode no longer bounces back to the marketing landing page. | `src/web/App.tsx` | This session |

### Verification & CI (🟡 In Progress — `67%`)
*Automated tests and GitHub Actions workflows.*

| Status | Sub-Feature | Capability (What) | Target Files (Where) | Phase (When) |
| :--- | :--- | :--- | :--- | :--- |
| 🟢 Implemented | **Unit & Integration Test Suite** | 11 tests across storage/scanner/caveman-formatter/skills-installer/binary-security concurrency. | `test/core.test.ts, test/security.test.ts, test/skills.test.ts` | Phase 1 MVP |
| 🟢 Implemented | **GitHub Actions CI (Deploy & Publish)** | deploy.yml and publish.yml workflows exist for GitHub Pages deploy and npm publish. | `.github/workflows/deploy.yml, .github/workflows/publish.yml` | Phase 1 MVP |
| 🔴 Missing | **Headless Visual Regression Tests for the Flow Canvas** | No automated screenshot/interaction tests for the React Flow canvas, drawer, or the new mockupSvg render path. | `test/e2e/canvas.spec.ts (does not exist yet)` | Not yet scheduled |

## Visual User Journeys & Wireframes (1)

- **Developer & Dashboard Viewer Journey** (Role: `Developer / AI Agent, Dashboard Viewer`): How a developer/agent driving the CLI and a human viewing the local dashboard actually move through the three tabs. — *5 screen frames mapped*

---

### Guidelines for Humans & AI Agents
- **For Humans**: Run `npx @shakthizen/what-is-it` in terminal to launch interactive Feature Spec Explorer, Design System Drawer, and SVG Flow Graph.
- **For AI Agents**:
  1. Check status at session start: `npx @shakthizen/what-is-it status`
  2. Read active focus and missing planned gaps before making assumptions
  3. Keep memory fresh and clean up temporary state after updates

*Auto-generated by `@shakthizen/what-is-it` live memory system.*
