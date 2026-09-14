---
slug: projetos-ensinam
category: Business
date: 2026-08-17
word: APRENDER
title: What many projects teach about good decisions
excerpt: Experience is not intuition, it is a set of techniques that keep recurring. Reversal cost, ADRs, signals in git, vertical slices, and probabilistic estimates.
---

## Decisions have a reversal cost

After many projects, the most useful lesson I learned is not about which technology to pick. It is about how much time to spend on each choice. One variable decides that: **how much it costs to go back**.

Most decisions are two-way doors: if they are wrong, you walk back and try another. Component library, CI tool, folder layout. Those deserve minutes, not meetings. A handful of decisions are one-way doors, and getting them wrong costs months. The most common mistake I see in teams is treating both kinds with the same ceremony: either everything becomes a committee, or nothing gets thought through.

| Decision | Cost of reversing | How to make it more reversible |
|---|---|---|
| Multi-tenancy model | migrating every customer's data | `tenant_id` on every table from day one |
| Public identifiers | breaking customers' URLs and integrations | opaque IDs (UUIDv7 or prefixed), never the internal serial |
| Public API contract | a new version and months of coexistence | additive changes only; version in the path from the start |
| Payment provider | every customer re-entering their card | tokens at the provider, your own interface with few methods |
| UI library | rewriting screens, gradually | low: decide fast |
| CI tool | swapping one YAML file | low: decide fast |

Multi-tenancy is the most expensive example I know. Starting with one database per customer, or with mixed data and no tenant column, looks like a detail in the MVP and turns into a quarter-long migration once the product succeeds. With `tenant_id` on every table, Postgres also offers a second line of defence: **Row Level Security**, which filters rows inside the database itself, even when someone forgets the `where` in the application.

```sql title="migrations/0003_rls.sql"
alter table projects enable row level security;
alter table projects force row level security;  -- applies to the table owner too

create policy tenant_isolation on projects
  using      (tenant_id = current_setting('app.tenant_id')::uuid)   -- reads
  with check (tenant_id = current_setting('app.tenant_id')::uuid);  -- writes
```

```ts title="db/with-tenant.ts" {5-7}
export async function withTenant<T>(tenantId: string, fn: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    // is_local = true: the setting dies with the transaction.
    // With a connection pool, nothing leaks into the next request.
    await client.query("select set_config('app.tenant_id', $1, true)", [tenantId]);
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
```

> [!WARNING]
> RLS does not apply to superusers or to roles with `BYPASSRLS`. If the application connects as the same user that runs migrations, the policy exists but protects nothing. Give the application its own role without those privileges, and write a test that tries to read another tenant's data and expects zero rows.

Notice that the policy fails closed: if `app.tenant_id` was never set, the cast to `uuid` raises an error instead of returning everyone's data. That is the kind of property worth seeking in one-way decisions: when something goes wrong, it should go wrong loudly.

## Record the why, not just the what

Code shows what was decided. It never shows why, which alternatives were discarded, or under which condition the decision stops holding. That context lives in the heads of whoever was in the meeting, and it leaves with them.

The cheapest tool I know for this is the **ADR** (*Architecture Decision Record*), proposed by Michael Nygard: a short, numbered Markdown file, versioned in the repository itself. It is not architecture documentation; it is a decision log.

```markdown title="docs/adr/0007-jobs-queue-in-postgres.md"
# 7. Jobs queue in Postgres, no Redis

- Status: accepted
- Date: 2026-08-10
- Supersedes: —

## Context
We need asynchronous jobs: invoice emails, PDF rendering, ERP sync.
Expected volume in year one: fewer than 50 jobs per minute.
The database is already managed Postgres; there is no Redis in production today.

## Decision
A `jobs` table consumed with `FOR UPDATE SKIP LOCKED`, with each job inserted
in the same transaction as the business rule that created it.

## Alternatives considered
- BullMQ + Redis: mature, but adds a piece and the dual-write problem.
- SQS: scales well, but needs an outbox for consistency and ties us to the provider.

## Consequences
+ Transactional enqueueing; one less piece to operate.
− 1s polling per worker; the table's autovacuum joins our monitoring.

## Revisit if
- Sustained volume above 500 jobs/s.
- A need arises to fan out to several independent consumers.
```

The most valuable section is the last one. A decision with an explicit invalidation criterion can be revisited without drama: nobody needs to prove the decider was wrong, only that the condition changed. Without that criterion, revisiting a decision becomes an argument about people.

> [!TIP]
> Require the ADR in the same pull request as the change it justifies. The reviewer now reviews the decision, not just the diff, and git history links the code to its reason forever. For two-way doors, write no ADR at all.

## The repository already knows where the risks are

Some problem patterns repeat in almost every project: knowledge concentrated in one person, files everybody changes all the time, modules nobody has touched in years because they are afraid to. You do not need intuition to find them. Git history records all of it; you only have to ask.

The first signal is the **bus factor**: files where a single person made almost all recent changes. If that person goes on holiday, that part of the system stops evolving.

```bash title="scripts/bus-factor.sh"
# Files with 10+ commits in the last year where one person made more than 80% of them
git log --since="12 months ago" --format='@%ae' --name-only --no-merges \
| awk '
  /^@/ { author = substr($0, 2); next }       # header line: remember the author
  NF   { total[$0]++; by[$0 SUBSEP author]++ } # file line: count per author
  END {
    for (key in by) {
      split(key, part, SUBSEP)
      file = part[1]
      if (total[file] >= 10 && by[key] / total[file] > 0.8)
        printf "%3d%%  %-28s %s\n", 100 * by[key] / total[file], part[2], file
    }
  }' | sort -rn | head -20
```

The second signal is **hotspots**: files that change far more often than average. Adam Tornhill shows in *Your Code as a Crime Scene* that defects cluster where high change frequency meets high complexity. Churn is the easy half to measure:

```bash
# The 15 most-changed files in the last 6 months
git log --since="6 months ago" --format= --name-only --no-merges \
  | grep -v '^$' | sort | uniq -c | sort -rn | head -15
```

Cross that list with each file's size (`wc -l`) or with the cyclomatic complexity your linter already computes. A 1,500-line file at the top of the churn list is usually where the next incident is born. A large file nobody has changed in two years is stable, and touching it now is risk with no return.

> [!NOTE]
> These numbers do not assess people. Someone with 90% of the commits in a module may be the best engineer on the team; the risk belongs to the system, not to them. Use the list to decide where to pair, cross-review, and document, never as an individual metric.

## The first delivery is a vertical slice

A pattern I have seen repeat in projects that ran late: the first month goes into building "the foundation". Complete authentication, modelling every entity, the pipeline, a design system. All necessary, nothing usable. The first time anyone uses the system for real is also the first time someone discovers a core assumption was wrong.

The alternative is what Alistair Cockburn called a **walking skeleton**: the smallest end-to-end implementation that crosses every layer and already runs in production. One screen, one table, one automated deploy. Narrow, but real.

![Two grids of layers by features: on the left, the database and deploy layers filled in for every feature and nothing usable; on the right, the first feature filled in across every layer](figures/fatia-vertical.svg "Same effort, different shapes. By layers, nothing works end to end; as a vertical slice, the first feature already gets real usage feedback.")

A vertical slice inverts the order of risks. Integration, deploys, permissions, database performance: everything that usually blows up at the end shows up in the first week, while it is still cheap to fix. And the pipeline exists from the first commit, because without it there is no slice in production:

```yaml title=".github/workflows/ci.yml"
name: ci
on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_PASSWORD: postgres
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready --health-interval 5s --health-retries 10
    env:
      DATABASE_URL: postgres://postgres:postgres@localhost:5432/postgres
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      # Migrations run from scratch on every PR: if they break here, they would break in production
      - run: npm run db:migrate
      - run: npm test
```

## Estimates are distributions, not numbers

Every project has a deadline, and almost every deadline is born from a sum of point estimates. The problem is that software tasks have a skewed distribution: they can finish a little early, but they can run very late. Adding up each task's "most likely" value produces a number with little chance of happening.

The PERT technique asks for three numbers per task (optimistic, most likely, pessimistic) and estimates the mean as `(O + 4M + P) / 6` and the standard deviation as `(P − O) / 6`. When summing, the means add up and so do the variances:

| Task (days) | O | M | P | Expected | σ |
|---|---:|---:|---:|---:|---:|
| Authentication and multi-tenancy | 3 | 5 | 10 | 5.5 | 1.17 |
| Spreadsheet import | 2 | 4 | 12 | 5.0 | 1.67 |
| Recurring billing | 5 | 8 | 15 | 8.7 | 1.67 |
| Reports | 2 | 3 | 6 | 3.3 | 0.67 |
| **Total** | | **20** | | **22.5** | **2.71** |

The team would say "20 days", the sum of the most likely values. Approximating the total with a normal distribution of mean 22.5 and σ 2.71, the chance of finishing within 20 days is about **18%**. At 84% confidence (mean + 1σ), it is 25 days. Nothing about the work changed; only the honesty of the number did.

Once the team has history, you can drop opinions and use data. A Monte Carlo simulation draws real past weeks until the backlog runs out, thousands of times:

```ts title="scripts/forecast.ts"
/** How many weeks to deliver `backlog` items, given the team's real weekly throughput? */
export function forecast(weeklyThroughput: number[], backlog: number, runs = 10_000) {
  if (!weeklyThroughput.some((n) => n > 0)) throw new Error("history has no deliveries");

  const weeks: number[] = [];
  for (let run = 0; run < runs; run++) {
    let remaining = backlog;
    let elapsed = 0;
    while (remaining > 0) {
      // Draw any past week at random: assumes the future looks like the past
      remaining -= weeklyThroughput[Math.floor(Math.random() * weeklyThroughput.length)];
      elapsed++;
    }
    weeks.push(elapsed);
  }

  weeks.sort((a, b) => a - b);
  const percentile = (p: number) => weeks[Math.floor(p * (runs - 1))];
  return { p50: percentile(0.5), p85: percentile(0.85), p95: percentile(0.95) };
}

forecast([3, 5, 2, 6, 4, 0, 5, 3], 40);
// → { p50: 12, p85: 14, p95: 15 }
```

![Histogram of 100,000 simulations: most finish between 10 and 13 weeks, with p50 at 12, p85 at 14 and p95 at 15; the naive average of 11.4 weeks sits left of the peak](figures/monte-carlo.svg "Eight weeks of history, a backlog of 40 items. The naive average (40 ÷ 3.5 = 11.4 weeks) only holds in 44% of the simulations.")

The answer stops being "11 weeks" and becomes "12 weeks at 50% confidence, 14 at 85%". That sentence changes the conversation with the client: if the deadline is 12 weeks and the business needs 85% confidence, either scope shrinks now or the deadline grows now. Finding out in week 10 leaves only the worst option: a scramble.

> [!TIP]
> Count items, not points. With items of roughly similar size, throughput in items per week forecasts as well as story points and skips the ceremony of pointing. What matters is splitting large work before it enters the backlog.

## Trust is built in small batches

Long projects fail silently. Between two distant milestones, misalignments pile up where nobody sees them, and they all surface together in final acceptance. The technical answer is to shrink the batch size: deliver little, often, to production.

The DORA research (*Accelerate*, by Forsgren, Humble, and Kim) showed that the four metrics below move together: teams that deploy more often also break less and recover faster. Speed and stability are not a trade-off.

| Metric | What it measures | Where to measure it |
|---|---|---|
| Deployment frequency | how often code reaches production | pipeline history |
| Lead time for changes | from commit to production | PRs and deploys |
| Change failure rate | deploys that need a fix or rollback | incidents × deploys |
| Time to restore | from failure to normal service | incident log |

You do not need a tool to start. Approximate lead time, from PR opened to merged, comes straight out of the GitHub CLI:

```bash
# Hours between opening and merging, over the last 50 PRs
gh pr list --state merged --limit 50 --json number,createdAt,mergedAt \
  --jq '.[] | [.number, (((.mergedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)) / 3600 | floor)] | @tsv'
```

The piece that makes small batches safe is separating **deploy** from **release**. Code ships to production switched off and is turned on per customer, by percentage, or by role, with no new deploy:

```ts title="billing/close-invoice.ts"
// Deploy ≠ release: the new flow is already in production, but only runs where it was switched on.
// The flag has an owner and an expiry date, like any exception.
if (await flags.isEnabled("new-billing-engine", { tenantId })) {
  return closeWithNewEngine(invoice);
}
return closeWithLegacyEngine(invoice);
```

Every small delivery that works is a deposit of trust between those who build and those who hire. That accumulated trust, more than any contract, is what lets hard decisions be made together when the next emergency shows up. And it always does.
