---
name: submission-review
description: Use before submitting a take-home assignment, technical exercise, or any repo a reviewer will read cold in ten minutes. Covers the adversarial self-review pass, the README structure reviewers actually read, how to write the assumptions and trade-offs note, and the honest incomplete-work disclosure. Trigger at the end of a build, before packaging or sending anything.
---

# Submission review

The reviewer gives this ten minutes. They read the README, skim the file tree, open two
files, and form a judgement. Optimise for that pass — not for the code you are proudest of.

## Step 1 — Adversarial read

Reread the repo as a skeptical reviewer who wants to reject it. Write the list of things
that would cost points, in priority order, before fixing anything. Be specific: "the error
state renders the raw fetch message to the user" beats "improve error handling".

Then fix the top three. Leave the rest in the README's known-limitations section. A named
limitation reads as judgement; the same gap unnamed reads as an oversight.

## Step 2 — Requirement audit against the original brief

Reopen the original task text — not your spec, the brief the reviewer wrote. Tick every
literal requirement. Take-homes are often marked against exactly that list, and the most
expensive failure is a missing explicit requirement while an unrequested feature is
polished.

## Step 3 — Cold-clone test

In a clean directory, not your dev folder:

```bash
git clone <repo> /tmp/cold && cd /tmp/cold && npm ci && npm run build && npm start
```

If any step needs knowledge that is not in the README, the README is wrong. A reviewer who
cannot run it marks what they can see, and that is never the good part.

## Step 4 — README

Reviewers read in this order. Write in this order.

```markdown
# Payments Dashboard
One sentence: what it is. Then the live URL, first, above the fold.

## Run it
Prerequisites, then three commands. Nothing else.

## What was built
The requirement list with a tick against each. Include what was not built.

## Architecture
A short tree and three sentences on why it is shaped that way.

## Assumptions
## Trade-offs
## Known limitations / what I would do next
## Traceability
```

Keep it under two screens. A long README reads as compensating.

## Step 5 — The assumptions and trade-offs note

This is the section that separates candidates, and most people write it as an apology.
Write it as engineering judgement instead.

**A trade-off has three parts: what you chose, what you gave up, and when the other choice
wins.**

Weak:

> I used an in-memory array instead of a database to save time.

Strong:

> Payments are held in memory behind a `PaymentsRepository` interface. The brief made
> persistence optional, and the interesting part is where persistence attaches, not the
> schema — so the boundary exists and the implementation is a swap. State resets on
> restart, which is fine for a read-only demo and unacceptable the moment anything writes.

Same decision. The second shows you know what you traded.

Cover at least: data storage, why the framework, where filtering happens, what the tests
do and do not cover, and anything you would build differently with a week instead of two
hours.

## Step 6 — Honest disclosure

State plainly what is incomplete and why. "I did not implement X because I chose to spend
the remaining time on Y" is a strong sentence — it shows prioritisation, which is the
actual thing being assessed.

Never claim something works that you have not run. Reviewers check, and one inflated claim
retroactively discounts every other claim in the document.

## Step 7 — Final sweep

- [ ] Every literal requirement in the original brief is ticked or explained
- [ ] Live URL at the top of the README, opened in a private window to confirm it loads
- [ ] Cold clone runs with only the documented steps
- [ ] `npm run build` clean; no TypeScript errors, no console warnings on load
- [ ] No commented-out code, no `TODO`, no `console.log`, no `.env`, no `node_modules`
- [ ] Commit history is readable and tells the story of the build
- [ ] Filenames and identifiers consistently cased; no `Untitled`, no `test2`
- [ ] Error state triggered manually at least once (kill the API and reload)
- [ ] Empty state and loading state seen with your own eyes, not just asserted in a test
- [ ] The assumptions section names three real trade-offs, not three apologies

## Anti-patterns

- A README that explains the framework instead of your decisions
- Claiming a feature works because the test passes, without ever loading the page
- Hiding an unfinished feature behind a disabled button
- Submitting a broken deploy URL — it is the first thing clicked and the last impression
- Padding with unrequested features while an explicit requirement is missing
