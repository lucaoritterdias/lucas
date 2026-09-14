---
slug: software-que-permanece
category: Product
date: 2026-08-31
word: PERMANECER
title: The best software does not end at delivery
excerpt: A system only proves its quality in production. Health checks, structured logs, traces, SLOs with error budgets, migrations without maintenance windows, and blameless postmortems.
---

## Production is the only environment that matters

There is a big difference between a finished project and a well-built product. The first passes acceptance testing. The second stays up on an ordinary Tuesday, with ten times more data, a flaky integration on the other side, and someone on the team on holiday. It is after launch that the invisible decisions start either charging or paying off.

Before any go-live, I run a short review. Each item exists to answer a question that, sooner or later, someone will ask in a hurry:

| Item | The question it answers |
|---|---|
| Health check | Does the load balancer know when to pull a sick instance out of rotation? |
| Structured logs | Can I find every request from one customer in under a minute? |
| Error tracking | Do I hear about the error before the customer opens a ticket? |
| Restored backup | How long does it take to get back to yesterday, and how much data is lost? |
| Reversible migrations | Can I undo today's deploy without losing writes? |
| Runbook | Does whoever is on call know what to do at three in the morning? |

The health check is the simplest item and the most often done badly. An endpoint that always answers `200` only proves the process is alive. For the load balancer to decide whether to send traffic, it needs to know whether the instance can actually work:

```ts title="app/api/health/route.ts"
import { pool } from "@/db/pool";

export const dynamic = "force-dynamic"; // a cached health check is worse than none

export async function GET() {
  const started = performance.now();
  try {
    // Readiness: ready means the instance can reach what it depends on.
    // The short timeout stops a slow database from looking "healthy but slow".
    await Promise.race([
      pool.query("select 1"),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 2_000)),
    ]);
    return Response.json({ status: "ok", db_ms: Math.round(performance.now() - started) });
  } catch {
    return Response.json({ status: "unavailable", reason: "database" }, { status: 503 });
  }
}
```

And a backup only exists once it has been restored. A weekly automated test costs half a dozen lines and turns an assumption into a fact, with a measured duration:

```bash title="scripts/restore-check.sh"
set -euo pipefail

pg_dump --format=custom --no-owner "$DATABASE_URL" > /tmp/backup.dump
createdb restore_check
time pg_restore --no-owner --jobs=4 --dbname=restore_check /tmp/backup.dump  # this is your RTO

# Does the backup have yesterday's data? That is your RPO.
psql restore_check -Atc "select max(created_at) from invoices"
dropdb restore_check
```

## Logs and traces: questions, not sentences

`console.log("failed to save invoice")` is a sentence. It helps whoever is watching the terminal at that second. In production, with dozens of instances and thousands of requests a minute, nobody reads logs: they query them. For that, logs need to be data.

### Structured logs

Every line becomes a JSON object with consistent fields. The trick is getting the request context (id, tenant, user) into every line automatically, without relying on anyone remembering to pass it along. In Node, `AsyncLocalStorage` solves that:

```ts title="lib/log.ts"
import { AsyncLocalStorage } from "node:async_hooks";
import { trace } from "@opentelemetry/api";
import pino from "pino";

type RequestContext = { requestId: string; tenantId?: string; userId?: string };
export const requestContext = new AsyncLocalStorage<RequestContext>();

export const log = pino({
  level: process.env.LOG_LEVEL ?? "info",
  // Personal data never enters the log, not even by accident
  redact: ["*.password", "*.token", "*.taxId", "*.email"],
  // mixin runs on every line: request context + current trace, for free
  mixin: () => ({
    ...requestContext.getStore(),
    traceId: trace.getActiveSpan()?.spanContext().traceId,
  }),
});
```

```ts title="app/api/invoices/[id]/close/route.ts"
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const tenantId = await tenantFrom(request);

  return requestContext.run({ requestId, tenantId }, async () => {
    const started = performance.now();
    const invoice = await closeInvoice(id);
    log.info({ invoiceId: id, totalCents: invoice.totalCents, durationMs: Math.round(performance.now() - started) }, "invoice.closed");
    return Response.json(invoice);
  });
}
```

The line that reaches the aggregator already answers questions nobody predicted:

```json
{"level":30,"time":1789400000000,"requestId":"req_9f3a","tenantId":"tnt_8f2k","traceId":"4bf92f3577b34da6a3ce929d0e0e4736","invoiceId":"inv_1042","totalCents":158900,"durationMs":212,"msg":"invoice.closed"}
```

"Which customers had invoice closings slower than one second yesterday?" stops being an investigation and becomes a filter on `msg` and `durationMs`. And the `traceId` leads straight to the next tool.

> [!WARNING]
> A log store is a database that usually has looser access control than the main one and longer retention. Under GDPR or Brazil's LGPD, logging emails, tax IDs, or request bodies creates a copy of personal data outside any policy. Log identifiers (`userId`, `invoiceId`) and resolve the rest in the source system, with permission.

### Traces

Logs tell you what happened at one point. A trace tells the whole story of a request: how long it spent in the handler, in each query, in each external call. In Next.js, OpenTelemetry is switched on in one file:

```ts title="instrumentation.ts"
import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({ serviceName: "app-web" }); // HTTP, fetch, and routes come instrumented
}
```

Automatic instrumentation covers the edges. Operations that matter to the business deserve their own span, with attributes you can filter on later:

```ts title="billing/close-invoice.ts"
import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("billing");

export function closeInvoice(invoiceId: string) {
  return tracer.startActiveSpan("invoice.close", async (span) => {
    span.setAttribute("invoice.id", invoiceId);
    try {
      const invoice = await closeAndEnqueueEmail(invoiceId);
      span.setAttribute("invoice.items", invoice.items.length);
      return invoice;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    } finally {
      span.end(); // a span without end() is never exported
    }
  });
}
```

## Reliability has a budget

"The system must always be up" is not a requirement, it is a wish, and an expensive one. Each additional nine of availability costs more than the previous one, and 100% does not exist. The useful question is: how much failure do users tolerate without noticing or without caring?

The answer turns into three definitions. The **SLI** is what you measure, for example: the share of API requests answered without a 5xx error and in under 800 ms. The **SLO** is the target for that number over a window, for example 99.5% over 30 days. And the **error budget** is what is left: 0.5% of requests may fail without breaking the target.

| SLO (30 days) | Error budget | Equivalent in total downtime |
|---:|---:|---:|
| 99% | 1% | 7h12min |
| 99.5% | 0.5% | 3h36min |
| 99.9% | 0.1% | 43min12s |
| 99.95% | 0.05% | 21min36s |
| 99.99% | 0.01% | 4min19s |

The budget's value is not in the arithmetic, it is in the policy it enables. While budget remains, the team ships features as fast as it likes. When it runs out, priority shifts to reliability until the budget recovers. It is a rule agreed beforehand with product and business, and it turns the eternal "features or stability" argument into reading a chart.

![Error budget burn-down over 30 days: it starts at 100%, drops sharply on day 9 because of an incident, drops again on days 21 and 22 because of a regression, and ends below the 25% policy line](figures/orcamento-de-erro.svg "An example month with a 99.5% SLO. The day-9 incident burned a third of the budget; the regression on days 21 and 22 pushed the balance below 25% and triggered the policy.")

With the SLO defined, alerts change nature. Instead of "CPU above 80%", which wakes someone up for something that may not even affect users, you alert on how fast the budget is being consumed: the **burn rate**. Google's SRE Workbook recommends pairing a long window with a short one: the long one proves the problem matters, the short one proves it is still happening.

```yaml title="alerts/slo-api.yml"
groups:
  - name: slo-api
    rules:
      # SLO 99.5% → budget = 0.005. A burn rate of 14.4 sustained for 1h
      # consumes 2% of the monthly budget (14.4 × 1h ÷ 720h). This wakes someone up.
      - alert: ErrorBudgetFastBurn
        expr: |
          (
            sum(rate(http_requests_total{status=~"5.."}[1h]))
            / sum(rate(http_requests_total[1h]))
          ) > (14.4 * 0.005)
          and
          (
            sum(rate(http_requests_total{status=~"5.."}[5m]))
            / sum(rate(http_requests_total[5m]))
          ) > (14.4 * 0.005)
        labels:
          severity: page

      # A burn rate of 6 over 6h consumes 5%. It deserves attention, but during business hours.
      - alert: ErrorBudgetSlowBurn
        expr: |
          (
            sum(rate(http_requests_total{status=~"5.."}[6h]))
            / sum(rate(http_requests_total[6h]))
          ) > (6 * 0.005)
          and
          (
            sum(rate(http_requests_total{status=~"5.."}[30m]))
            / sum(rate(http_requests_total[30m]))
          ) > (6 * 0.005)
        labels:
          severity: ticket
```

> [!NOTE]
> The example only measures 5xx errors to fit on screen. To include latency in the SLI, also count requests above the threshold as "bad" using the histogram (`http_request_duration_seconds_bucket{le="0.8"}`): good ones land in the bucket, bad ones are the total minus those.

## Changing the database without a maintenance window

Products that last change their database schema all the time, and every change happens with the application running. "Putting the system into maintenance at 2 a.m." does not scale, and with several application instances there is always a moment when the old and new versions run side by side. Every migration has to work with both.

The pattern for this is **expand/contract**. Renaming a column, which looks like one line of SQL, becomes five steps, each in its own reversible deploy:

![A five-phase timeline: expand, dual write, backfill, switch reads, and contract; the old column exists until contract, the new one appears at expand and is only complete after backfill; reads switch columns in phase 4](figures/expand-contract.svg "Renaming name to full_name with zero downtime. Until phase 5, any step can be undone without losing data.")

```sql title="migrations/0031_expand_full_name.sql"
-- Without this, the ALTER queues for its lock behind any long transaction
-- and, while it waits, blocks every query that arrives after it.
set lock_timeout = '3s';

alter table customers add column full_name text;  -- metadata only: instant
```

In phase 2, the application starts writing to both columns. In phase 3, old rows are copied in small batches, so no lock lasts long and replication does not fall behind:

```sql title="scripts/backfill-full-name.sql"
-- Run in a loop until it affects 0 rows.
update customers
   set full_name = name
 where id in (
   select id
     from customers
    where full_name is null
      and name is not null      -- without this, rows with a null name trap the loop forever
    limit 5000
      for update skip locked    -- does not fight real traffic for locks
 );
```

To make the column required without scanning the whole table under an exclusive lock, Postgres lets you separate declaring a constraint from validating it:

```sql title="migrations/0033_full_name_not_null.sql"
set lock_timeout = '3s';

-- NOT VALID: applies to new writes, without checking existing rows now (short lock)
alter table customers
  add constraint customers_full_name_not_null check (full_name is not null) not valid;

-- VALIDATE scans the table with a lock that blocks neither reads nor writes
alter table customers validate constraint customers_full_name_not_null;

-- Postgres 12+: the validated constraint serves as proof and SET NOT NULL skips the scan
alter table customers alter column full_name set not null;
alter table customers drop constraint customers_full_name_not_null;
```

In phase 4, a deploy switches reads to `full_name` and stops writing `name`. Only once that version runs alone in production, and no job or report still queries the old column, comes the contract: `alter table customers drop column name`. It is the only step with no way back, which is why it comes last.

> [!TIP]
> Indexes follow the same logic: `create index concurrently` does not block writes, but it cannot run inside a transaction and, if it fails, leaves an invalid index behind. Run it outside your migration tool's transactional wrapper and check `pg_index.indisvalid` afterwards.

## Support is where trust is built

Many people judge a software vendor by the quality of the launch. Real trust is built in the months that follow: the first incident, the first question about strange behaviour, the first change that looked simple and was not. That is when it becomes clear whether there is engineering on the other side, or just a delivered project.

Two practices make that difference. The first is the **runbook**: a short document per alert type, with what to check first and which commands to run. It exists so that the knowledge of whoever built the system is available to whoever is on call. A typical excerpt, for "slow database":

```sql title="runbook: slow database"
-- 1. Who is blocking whom? Lock chains show up here.
select pid,
       pg_blocking_pids(pid)      as blocked_by,
       now() - xact_start         as transaction_age,
       state,
       left(query, 80)            as query
  from pg_stat_activity
 where cardinality(pg_blocking_pids(pid)) > 0
 order by xact_start;

-- 2. Cancel the query at the root of the chain (the connection stays alive):
-- select pg_cancel_backend(<pid>);
```

The second is the **blameless postmortem**. Every relevant incident produces a document describing what happened, why the system allowed it, and what changes so it does not happen again. "Blameless" is not politeness: it is method. If the conclusion is "so-and-so made a mistake", the corrective action is "so-and-so, be careful", and the system stays the same, waiting for the next person.

```markdown title="docs/incidents/2026-09-02-invoices-lock.md"
# Invoices API degraded for 24 minutes

Impact: slowness from 14:02; ~60% of requests returned 503 between 14:05 and 14:26.
About 6% of the month's error budget (21 min × 60% ÷ 216 min).
Detection: ErrorBudgetFastBurn alert at 14:13, eight minutes after the first 503s.

## Timeline (BRT)
- 14:02 deploy runs migration 0042: `alter table invoices add column ...`
- 14:02 the ALTER waits for its lock behind an export open for 18 min;
        every new query on `invoices` now waits behind it
- 14:05 connection pool exhausted; the API starts answering 503
- 14:13 alert fires; on-call opens the "slow database" runbook
- 14:21 `pg_blocking_pids` shows the chain; export cancelled
- 14:26 ALTER completes, pool recovers, error rate back to normal

## Why the system allowed it
- The migration did not set `lock_timeout`.
- Long exports run on the primary, not on the read replica.

## Actions
- [ ] 3s `lock_timeout` required in migrations, checked in CI (owner: platform, 09/09)
- [ ] Exports move to the read replica (owner: backend, 09/16)
```

Notice that the example incident was born from exactly the detail the previous section recommends. That is no coincidence: most good operational practices are scar tissue from some postmortem, written by someone who decided it was not going to happen twice.

Software that lasts is, in the end, software that keeps being observed, measured, and adjusted by people who know they will not be in the room when the next important decision has to be made, and who therefore leave clear trails: in the logs, the alerts, the migrations, and the documents.
