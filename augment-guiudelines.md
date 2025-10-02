# Augment Codegen Guidelines — Minimal, Design-first (Next.js + Figma)

**Purpose:** Lightweight guardrails for Augment to convert Figma screens into clean Next.js pages. This version is simpler: **no `api-spec.json` required**. The agent will fetch as much design data as possible from Figma and generate a high-quality page using best practices, but it will **always ask** before modifying existing repo files.

---

## Mandatory rules

1. **Fetch-first:** The agent must call the Figma MCP tool for the requested node/page and parse the node JSON before generating code.
2. **Do not modify existing files** unless the developer explicitly approves a named diff. By default, create only new files under `app/`, `components/`, `lib/`, `types/`, `public/assets/`.
3. **Ask before backend wiring:** If the generated page contains interactive elements (forms, submit buttons, data lists), the agent must pause and ask the developer whether to:

   * A) mock a backend endpoint and add a typed client stub, or
   * B) generate a client-only stub that returns sample data, or
   * C) skip integration.

The agent must wait for developer confirmation before creating any API-related files.

---

## Output expectations

* **Language:** TypeScript (`.tsx`) by default.
* **Styling:** TailwindCSS utilities preferred. Use inline styles only for absolute positioning or values that cannot map to Tailwind.
* **Structure:** Pages go to `app/{kebab-page}/page.tsx`. Break UI into small components in `components/` with typed props.
* **Design fidelity:** Extract and apply `absoluteBoundingBox`, `fills`, `style` (font size, weight, family), `cornerRadius`, and basic effects. Map colors and spacing into a `design-tokens.ts` file.
* **Assets:** If images are needed, download via Figma images endpoint and place in `public/assets/` (only after confirmation).

---

## Interaction & review flow

1. Agent fetches node JSON and summarizes: pages/frames found, top 10 frames, and a short list of detected interactive elements.
2. Agent asks the developer: "Shall I generate a page named `app/<page>/page.tsx` from node `<nodeId>`?" Developer answers Yes/No.
3. If developer says Yes, agent generates files and **outputs them as code blocks in the chat** and provides a changelog. Agent waits for developer `Approve` to actually write into the repo.

---

## Safe defaults

* If uncertain: generate Server Component (async page) that renders static UI from the node JSON. For interactive behaviors default to client-side stubs.
* Prefer readable, maintainable code over perfect pixel matching. Provide inline comments where mapping decisions were made.

---


