# AI Usage Log

All AI tool usage for this assessment is recorded here per submission requirements.
Format: date | tool | task | what it produced | what I changed/owned.

---

## 2026-05-23

### Claude Code (claude-sonnet-4-6) — Architecture planning

**Task**: Design the overall framework architecture, folder structure, and file contracts.

**Prompt given**: Full assessment brief + tech stack preference (Playwright + TypeScript).

**What AI produced**:
- Folder structure proposal
- Key file designs (BasePage, ApiClient, config/env.ts contracts)
- Test coverage matrix for all three layers
- playwright.config.ts settings outline
- GitHub Actions workflow skeleton
- Implementation ordering

**What I owned / changed**:
- Selected Option A (CI/CD) over Option B (analytics dashboard) — rationale: CI is the
  minimum viable quality gate; analytics is only valuable once CI is reliable and producing
  real run data
- Chose two-commit strategy (scaffold first, then implementation) to satisfy Task 1's
  "evidence of planning" requirement explicitly
- Decided on `username:accessKey` (not `username:password`) for API Basic Auth after
  cross-referencing LambdaTest docs — AI initially left this ambiguous
- Chose `winston` for structured logging (AI suggested it; I confirmed it fits CI JSON format needs)
- Chose `@smoke` tagging strategy with `grep` in playwright.config over a separate config file
- Risk identification in test-strategy.md — AI drafted the structure; I wrote the specific
  risks (selector drift, API endpoint instability, shared state cleanup) based on prior
  experience with similar platforms

---

<!-- Add new entries below as AI is used during implementation -->
