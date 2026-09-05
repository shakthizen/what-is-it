# Contributing to `what-is-it` 🤝

Thank you for your interest in contributing to `what-is-it`!  
`what-is-it` is an open-source tool built to solve vibe coding amnesia with live project memory, auto-generated visual wikis, and token-efficient AI agent protocols.

---

## 🛠️ Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shakthizen/what-is-it.git
   cd what-is-it
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Run in development mode**:
   ```bash
   # Start Vite dev server for web viewer
   pnpm dev

   # Build TypeScript CLI & Core
   pnpm build:cli
   ```

4. **Run test suite**:
   ```bash
   pnpm test
   ```

---

## 🏗️ Codebase Organization

- `src/core/`:
  - `schema.ts`: TypeScript data structures (Features, Tasks with Why/How/Where/When, Wiki, UserFlows with SVG frames).
  - `storage.ts`: `zlib`-based compressed binary file engine (`.what-is-it.bin`).
  - `scanner.ts`: Codebase scanner and auto-mapper for `what-is-it init`.
  - `markdown.ts`: Clean summary mirror generator for `WHAT_IS_IT.md`.
- `src/cli/`:
  - `index.ts`: Commander CLI entry point.
  - `caveman.ts`: Ultra-dense, token-efficient agent formatting.
  - `skills.ts`: Agent skill & rule installer (`.agents/skills/what-is-it/SKILL.md`).
  - `server.ts`: Lightweight Node HTTP server + SSE broadcaster.
- `src/web/`:
  - React 19 + Tailwind CSS + `@xyflow/react` (React Flow) dashboard.
  - Custom SVG mockup frames (`DesktopFrameNode`, `MobileFrameNode`, `ModalFrameNode`, `ActorNode`).
  - Slide-over UI Specs & Guidelines Drawer.

---

## 🧪 Testing Guidelines

Before opening a PR, ensure all automated tests pass:
```bash
pnpm test
pnpm build
```

---

## 📜 Code of Conduct & License
By contributing to `what-is-it`, you agree that your contributions will be licensed under its [MIT License](./LICENSE).
