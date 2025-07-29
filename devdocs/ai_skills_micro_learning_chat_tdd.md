# Technical Design Doc – AI‑Skills Micro‑Learning Chat
_Authored by Product Systems Architect (Tech Lead), 19 July 2025 • Reviewed by Design Lead / QA Lead / DevOps Lead_

## 1. TL;DR (Executive Summary)
- **Goal:** Launch a habit‑forming chat platform that upskills knowledge workers on practical AI workflows in five‑minute daily sessions, culminating in shareable certification.
- **Scope (v1):** Mobile (React Native) & web clients, core lesson engine, AI assessment, spaced repetition, streaks, shareable badges, admin dashboard, compliance sandbox.
  - *Out of scope:* Offline playback; VR/AR interfaces; third‑party authoring tooling.
- **Success Metrics:**
  | KPI | Baseline | Target (90 days post‑GA) |
  |-----|----------|--------------------------|
  | Weekly new sign‑ups | 0 | 5 000 |
  | Day‑7 lesson‑streak rate | 0 % | 40 % |
  | Monthly Recurring Revenue | $0 | $100 k |
  | Users sharing badge | 0 % | 25 % |

## 2. Context & Problem Statement
- **Background:** See PRD “AI‑Skills Micro‑Learning Chat” linked to Q3 OKR *Upskill 10 k professionals on AI*. FOMO around AI tooling forces workers to self‑teach in ad‑hoc ways; engagement drops without clear, gamified pathways.
- **Pain Points / Constraints:**
  - Session length ≤ 5 min incl. LLM latency.
  - Lesson accuracy & anti‑hallucination guardrails.
  - SOC 2 trajectory; enterprise data isolation (row‑level security).
- **Stakeholders:** Product, Curriculum, ML Platform, Enterprise Sales, Compliance, Customer Success.

## 3. Proposed Solution (1‑page view)
1. **System Diagram** – *see Fig 1: high‑level component & data flow (client ↔ GraphQL Gateway ↔ micro‑services ↔ LLM proxy ↔ vector DB/PgSQL)*.
2. **Narrative Walkthrough**
   - User completes 60‑s onboarding → preferences stored.
   - Daily scheduler triggers push → user taps, GraphQL *getDailyLesson* returns next step; chat UI streams lesson content via SSE.
   - Inline quiz answers stream back → *submitQuiz*; LLM proxy grades & returns feedback < 2 s.
   - Every 5th lesson → *submitProject* → LLM rubric grading pipeline → score + rubric stored; optional peer review via queue.
   - Track completion → certificate generated → *shareBadge* deep‑links to LinkedIn/Notion.

## 4. Architecture & Components
| Module | Responsibility | Tech | Owner |
|--------|----------------|------|-------|
| **Client App** | React Native & web PWA, chat UI, local cache | TS/React, Expo, Vite | Frontend |
| **Notification Svc** | Schedule & send daily pushes | Firebase FCM / APNs, CronJobs | Growth Eng |
| **GraphQL Gateway** | Single entrypoint, authz, BFF | Apollo‑Server, Node.js, Helm | Platform |
| **Lesson Engine** | Orchestrate lesson steps, tone switch, spaced repetition | Node.js, Redis, BullMQ | Backend |
| **LLM Proxy** | Prompt templating, model routing & cost guard | Python FastAPI, Asyncio | ML Platform |
| **Vector Memory** | Concept embeddings, similarity fetch | Pinecone | ML Platform |
| **Content Cache** | Reuse deterministic LLM outputs | Redis LRU | Platform |
| **Auth Service** | SSO, RBAC, JWT | Supabase Auth | Security |
| **Data Store** | User prefs, progress, billing | PostgreSQL (Supabase) | Backend |
| **Billing** | Plans, invoice, seat mgmt | Stripe | Finance Eng |
| **Analytics** | Events, funnels, A/B | PostHog, Segment | Data |
| **Admin Console** | Seat mgmt, ROI reports | Next.js, tRPC | Enterprise |
| **Compliance Sandbox** | Isolate enterprise data | Pg row‑level security, VPC peering | Security |

### 4.1 API & Data Contracts
- **GraphQL Endpoints** (subset):
  - `query getDailyLesson(userId): LessonStep!`
  - `mutation submitQuiz(stepId, answers): QuizFeedback!`
  - `mutation switchTone(lessonId, tone): LessonStep!`
  - `mutation submitProject(projectId, payload): ProjectScore!`
  - `mutation shareBadge(trackId): ShareLink!`
- **DB Schema Changes:**
  - `users` ← add `role`, `tone`, `streak`.
  - `lessons`, `projects`, `certificates` tables; indices on `user_id`, `due_at`.
  - Migrations via Prisma, zero‑downtime.

### 4.2 Non‑Functional Requirements
| NFR | Target | Notes |
|-----|--------|-------|
| Lesson start latency | P99 ≤ 2 s | incl. network RTT |
| Grading turnaround | ≤ 30 s | LLM batch async |
| Availability | ≥ 99.9 % | multi‑AZ K8s |
| Privacy/Security | SOC 2 Type II roadmap | PII encrypted at rest |
| Cost per 5‑min session | ≤ $0.015 | LLM token + infra |

## 5. Alternatives Considered & Trade‑offs
| Option | Pros | Cons | Reason Rejected |
|--------|------|------|-----------------|
| **Monolith API** | Simpler deploy | Scaling limits | Need fine‑grained scaling |
| **REST** | Familiar | Verb sprawl | GraphQL fits chat granularity |
| **On‑prem LLM** | Lower variable cost | Ops burden, model lag | Early time‑to‑market wins |

## 6. Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| LLM downtime | Med | High | Multi‑model fallback; retry queue |
| Hallucinated content | Med | High | Moderation, eval harness, human spot‑checks |
| Spaced‑repetition algorithm mis‑timed | Low | Med | A/B test timing windows |
| Notification fatigue | Med | Med | ML‑based send‑time optimization |
| Compliance sandbox misconfig | Low | High | IaC unit tests + audit logs |

## 7. Validation Strategy
- **Unit Tests:** 80 %+ coverage on lesson engine, GraphQL resolvers.
- **Integration Tests:** Cypress E2E for onboarding, tone switch, badge share.
- **Load Tests:** k6 simulating 10 k concurrent lesson starts; P99 latency within SLA.
- **Content Accuracy Evaluations:** automatic rubric + SME review of 1 % sample.
- **Acceptance Criteria:** mirror PRD scenarios.

## 8. Observability & Metrics
- **Dashboards:** Grafana (latency, error rate), PostHog funnels (streak retention), Stripe MRR.
- **Alerts / SLOs:** PagerDuty ‑ lesson start P99 > 3 s for 5 min, grading errors > 2 %.

## 9. Roll‑out & Deployment
- Blue/Green canary (5 % → 25 % → 100 %).
- Feature flags for spaced repetition & sandbox projects.
- Mobile app store phased release; PWA auto‑update.
- Backward‑compatible GraphQL; migrate data via shadow tables.

## 10. Production Readiness Checklist
☐ Capacity model reviewed  
☐ Run‑books & on‑call rotation updated  
☐ Security review passed  
☐ Data retention & purge jobs configured  
☐ Cost dashboards validated  

## 11. Open Questions / TBD
1. Beta baseline metrics → which engagement cohorts tracked?
2. Localization scope & timeline (ES, PT‑BR first?).
3. Multi‑model routing logic (Claude 3, Gemini 2) by Q4?
4. Avatar animation style guide & asset pipeline?

## 12. Appendix
- **ADR‑001:** Adopt GraphQL Gateway.
- **ADR‑002:** Outsource LLM to OpenAI/Anthropic with fallback.
- **Glossary:** XP (experience points), LSP (Lesson Service Provider), SR (Spaced Repetition).
- **Reference Links:** PRD, Figma flows, Miro architecture board.

