# How to use this kit

Everything here goes into an **empty repo before you write any code**. The point is that
the reviewer sees a spec-driven pipeline, not a folder of files that happened to work.

## Order of operations

**1. Create the repo and drop the kit in.**

```bash
mkdir payments-dashboard && cd payments-dashboard && git init
# copy in: CLAUDE.md, specs/, .claude/
git add -A && git commit -m "docs: specification, ADR, and delivery skills"
```

That first commit is doing real work. It timestamps the fact that the spec preceded the
code, which is the whole claim you are making.

**2. Rename `SUBMISSION-README.template.md`.** Keep it out of the repo for now — it becomes
`README.md` at the end, generated against what you actually built. Do not commit it early
with unticked boxes.

**3. Open Claude Code at the repo root and paste `PROMPT.md`.**

**4. Review the Phase 0 plan properly.** This is where you earn the story. Push back on at
least one thing, and let the correction land in the git history — a reviewer who sees you
steering an agent reads differently from one who sees an agent left unattended.

**5. Let it build phases 1–3, approving between each.**

**6. Deploy (phase 4), then run the `submission-review` skill (phase 5).**

**7. Do the cold-clone test yourself.** Not in your dev folder. This catches more real
problems than any review pass.

## What each file is for

| File | Role |
|---|---|
| `PROMPT.md` | The kickoff prompt. Paste it into Claude Code. Includes two follow-up prompts for a hostile review pass and an interview talk-track. |
| `CLAUDE.md` | Persistent conventions and guardrails. Claude Code reads this automatically every session. |
| `specs/SPEC-001-*.md` | Numbered FRs and NFRs. The traceability spine. |
| `specs/openapi.yaml` | The binding API contract. |
| `specs/acceptance-criteria.md` | AC scenarios, each mapped to an FR. |
| `specs/ADR-001-architecture.md` | Decisions and their costs. Your trade-offs section is already written here. |
| `.claude/skills/*/SKILL.md` | Four skills governing how the build runs. |
| `SUBMISSION-README.template.md` | The final README shape — fill against reality, do not ship as-is. |

## The four skills

- **`spec-driven-delivery`** — plan-before-code gate, requirement IDs in commits, the
  four-state definition of done, honest gap reporting.
- **`typed-contract-first`** — Zod as the single source of truth, validation at both edges,
  money as minor-unit integers, exhaustive view-state unions.
- **`railway-single-service-deploy`** — one service, one origin, plus the failure-mode table
  that covers most Railway deploys that pass locally and die in the cloud.
- **`submission-review`** — the adversarial read, the README order reviewers actually use,
  and how to write trade-offs as judgement rather than apology.

They are written to be reusable. Strip the payments specifics and the first, second and
fourth carry straight into other work.

## A note on how to present this

The 2-hour timebox is real and the reviewer will read it that way. Do not claim the
specification was free. The honest framing is stronger anyway:

> The implementation was the two hours. The specs and skills are my normal working setup —
> I write the contract and the acceptance criteria first, then drive the build against
> them, because that is how I keep an agent inside the lines and how I keep the work
> traceable. The trade-offs section is lifted from the ADR I wrote before starting.

That answers "did AI write this for you" before it gets asked, and reframes it as method.
Given the interviewer's AI background, the process is likely more interesting to them than
the table.

## If you want to go further

The single highest-value addition, if time allows: record a two-minute screen capture
walking through the spec → plan → traceability matrix, and link it at the top of the
README. Almost nobody does this, and it converts a code review into a conversation about
how you work.
