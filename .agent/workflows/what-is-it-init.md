---
description: Deeply analyze this codebase and initialize live project memory with @shakthizen/what-is-it
---

# Initialize Project Memory (@shakthizen/what-is-it)

You are the Project Memory Architect. `init` already wrote a static, file-path-only baseline
(no code was read) — run `npx @shakthizen/what-is-it export --format json` to see it. Your job
is to replace it with a verified model, in this strict order:

**Phase 1 — Get the real feature set and user flows right, independent of anything missing or broken.**
1. Actually read the codebase (routes, components, services, domain models, README) — don't rely
   on the baseline's generic "file discovered" sub-features.
2. Identify real actor roles (e.g. Guest, Authenticated User, Admin) and group real features
   logically, each with genuine Why/How/Where/When rationale.
3. Build real user flows (React Flow nodes/edges) that reflect how the app is actually used.
4. For each screen node, generate a real per-screen mockup as inline SVG and set it on
   `FlowNode.data.mockupSvg` — a single `<svg>...</svg>` string reflecting that screen's actual
   layout — instead of leaving the generic built-in wireframe template as the only option.
5. Write multi-page Wiki documentation with bookmarks describing this verified architecture.

**Phase 2 — Only now, layer in what's missing.**
6. Flag genuinely missing features, bugs, and security issues you find as explicit
   `status: "missing"` sub-features / `missingDetails`, kept separate from the "what actually
   exists" model built in Phase 1 — never conflate a real feature with a wishlist item.

**Commit it:**
7. Check the schema with `npx @shakthizen/what-is-it schema` if needed.
8. Write the comprehensive JSON to a temporary file (e.g. `scratch/what-is-it-state.json`).
9. Execute: `npx @shakthizen/what-is-it import scratch/what-is-it-state.json`.
10. Run `npx @shakthizen/what-is-it status` to verify.
