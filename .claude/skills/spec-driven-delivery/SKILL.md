---
name: spec-driven-delivery
description: Use when a repo contains a specs/ folder and work must be traceable to numbered requirements. Governs the plan-before-code gate, requirement-ID commit discipline, the traceability matrix, and how to handle spec ambiguity or conflict. Trigger whenever implementing, extending, or reviewing work against a written specification.
---

# Spec-driven delivery

The specification is the contract. Code is one artefact produced from it; tests and the
traceability matrix are the others. Work that cannot be traced to a requirement ID is
either an undocumented requirement or scope creep, and both need saying out loud.

## The loop

```
read spec → plan + trace → gate → implement one FR → prove it → update matrix → next FR
```

Never skip the gate. Never batch six requirements into one commit.

## Phase gate: plan before code

Before the first line of implementation, produce:

1. **File tree** with one line of purpose per file.
2. **Traceability table** — every FR mapped to the file(s) that will satisfy it. If an FR
   has no file, the plan is incomplete.
3. **Ambiguity register** — each unclear point, the assumption you propose, and what would
   change if the assumption is wrong.
4. **Over-engineering flags** — anything in the spec that costs more than it returns
   inside the stated timebox.

Then stop and wait for approval. The value of a plan the human never saw is zero.

## Handling ambiguity

Rank the options:

1. The spec answers it → follow the spec, even if you would have chosen differently.
2. A neighbouring requirement implies the answer → follow the implication, note it.
3. Genuinely open → pick the **simplest reversible** option, record it in the ambiguity
   register, and surface it in the README's assumptions section. Never bury a guess.

If the spec and a chat instruction conflict, the spec wins and you say so immediately.
Silent resolution of a conflict is the failure mode that costs trust.

## Requirement lifecycle

A requirement moves through exactly these states:

| State | Meaning |
|---|---|
| `planned` | Mapped to a file in the plan |
| `implemented` | Code exists and runs |
| `proven` | An automated test or a documented manual step demonstrates it |
| `traced` | The matrix names the file and the test |

**Done means `traced`.** "It works when I click it" is `implemented`, not done. Reporting
`implemented` as done is the single most common way an engineer loses a reviewer's trust,
because the reviewer finds out.

## Commit discipline

One requirement per commit where possible:

```
feat(api): FR-2 server-side status filtering
test(web): AC-10 error state across three failure modes
docs: ADR-001 record minor-unit money decision
```

The reviewer reading `git log` should see the spec being executed. That log is part of the
submission whether you intended it or not.

## The traceability matrix

Lives in the README. Regenerate it, do not hand-maintain it in your head:

| Req | Implementation | Proof | Status |
|-----|----------------|-------|--------|
| FR-2 | `apps/api/src/payments/payments.service.ts` | `payments.service.spec.ts` › AC-2 | traced |
| FR-12 | `apps/web/src/hooks/usePayments.ts` | `usePayments.test.ts` › AC-12 | traced |

## Honest reporting

At the end, report three lists: **done**, **partial** (with what is missing), and **not
attempted** (with why). A short honest list beats a long optimistic one. A reviewer who
finds an unlisted gap discounts everything else you claimed.

## Anti-patterns

- Writing code during the planning phase because the answer felt obvious
- Marking a requirement done because the happy path works
- Adding a feature the spec does not name, then defending it as "it's better"
- Resolving a spec conflict silently
- A traceability matrix filled in at the end from memory rather than as you go
