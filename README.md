# REAP Technical Assessment

Welcome to the REAP technical assessment. This is a simplified version of our Medicaid eligibility case management system.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

```bash
npm run setup    # Install deps, create database, seed data
npm run dev      # Start dev server
```

Open [http://localhost:3000](http://localhost:3000) to see the available challenges.

### Useful Commands

- `npm run db:studio` - Open Prisma Studio to inspect data
- `npm run db:reset` - Reset database and re-seed

---

## Challenge 1: Transaction Review

Navigate to **Transactions** from the home page.

**The Problem:** Users report the bulk "Mark as Reviewed" feature is slow and unreliable. Sometimes only some transactions get updated, and the UI feels unresponsive.

**Your Task:** Investigate the Transaction Review feature and implement improvements to fix the reported issues.

---

## Challenge 2: Order Processing Workflow

Navigate to **Workflow Dashboard** from the home page.

**The Problem:** The order processing workflow is failing frequently. Orders are not being fulfilled reliably, and the success rate is unacceptably low. The business needs this to be close to 100% reliable.

**Your Task:** Run the workflow several times, observe the failures, and figure out how to make it more reliable. The workflow code is in `src/lib/workflow/`.

---

## What We're Looking For

1. **Problem Investigation** - Can you identify the root causes?
2. **Solution Design** - What approach will you take and why?
3. **Implementation** - Clean, working code
4. **Trade-off Awareness** - What are the alternatives? What would you do differently with more time?

## Guidelines

- Focus on **quality over quantity** - a well-implemented fix is better than many half-done changes
- Commit your work with clear messages
- Include a brief `NOTES.md` explaining:
  - What problems you found
  - What you fixed and why
  - Trade-offs you considered
  - What you'd do with more time

## Technical Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** SQLite with Prisma ORM
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI primitives

## Questions?

If you have questions about the requirements, reach out to your interviewer.

Good luck! 🚀
