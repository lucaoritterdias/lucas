---
slug: complexidade-nao-e-valor
category: Technology
date: 2026-08-24
word: SIMPLIFICAR
title: Complexity is not the same as value
excerpt: Every new piece in a system is a debt with monthly interest. A technical guide to measuring complexity, trading infrastructure for SQL, and giving exceptions an expiry date.
---

## Complexity has a unit of measure

"This system is too complex" is a sentence every team has heard, and it almost never changes anything, because it has no number attached. Complexity is not a feeling: it is the sum of the things that must keep working for a request to succeed, plus the things someone needs to know to change them without fear.

When I need to assess a project that lands at Polvor, I start with four blunt measures. None of them is sophisticated, which is exactly why they work:

1. **Pieces on the critical path.** How many processes, databases, queues, and external APIs must be up for the main flow to work.
2. **Dependency surface.** How many packages actually ship to production, not how many are listed in `package.json`.
3. **Possible states.** How many flags, per-customer exceptions, and operating modes live in the same code.
4. **Concentrated knowledge.** How many parts of the system only one person understands.

The first two come out of the terminal in seconds:

```bash title="terminal"
# Packages that ship to production (direct + transitive)
npm ls --omit=dev --all --parseable | wc -l

# Why is this package here? Shows the chain that pulled it in
npm explain qs

# How much each direct dependency weighs in node_modules
du -sh node_modules/* | sort -rh | head -15
```

A `package.json` with 30 direct dependencies easily becomes 700 or 900 installed packages. Each of them is third-party code running with the same permissions as yours, and each has its own cycle of releases, vulnerabilities, and abandonment. This is not an argument for writing everything from scratch; it is an argument for knowing the price before you pay it.

| Piece | What it solves | Recurring cost |
|---|---|---|
| Redis | cache, queues, locks | memory, persistence, failover, one more connection to monitor |
| Separate service | isolation, independent deploys | a network in the middle, contract versioning, distributed tracing |
| ORM with its own migrations | CRUD productivity | opaque generated SQL, upgrades that break old migrations |
| Feature flag | gradual rollout | two code paths until someone removes one |
| External integration | a capability outside your business | rate limits, API changes, credentials, reprocessing |

The right-hand column is the one that never shows up in the demo. It gets paid every month, by whoever is on the team that month.

> [!TIP]
> Keep that table alive in the repository, in `docs/stack.md`, with one row per infrastructure piece and the name of the person who answers for it. If nobody wants to own a row, that is already an answer about whether it should exist.

## The queue that did not need Redis

The example I see most often: the product needs background tasks (sending an invoice email, rendering a PDF, syncing with an ERP), and the reflex answer is "add Redis with BullMQ". It works. But look at what happens in the request code:

```ts title="billing/close-invoice.ts" {4-7}
export async function closeInvoice(invoiceId: string) {
  await db.query("update invoices set status = 'closed' where id = $1", [invoiceId]);

  // If the process dies right here, the invoice is closed and the
  // email is never sent. If we swap the order, the worker may pick
  // up the job before the commit and not find the closed invoice.
  // There is no correct order: two systems, no transaction between them.
  await emailQueue.add("send-invoice", { invoiceId });
}
```

This is the *dual write* problem: two writes to different systems are never atomic. You can work around it with the *outbox* pattern, recording the intent in the database and publishing later, but at that point you already have a jobs table in Postgres. The honest question is: why not let Postgres be the queue?

![Two queue architectures side by side: on the left, the API writes to Postgres and Redis in separate steps; on the right, the API writes the invoice and the job in the same Postgres transaction and the worker consumes with SKIP LOCKED](figures/fila-postgres.svg "On the left, four arrows and a gap between commit and enqueue. On the right, the same guarantee with one piece fewer.")

Since version 9.5, Postgres has `FOR UPDATE SKIP LOCKED`, which lets several workers compete for rows in a table without blocking each other: each one locks the rows it took and simply skips the ones someone else has locked. That is exactly the semantics of a queue.

```sql title="migrations/0012_jobs.sql"
create table jobs (
  id          bigint generated always as identity primary key,
  queue       text        not null,
  payload     jsonb       not null,
  run_at      timestamptz not null default now(),
  attempts    int         not null default 0,
  locked_at   timestamptz,           -- "lease": who took it, and when
  last_error  text
);

-- Partial index: only free jobs are indexed. It stays small even after
-- millions of processed rows, because finished jobs are deleted.
create index jobs_ready on jobs (queue, run_at) where locked_at is null;
```

Enqueueing happens inside the same transaction that changes business state. If the transaction fails, the job does not exist; if it commits, the job exists. There is no third outcome.

```ts title="billing/close-invoice.ts" {7-11}
export async function closeInvoice(invoiceId: string) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("update invoices set status = 'closed' where id = $1", [invoiceId]);

    // Same commit: a closed invoice and a scheduled email are one fact.
    await client.query(
      "insert into jobs (queue, payload) values ('send-invoice', $1)",
      [{ invoiceId }],
    );
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
```

On the worker side, a single query takes a batch, sets the lease, and returns the data:

```sql title="queue/dequeue.sql"
with next as (
  select id
    from jobs
   where queue = $1
     and locked_at is null
     and run_at <= now()
   order by run_at
   limit $2
     for update skip locked   -- concurrency without waiting: locked rows are skipped
)
update jobs j
   set locked_at = now(),
       attempts  = j.attempts + 1
  from next
 where j.id = next.id
returning j.id, j.payload, j.attempts;
```

And the processing loop, with exponential backoff and a dead-letter queue:

```ts title="queue/worker.ts"
const MAX_ATTEMPTS = 8;

export async function work(queue: string, handler: (payload: unknown) => Promise<void>) {
  while (!shuttingDown) {
    const { rows } = await pool.query(DEQUEUE_SQL, [queue, 10]);
    if (rows.length === 0) {
      await sleep(1_000); // LISTEN/NOTIFY removes this polling, if latency matters
      continue;
    }

    await Promise.all(
      rows.map(async (job) => {
        try {
          await handler(job.payload);
          await pool.query("delete from jobs where id = $1", [job.id]);
        } catch (error) {
          if (job.attempts >= MAX_ATTEMPTS) {
            // Dead letter: out of the way, but kept for investigation
            await pool.query(
              "update jobs set queue = queue || ':dead', last_error = $2 where id = $1",
              [job.id, String(error)],
            );
            return;
          }
          const delay = Math.min(2 ** job.attempts, 3_600); // 2s, 4s, 8s… capped at 1h
          await pool.query(
            `update jobs
                set locked_at = null,
                    run_at = now() + make_interval(secs => $2),
                    last_error = $3
              where id = $1`,
            [job.id, delay, String(error)],
          );
        }
      }),
    );
  }
}
```

One detail is missing: if the worker dies mid-job, the job keeps `locked_at` set forever. A periodic *reaper* returns expired leases to the queue:

```sql
update jobs set locked_at = null
 where locked_at < now() - interval '5 minutes';
```

> [!NOTE]
> This design delivers *at-least-once*: if the handler sends the email and the process crashes before the `delete`, the job runs again. Every real queue has this property, dedicated ones included. The way out is an idempotent handler, for example writing `sent_at` on the invoice and returning early if it is already set.

> [!WARNING] When this stops being enough
> At tens of thousands of jobs per second, the `update` and `delete` churn produces a lot of dead tuples, and autovacuum becomes part of your operations. It is also not the tool for fanning events out to many consumers. In those cases a dedicated queue pays for itself. A typical B2B product, with tens or hundreds of jobs per minute, is nowhere near that limit.

The gain is not saving a Redis instance. It is having one less piece to monitor, back up, and upgrade, and above all gaining a consistency guarantee that simply did not exist before.

## Availability multiplies, it does not add

The second most expensive source of complexity is distributing too early. A monolith that calls five functions becomes five services calling each other over the network, and every synchronous hop multiplies the probability of failure.

If each service has 99.9% availability and failures are independent, a request that crosses five of them has 0.999⁵ ≈ 99.5%. That looks like a small difference until you turn it into time: from 43 minutes of downtime a month to 3 hours and 36 minutes.

![Five services in a chain, each at 99.9% availability; cumulative availability drops from 99.90% to 99.50% and monthly downtime grows from 43 minutes to 3h36](figures/cadeia-disponibilidade.svg "Each arrow is a network call. The bar shows how much availability is left after each hop.")

Latency suffers a similar effect, and a worse one. If a request fans out in parallel to N services and each has a 1% chance of answering at its p99, the chance that at least one is slow is `1 − 0.99^N`. With 10 calls, 9.6% of requests hit some tail. With around 70, half of them do: each piece's p99 has become the system's median. Jeff Dean and Luiz André Barroso describe this effect in *The Tail at Scale*.

None of this forbids separate services. But the reason to split should be organisational or proven scale, not aesthetics. For most teams, a **modular monolith** delivers the same code boundary without a network in the middle. And the boundary can, and should, be enforced by the machine:

```js title="eslint.config.mjs"
export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              // Each module exposes only its index.ts. Inside the module itself,
              // relative imports (./internal/...) are still allowed.
              group: ["@/modules/*/internal/**"],
              message: "Use the module's public API (@/modules/<name>), not its internals.",
            },
          ],
        },
      ],
    },
  },
];
```

If `billing` ever needs to become a service, the boundary already exists and is already tested. Until then, the call costs nanoseconds instead of milliseconds, and a single stack trace tells the whole story.

## Every exception is a permanent branch

Business exceptions are the quietest form of complexity. None of them looks big on the day it goes in:

```ts
// "It's just this one customer, it's temporary"
if (tenant.id === "tnt_8f2k") {
  total = items.reduce((sum, item) => sum + Math.round(item.price * item.qty), 0);
} else {
  total = Math.round(items.reduce((sum, item) => sum + item.price * item.qty, 0));
}
```

The problem is combinatorial. Every independent boolean condition doubles the number of possible paths through the code. With `n` exceptions that can combine, there are up to `2ⁿ` distinct behaviours:

| Active exceptions | Possible combinations | Tested in practice |
|---:|---:|---|
| 1 | 2 | all of them |
| 3 | 8 | almost all |
| 5 | 32 | the ones someone remembered |
| 10 | 1,024 | none, systematically |

The way out is not to ban exceptions. It is to make them explicit, with an owner, a reason, and an expiry date, and to have the machine enforce that date:

```ts title="src/exceptions.ts"
type Exception = {
  owner: string;      // who decides whether it keeps existing
  reason: string;     // why it exists, in one business sentence
  expires: string;    // YYYY-MM-DD: after this, CI fails
  tenants: readonly string[];
};

export const EXCEPTIONS = {
  perItemRounding: {
    owner: "finance-team",
    reason: "Customer invoices with per-item rounding until their ERP migration",
    expires: "2026-12-01",
    tenants: ["tnt_8f2k"],
  },
} as const satisfies Record<string, Exception>;

export function hasException(name: keyof typeof EXCEPTIONS, tenantId: string) {
  return (EXCEPTIONS[name].tenants as readonly string[]).includes(tenantId);
}
```

```ts title="src/exceptions.test.ts"
import { expect, test } from "vitest";
import { EXCEPTIONS } from "./exceptions";

test("no expired exceptions", () => {
  const today = new Date().toISOString().slice(0, 10);
  const expired = Object.entries(EXCEPTIONS)
    .filter(([, exception]) => exception.expires < today)
    .map(([name, exception]) => `${name} (${exception.owner}, expired on ${exception.expires})`);

  // Failing here is not a bug: it is the scheduled reminder of a postponed conversation.
  expect(expired).toEqual([]);
});
```

Now the exception has a place to be found (`grep hasException`), an owner, and a deadline. When the test breaks, the conversation is objective: renew it with a new date and a reason, or delete the code. Both answers are acceptable. What stops being acceptable is the forgotten exception.

## Before adding, ask how to remove

Simplicity is not a taste for clean code; it is a financial decision. Every piece has a build cost, which shows up in the budget, and an ownership cost, which shows up on the payroll for years: upgrades, incidents, onboarding every new person, context that has to be explained.

Before accepting a dependency or a new piece of infrastructure, I use a short checklist. It fits in the PR description:

- **What does it replace?** If the answer is "nothing, it's additional", the burden of proof is higher.
- **Who owns it?** A name, not a team.
- **What is the blast radius if it goes down?** Does the feature degrade, or does the product stop?
- **What are the signs of abandonment?** Last release, open issues, number of maintainers.
- **Can we remove it in a day?** If not, it needs an interface of ours in front of it.

The last question matters most. A dependency behind a small interface, with the two or three methods the domain actually uses, is a reversible decision. Spread across 40 files, it has become architecture, whether anyone decided that or not.

> [!TIP]
> A simple metric to track every quarter: the number of pieces on the critical path and the number of active exceptions. If both only go up, the system is getting more expensive to run, regardless of how many features shipped.

The technology that adds the most value is almost always the one users never notice and the next developer understands in an afternoon. Getting there takes more work than stacking tools, because it requires understanding the problem well enough to know what to leave out.
