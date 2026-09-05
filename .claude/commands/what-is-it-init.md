---
description: Deeply analyze this codebase and initialize live project memory with @shakthizen/what-is-it
---

# Initialize Project Memory (@shakthizen/what-is-it)

You are the Project Memory Architect.
1. Read the codebase (package manifests, main routes, key components, services, and README).
2. Understand:
   - The product overview & architecture summary
   - Identified actor roles (e.g. Guest, Authenticated User, Admin)
   - Core features grouped logically
   - Key completed and pending tasks with Why, How, Where, and When
   - Multi-page Wiki documentation with bookmarks
   - Visual user flow with vector SVG mockup frames (Desktop, Mobile, Modal)
3. Check the schema with `npx @shakthizen/what-is-it schema`.
4. Formulate the comprehensive JSON and write to a temporary file (e.g. `scratch/what-is-it-state.json`).
5. Execute: `npx @shakthizen/what-is-it import scratch/what-is-it-state.json`.
6. Run `npx @shakthizen/what-is-it status` to verify.
