---
name: what-is-it
description: Live project memory, task tracker, and visual wiki. Use when starting work, completing tasks, adding features, or checking architecture.
---

# WHAT-IS-IT: LIVE PROJECT MEMORY & WIKI

Ugg. Agent listen good.
This project uses `what-is-it` to track tasks, architecture, and UI flows.
Project state stored in `.what-is-it.bin` (compressed binary).
Overview mirror stored in `WHAT_IS_IT.md`.

## AGENT RULES (FOLLOW STRICT):

1. TASK START:
   Run `npx what-is-it status` first.
   Check active tasks, target files (WHERE), rationale (WHY), and technical approach (HOW).

2. TASK FINISH:
   When work done, run:
   `npx what-is-it task done <task-id>`
   Binary updates. Progress increments. Browser live-reloads via SSE.

3. NEW TASK:
   When new work discovered, run:
   `npx what-is-it task add --feature "<feature-id>" --title "<title>" --why "<why>" --how "<how>" --where "<files>" --when "<phase>"`

4. NEW FEATURE:
   When building major module, run:
   `npx what-is-it feature add --id "<id>" --title "<title>" --desc "<desc>"`

5. VIEW INTERACTIVE DASHBOARD:
   Run `npx what-is-it` to view live dynamic progress, right-rail wiki, and SVG React Flow canvas in browser.

Live memory stops vibe coding amnesia. Always keep state fresh.
