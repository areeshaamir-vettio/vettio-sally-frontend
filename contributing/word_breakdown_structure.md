# Selly — Frontend Work Breakdown Structure (Next.js 14, TypeScript)


# Pages

Each page entry includes: Purpose, Primary users, Features (with components), Acceptance criteria, Backend requirements (high-level), Tests.

## 1. Auth (Login / Register / OAuth / MFA)

**Purpose:** Secure entry point for users; smooth onboarding.
**Primary users:** All users (HMs, recruiters, admins)

**Features & Components**

* Login form (Email, password, remember me)
* Registration form (name, org, role, invite codes)
* OAuth buttons modal (Google, MS, GitHub) and redirect UX
* MFA setup and challenge UI (OTP code entry, backup codes)
* Forgot password flow and reset UI

**Acceptance criteria**

* Users can register and authenticate; UI shows correct error/success states.
* Protected routes redirect to login; token expiry shows re-auth flow.
* MFA flows present and can be completed in the UI.

**Backend parts required (high-level)**

* Token-based auth + refresh handling and role info.
* User profile persistence and verification workflow.
* MFA state and push/OTP verification support.

**Tests**

* Unit: form validation, error states.
* Integration: simulated auth success/failure flows.

---

## 2. Home / Hiring Manager Dashboard

**Purpose:** High-level overview of active role requests, shortlists, and alerts.
**Primary users:** Hiring managers, recruiters

**Features & Components**

* Dashboard summary cards (Open roles, Shortlisted, Conversations)
* Recent activity feed (intake completed, candidate imported, outreach responses)
* Quick actions (Start intake, Create campaign, View shortlists)
* Drill-down cards linking to RoleSpec, Candidates, and Calibration

**Acceptance criteria**

* Dashboard loads quickly and shows up-to-date summaries.
* Quick actions open the correct modals/pages.

**Backend parts required (high-level)**

* Aggregated metrics and activity stream generation.
* Permission model to shape visible data per user role.

**Tests**

* Smoke test for dashboard load and card navigation.

---

## 3. Conversational Intake Page (Chat-first role intake)

**Purpose:** Guided conversational flow to capture role requirements.
**Primary users:** Hiring managers, recruiters

**Features & Components**

* Chat window with message list and composer (text, suggestions, quick replies)
* Context panel showing extracted RoleSpec draft (title, skills, outcomes, gaps)
* Clarifying-question highlighted suggestions and missing-info badges
* Save & continue later; session indicator; session resume UI

**Acceptance criteria**

* Conversation persists across reloads; draft RoleSpec updates in real time.
* UI surfaces missing information and suggested clarifying questions.

**Backend parts required (high-level)**

* Multi-turn conversation state store (session persistence, draft RoleSpec snapshots).
* LLM-based extraction and question-generation processes (async/streaming support).
* Messaging transport for streaming responses or push updates.

**Tests**

* Unit tests for composer and message rendering.
* E2E: simulate multi-turn intake with expected RoleSpec updates.

---

## 4. Role Specification Page (View & Edit RoleSpec)

**Purpose:** Review, refine and finalize the role specification produced by intake.
**Primary users:** Hiring managers, recruiters

**Features & Components**

* RoleSpec summary card (title, location, comp band, remote policy)
* Editable sections (skills, outcomes, disqualifiers) with field validation
* Versioning timeline and change diff viewer
* Export (markdown/clipboard) and publish controls

**Acceptance criteria**

* Updates are saved and versioned; UI shows last-updated by whom.
* Export output matches displayed RoleSpec.

**Backend parts required (high-level)**

* Persistent RoleSpec storage with version history and merge/resolution hooks.
* Background tasks to re-run enrichment (e.g., SEO JD generation) when edited.

**Tests**

* Unit: editor validation, optimistic updates.
* Integration: version history navigation.

---

## 5. Candidate Listing & Search Page

**Purpose:** Browse, filter, and shortlist candidates for a role.
**Primary users:** Recruiters, hiring managers

**Features & Components**

* Search bar (natural-language + quick filters) and saved searches
* Candidate list/grid with sortable columns and inline actions (shortlist, tag)
* Bulk actions (export, add to campaign, assign owner)
* Candidate import status and source badges

**Acceptance criteria**

* Search returns results with applied filters; bulk actions operate on selected items.
* Candidate cards show enrichment highlights (skills, tenure, signals).

**Backend parts required (high-level)**

* Search indexing and scoring service (semantic + keyword layers).
* Candidate enrichment pipelines and deduplication services.

**Tests**

* Playwright: search + filter + shortlist flow.

---

## 6. Candidate Profile Page

**Purpose:** Deep dive on a candidate, history, communications, interview notes.
**Primary users:** Recruiters, hiring managers

**Features & Components**

* Profile header (name, current title, contact cues) with quick actions (message, schedule)
* Tabs: Overview, Experience, Communications, Interview notes, Audit trail
* Enrichment panels (skills extraction, leadership signals, risk flags)
* Action panel: Add to shortlist, Start outreach, Schedule interview

**Acceptance criteria**

* Profile loads enriched data; actions trigger appropriate UI flows.
* Audit trail visible and downloadable.

**Backend parts required (high-level)**

* Profile enrichment and aggregation microservices.
* Communication history store with attachments and transcripts.

**Tests**

* Unit: tab navigation and action availability per permissions.

---

## 7. Matching & Top Matches Page

**Purpose:** Show ranked candidate matches with explainable signals.
**Primary users:** Hiring managers, recruiters

**Features & Components**

* Top-3 candidates widget with score breakdown (semantic/keyword/experience)
* Detailed score drilldown and explainability tooltips
* Feedback buttons (keep/close/off) and quick-recalibration prompts

**Acceptance criteria**

* Scores are visible and breakdown explains relative strengths.
* Feedback updates local UI state and shows confirmation.

**Backend parts required (high-level)**

* Matching engine that computes composite scores and incremental explanations.
* Feedback ingestion pipeline to adjust matching model weights.

**Tests**

* E2E: open Top Matches, provide feedback, see UI update.

---

## 8. Calibration & Comparison Page

**Purpose:** Side-by-side compare candidates and capture hiring manager preferences.
**Primary users:** Hiring managers

**Features & Components**

* Multi-card comparison layout (2-up or 3-up) highlighting rubric alignment
* Decision controls with reason selector and quick notes
* Auto-suggested RoleSpec adjustments based on calibration outcomes

**Acceptance criteria**

* Decisions persist; comparison annotations are saved to the role timeline.

**Backend parts required (high-level)**

* Calibration session storage and audit trail.
* Automatic RoleSpec update triggers from aggregated calibration decisions.

**Tests**

* Integration: compare → decision → verify audit entry.

---

## 9. Outreach (Campaign Builder & Messaging Center)

**Purpose:** Create multi-channel campaigns and manage conversations centrally.
**Primary users:** Recruiters

**Features & Components**

* Campaign builder with sequence editor, personalization tokens, and preview
* Messaging center (inbox view) combining email/SMS/WhatsApp threads
* Templates library, scheduling controls, and campaign analytics preview

**Acceptance criteria**

* Campaigns can be composed, previewed, and scheduled; message threads show incoming replies.
* Template tokens render with candidate and role variables in preview.

**Backend parts required (high-level)**

* Message queuing and delivery orchestration supporting channels and schedules.
* Consent checks and compliance gating before sends.

**Tests**

* E2E: create campaign → preview → schedule (mocked delivery).

---

## 10. Compliance & Candidate Consent Page

**Purpose:** Manage candidate consent and legal opt-outs.
**Primary users:** Compliance officers, recruiters

**Features & Components**

* Consent dashboard per candidate with timestamps and source of consent
* Global opt-out lists and bulk consent import/export tools
* Alerts and enforcement UI preventing disallowed sends

**Acceptance criteria**

* Consent changes reflect immediately in outreach builders and prevent sends.

**Backend parts required (high-level)**

* Immutable consent records store and audit logs.
* Enforcement hooks for outreach orchestration.

**Tests**

* Unit: consent denial blocks campaign send in UI.

---

## 11. Interviews & Handoff Page

**Purpose:** Schedule interviews, generate interview packets, and handoff to interviewers.
**Primary users:** Recruiters, hiring managers

**Features & Components**

* Interview scheduling modal with suggested times and calendar integration hints
* Interview packet viewer and export (summary, rubric, candidate attachments)
* Interview status board and feedback collection UI

**Acceptance criteria**

* Schedules created via UI show up in candidate timeline; packets export correctly.

**Backend parts required (high-level)**

* Calendar sync and scheduling queue; packet generation service.

**Tests**

* E2E scheduling → packet generation flow.

---

## 12. Admin / Settings

**Purpose:** Manage org settings, roles, billing, integrations.
**Primary users:** Admins

**Features & Components**

* Organization settings (branding, domains, SSO hints)
* Role & permission management UI
* Integration status and connector management page

**Acceptance criteria**

* Admins can update settings; permission changes immediately affect UI capabilities.

**Backend parts required (high-level)**

* Org-level configuration store, feature flags, and SSO provisioning hooks.

**Tests**

* Unit tests for settings forms; integration for role-change effects.

---

# Cross-cutting concerns (short)

* **State management:** Centralized client cache (React Query) + local persistence for drafts.
* **Validation:** Zod schemas on the client to mirror backend models.
* **Real-time:** WebSocket or SSE clients for intake and notifications.
* **Testing:** Unit + Playwright E2E for core flows (intake → match → outreach).
* **Accessibility & Performance:** Lighthouse monitoring and Axe checks in CI.

---

If this layout looks good, I can now:

1. Convert each Page → Feature into GitHub issues (title, body, ACs, labels).
2. Generate Next.js + TypeScript component skeletons for a chosen page (pick one).
3. Produce a prioritized backlog (ranked by must-have, should-have, nice-to-have) for the frontend team.

Which should I do next?
