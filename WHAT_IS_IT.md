# @shakthizen/what-is-it — Architectural Spec & Live Memory

> Live Project Memory & Interactive Wiki for Vibe Coding

### Live Completion
```text
[█████████████████░░░░░░░] 72%
Sub-Features: 18 Total | 13 Implemented | 0 In Progress | 5 Missing Gaps
```

| Attribute | Details |
| :--- | :--- |
| **Project Type** | `cli` |
| **Frameworks / Stack** | `React`, `Vite`, `Tailwind CSS`, `CLI` |
| **Version** | `v1.1.0` |
| **Last Updated** | 9/6/2026, 2:45:58 AM |
| **Interactive Dashboard** | Run `npx @shakthizen/what-is-it` to open visual Spec Explorer & Graph |

## Features & Sub-Feature Specs

### Core Storage & Data Engine (🟡 In Progress — `67%`)
*Binary compression persistence, typed domain models, and atomic state synchronization.*

| Status | Sub-Feature | Capability (What) | Target Files (Where) | Phase (When) |
| :--- | :--- | :--- | :--- | :--- |
| 🟢 Implemented | **Compressed Binary State & Storage Engine** | Atomic binary read/write pipeline (.what-is-it.bin) with checksum and fallback decompression. | `src/core/storage.ts` | Phase 1 MVP |
| 🟢 Implemented | **Type-Safe Feature Spec & Contract Validation** | Runtime JSON Schema and compile-time TypeScript models covering all project entities. | `src/core/schema.ts` | Phase 1 MVP |
| 🔴 Missing | **Atomic Multi-Process File Locking** | Advisory file lock protocol with timeout, auto-retry, and stale lock eviction. | `src/core/storage.ts, src/core/lock.ts` | Milestone 2 (Reliability) |

> [!WARNING]
> **What's Missing & Planned Gaps**:
> - Atomic lockfile protocol for concurrent multi-agent write operations
> - State migration engine for forward/backward binary schema compatibility
> **Planned Approach**: Implement advisory file locking before write and add schema version upgrade hooks. (Next Milestone (Sprint 2))

### CLI Tooling & Automation Interface (🟡 In Progress — `75%`)
*Command line utilities, caveman token-efficient status formatting, and scratch cleanup.*

| Status | Sub-Feature | Capability (What) | Target Files (Where) | Phase (When) |
| :--- | :--- | :--- | :--- | :--- |
| 🟢 Implemented | **CLI Command Suite & Terminal Dispatcher** | Comprehensive command line interface with arguments parsing and colored output. | `src/cli/index.ts` | Phase 1 MVP |
| 🟢 Implemented | **Caveman-Style Token-Efficient Status Formatter** | Formatted UGG/GRR caveman status highlighting overall progress, features, and missing gaps. | `src/cli/caveman.ts` | Phase 1 MVP |
| 🟢 Implemented | **Automatic Scratch State Cleaner on Import** | Unlinks temporary scratch json files and deletes empty scratch directories on successful import. | `src/cli/index.ts` | Current Sprint |
| 🔴 Missing | **Interactive Feature & Milestone CLI Prompt Wizard** | Terminal interactive questionnaire for guiding developers through feature gap definitions. | `src/cli/wizard.ts, src/cli/index.ts` | Milestone 3 |

> [!WARNING]
> **What's Missing & Planned Gaps**:
> - Interactive feature scoping wizard with tab auto-completion
> - Background daemon mode with real-time file change notifications
> **Planned Approach**: Add Clack/Enquirer prompts and integrate an optional background fs.watch daemon. (Milestone 3)

### Visual Dashboard & Spec Explorer (🟡 In Progress — `75%`)
*Interactive web dashboard, feature spec viewer, SVG flow graph canvas, and design system inspector.*

| Status | Sub-Feature | Capability (What) | Target Files (Where) | Phase (When) |
| :--- | :--- | :--- | :--- | :--- |
| 🟢 Implemented | **Feature Spec & Architecture Explorer** | Interactive dashboard replacing flat task lists with deep architectural feature cards and gap summaries. | `src/web/components/ProgressDashboard.tsx` | Current Sprint |
| 🟢 Implemented | **Interactive SVG Node Graph & Wireframe Canvas** | Multi-screen UI topology visualization with custom frame renderers and edge connectors. | `src/web/components/UserFlowGraph.tsx` | Phase 1 MVP |
| 🟢 Implemented | **Design System & Component Specs Drawer** | Detailed sliding inspector presenting UI guidelines, state specs (empty, loading, error), and layout blocks. | `src/web/components/Drawer.tsx` | Phase 1 MVP |
| 🔴 Missing | **Dark/Light Theme Switcher & Mobile Gestures** | Persistent theme switching and mobile touch gesture support for the visual canvas. | `src/web/components/ThemeToggle.tsx, src/web/components/UserFlowGraph.tsx` | Milestone 2 |

> [!WARNING]
> **What's Missing & Planned Gaps**:
> - Light / Dark theme toggle with system preference auto-detection
> - Mobile touch gesture gestures and canvas minimap zoom-to-fit toggle
> **Planned Approach**: Add theme context provider and configure React Flow touch gesture handlers. (Milestone 2)

### Data Flow & Real-Time Synchronization (🟡 In Progress — `67%`)
*Embedded HTTP server, Server-Sent Events (SSE) live updates, and resilient state synchronization.*

| Status | Sub-Feature | Capability (What) | Target Files (Where) | Phase (When) |
| :--- | :--- | :--- | :--- | :--- |
| 🟢 Implemented | **Embedded Micro-Server & Static Asset Server** | Local web server mounted on port 3456 serving the visual viewer without external runtime dependencies. | `src/cli/server.ts` | Phase 1 MVP |
| 🟢 Implemented | **Live Server-Sent Events (SSE) Broadcast Pipeline** | Real-time broadcast mechanism pushing updated project state on every CLI mutation. | `src/cli/server.ts` | Phase 1 MVP |
| 🔴 Missing | **Resilient SSE Reconnection with Exponential Backoff** | Robust client-side SSE reconnect protocol with visual disconnection banner and automatic retry. | `src/web/App.tsx, src/web/components/Navbar.tsx` | Milestone 2 |

> [!WARNING]
> **What's Missing & Planned Gaps**:
> - Exponential backoff reconnection interceptor for client EventSource
> - Offline fallback caching when server connection is lost
> **Planned Approach**: Implement exponential backoff in App.tsx EventSource listener with state persistence. (Milestone 2)

### Verification, Docs & Multi-Agent Protocols (🟡 In Progress — `75%`)
*Multi-agent skill installation, synchronized markdown documentation, and automated test suites.*

| Status | Sub-Feature | Capability (What) | Target Files (Where) | Phase (When) |
| :--- | :--- | :--- | :--- | :--- |
| 🟢 Implemented | **Multi-Agent Rules & Skill Generator** | Universal agent onboarding rules installer establishing project memory protocol. | `src/cli/skills.ts` | Phase 1 MVP |
| 🟢 Implemented | **Human-Readable Markdown Overview Mirror** | Formatted markdown document with progress bars, feature tables, and user flow links. | `src/core/markdown.ts` | Phase 1 MVP |
| 🟢 Implemented | **Comprehensive Automated Unit & Integration Tests** | Automated test suite validating storage decompression, integrity checks, and progress calculation. | `test/core.test.ts` | Phase 1 MVP |
| 🔴 Missing | **End-to-End Headless Visual Regression Tests** | Automated visual screenshot comparison and interaction tests for the web viewer. | `test/e2e/canvas.spec.ts` | Milestone 3 |

> [!WARNING]
> **What's Missing & Planned Gaps**:
> - Headless visual regression test suite for React Flow canvas and drawer
> - Continuous integration GitHub Actions workflow for automatic publish
> **Planned Approach**: Configure Playwright test runner and GitHub Actions CI workflow. (Milestone 3)

## Visual User Journeys & Wireframes (1)

- **Primary User & Developer Journey** (Role: `Guest, User & Developer`): End-to-end journey from landing visit, feature spec inspection, visual node graph navigation, to screen blueprint drawer. — *7 screen frames mapped*

---

### Guidelines for Humans & AI Agents
- **For Humans**: Run `npx @shakthizen/what-is-it` in terminal to launch interactive Feature Spec Explorer, Design System Drawer, and SVG Flow Graph.
- **For AI Agents**:
  1. Check status at session start: `npx @shakthizen/what-is-it status`
  2. Read active focus and missing planned gaps before making assumptions
  3. Keep memory fresh and clean up temporary state after updates

*Auto-generated by `@shakthizen/what-is-it` live memory system.*
