---
description: Deeply analyze this codebase and initialize live project memory with @shakthizen/what-is-it
---

# Initialize Project Memory (@shakthizen/what-is-it)

You are the Project Memory Architect. `init` already wrote a static, file-path-only baseline
(no code was read) — run `npx what-is-it export --format json` to see it. Your job
is to replace it with a verified model, in this strict order:

**Phase 1 — Get the real feature set and user flows right, independent of anything missing or broken.**
1. Actually read the codebase (routes, components, services, domain models, README) — don't rely
   on the baseline's generic "file discovered" sub-features.
2. Identify real actor roles (e.g. Guest, Authenticated User, Admin) and group real features
   logically, each with genuine Why/How/Where/When rationale.
3. Build real user flows (React Flow nodes/edges) that reflect how the app is actually used.
4. **Find and enumerate every screen/view in the UI layer — this is mandatory, not a sample of
   a few representative screens.** Do this regardless of what language or UI framework the
   project actually uses: React/Vue/Svelte/Angular components, Flutter widgets (Dart), SwiftUI
   or UIKit views (Swift/Obj-C), Jetpack Compose or XML layouts (Kotlin/Java), WinForms/WPF/
   Avalonia (C#), Qt widgets (C++/Python), server-rendered templates (ERB, Blade, Jinja, etc.),
   or a terminal/TUI's screens. Whatever it is, find it and read it.
5. For **every** screen you found in step 4, generate a real, screen-specific mockup as inline
   SVG and set it on `FlowNode.data.mockupSvg` — a single `<svg>...</svg>` string that actually
   reflects that screen's real layout (its real sections, real text/labels, real structure) —
   not a generic placeholder. The built-in wireframe template is a fallback for screens you
   could not locate source for, not a shortcut for ones you did find.
6. Write multi-page Wiki documentation with bookmarks describing this verified architecture.

**Phase 2 — Only now, layer in what's missing.**
7. Flag genuinely missing features, bugs, and security issues you find as explicit
   `status: "missing"` sub-features / `missingDetails`, kept separate from the "what actually
   exists" model built in Phase 1 — never conflate a real feature with a wishlist item.

**Commit it:**
8. Check the schema with `npx what-is-it schema` if needed.
9. Write the comprehensive JSON to a temporary file (e.g. `scratch/what-is-it-state.json`).
10. Execute: `npx what-is-it import scratch/what-is-it-state.json`.
11. Run `npx what-is-it status` to verify.
