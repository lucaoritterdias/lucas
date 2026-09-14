---
slug: software-que-permanece
category: Produto
date: 2026-08-31
word: PERMANECER
title: O melhor software não termina na entrega
excerpt: Um sistema só prova sua qualidade em produção. Health checks, logs estruturados, traces, SLOs com orçamento de erro, migrações sem janela de manutenção e postmortems sem culpados.
---

## Produção é o único ambiente que importa

Existe uma diferença grande entre um projeto concluído e um produto bem construído. O primeiro passa na homologação. O segundo continua de pé numa terça-feira comum, com dez vezes mais dados, uma integração instável do outro lado e alguém do time de férias. É depois do lançamento que as decisões invisíveis começam a cobrar ou a pagar.

Antes de qualquer go-live, faço uma revisão curta. Cada item existe para responder uma pergunta que, cedo ou tarde, alguém vai fazer às pressas:

| Item | Pergunta que ele responde |
|---|---|
| Health check | O balanceador sabe quando tirar uma instância doente de circulação? |
| Logs estruturados | Consigo achar todas as requisições de um cliente em um minuto? |
| Rastreamento de erros | Fico sabendo do erro antes de o cliente abrir um chamado? |
| Backup restaurado | Quanto tempo leva para voltar a ontem, e quanto dado se perde? |
| Migrações reversíveis | Consigo desfazer o deploy de hoje sem perder escrita? |
| Runbook | Quem estiver de plantão sabe o que fazer às três da manhã? |

O health check é o item mais simples e o mais mal feito. Um endpoint que responde `200` sempre só prova que o processo está vivo. Para o balanceador decidir se manda tráfego, ele precisa saber se a instância consegue trabalhar:

```ts title="app/api/health/route.ts"
import { pool } from "@/db/pool";

export const dynamic = "force-dynamic"; // um health check em cache é pior que nenhum

export async function GET() {
  const started = performance.now();
  try {
    // Readiness: pronta é a instância que alcança aquilo de que depende.
    // O timeout curto impede que um banco lento pareça "saudável e demorado".
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

E backup só existe depois de ser restaurado. Um teste automático semanal custa meia dúzia de linhas e troca uma suposição por um fato, com tempo medido:

```bash title="scripts/restore-check.sh"
set -euo pipefail

pg_dump --format=custom --no-owner "$DATABASE_URL" > /tmp/backup.dump
createdb restore_check
time pg_restore --no-owner --jobs=4 --dbname=restore_check /tmp/backup.dump  # isso é o seu RTO

# O backup tem dados de ontem? Isso é o seu RPO.
psql restore_check -Atc "select max(created_at) from invoices"
dropdb restore_check
```

## Logs e traces: perguntas, não frases

`console.log("erro ao salvar fatura")` é uma frase. Serve para quem está olhando o terminal naquele segundo. Em produção, com dezenas de instâncias e milhares de requisições por minuto, ninguém lê logs: consulta logs. Para isso eles precisam ser dados.

### Logs estruturados

Cada linha vira um objeto JSON com campos consistentes. O truque é que o contexto da requisição (id, tenant, usuário) entre em todas as linhas automaticamente, sem depender de ninguém lembrar de passá-lo adiante. No Node, `AsyncLocalStorage` resolve isso:

```ts title="lib/log.ts"
import { AsyncLocalStorage } from "node:async_hooks";
import { trace } from "@opentelemetry/api";
import pino from "pino";

type RequestContext = { requestId: string; tenantId?: string; userId?: string };
export const requestContext = new AsyncLocalStorage<RequestContext>();

export const log = pino({
  level: process.env.LOG_LEVEL ?? "info",
  // Dado pessoal não entra no log, nem por acidente
  redact: ["*.password", "*.token", "*.cpf", "*.email"],
  // mixin roda em cada linha: contexto da requisição + trace atual, de graça
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

A linha que chega ao agregador já responde perguntas sem ninguém ter previsto quais seriam:

```json
{"level":30,"time":1789400000000,"requestId":"req_9f3a","tenantId":"tnt_8f2k","traceId":"4bf92f3577b34da6a3ce929d0e0e4736","invoiceId":"inv_1042","totalCents":158900,"durationMs":212,"msg":"invoice.closed"}
```

"Quais clientes tiveram fechamentos acima de um segundo ontem?" deixa de ser uma investigação e vira um filtro por `msg` e `durationMs`. E o `traceId` leva direto para a próxima ferramenta.

> [!WARNING]
> Log é um banco de dados que costuma ter menos controle de acesso que o banco principal e retenção maior. Sob a LGPD, logar e-mail, CPF ou corpo de requisição cria uma cópia de dado pessoal fora de qualquer política. Registre identificadores (`userId`, `invoiceId`) e resolva o resto no sistema de origem, com permissão.

### Traces

Logs contam o que aconteceu em um ponto. Um trace conta a história inteira de uma requisição: quanto tempo ela passou no handler, em cada query, em cada chamada externa. Em Next.js, o OpenTelemetry é ligado em um arquivo:

```ts title="instrumentation.ts"
import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({ serviceName: "app-web" }); // HTTP, fetch e rotas já saem instrumentados
}
```

A instrumentação automática cobre as bordas. As operações que importam para o negócio merecem um span próprio, com atributos que permitam filtrar depois:

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
      span.end(); // span sem end() nunca é exportado
    }
  });
}
```

## Confiabilidade tem orçamento

"O sistema tem que estar sempre no ar" não é um requisito, é um desejo, e um desejo caro. Cada nove adicional de disponibilidade custa mais que o anterior, e 100% não existe. A pergunta útil é: quanto de falha os usuários toleram sem perceber ou sem se importar?

A resposta vira três definições. O **SLI** é o que se mede, por exemplo: proporção de requisições da API que respondem sem erro 5xx e em menos de 800 ms. O **SLO** é a meta para esse número em uma janela, por exemplo 99,5% em 30 dias. E o **orçamento de erro** é o que sobra: 0,5% das requisições podem falhar sem violar a meta.

| SLO (30 dias) | Orçamento de erro | Equivalente em indisponibilidade total |
|---:|---:|---:|
| 99% | 1% | 7h12min |
| 99,5% | 0,5% | 3h36min |
| 99,9% | 0,1% | 43min12s |
| 99,95% | 0,05% | 21min36s |
| 99,99% | 0,01% | 4min19s |

O valor do orçamento não está na conta, está na política que ele permite. Enquanto sobra orçamento, o time entrega funcionalidades com a velocidade que quiser. Quando ele acaba, a prioridade muda para confiabilidade até o orçamento se recompor. É uma regra combinada antes, com produto e negócio, que transforma a eterna discussão "features ou estabilidade" em uma leitura de gráfico.

![Gráfico de consumo do orçamento de erro ao longo de 30 dias: começa em 100%, cai bruscamente no dia 9 por um incidente, cai de novo nos dias 21 e 22 por uma regressão e termina abaixo da linha de política de 25%](figures/orcamento-de-erro.svg "Exemplo de mês com SLO de 99,5%. O incidente do dia 9 consumiu um terço do orçamento; a regressão dos dias 21 e 22 empurrou o saldo para baixo de 25% e acionou a política.")

Com o SLO definido, os alertas mudam de natureza. Em vez de "CPU acima de 80%", que acorda alguém por algo que talvez nem afete usuários, alerta-se sobre a **velocidade de consumo do orçamento** (*burn rate*). O SRE Workbook, do Google, recomenda combinar uma janela longa e uma curta: a longa garante que o problema é relevante, a curta garante que ele ainda está acontecendo.

```yaml title="alerts/slo-api.yml"
groups:
  - name: slo-api
    rules:
      # SLO 99,5% → orçamento = 0,005. Burn rate 14,4 sustentado por 1h
      # consome 2% do orçamento do mês (14,4 × 1h ÷ 720h). Isso acorda alguém.
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

      # Burn rate 6 por 6h consome 5%. Merece atenção, mas em horário comercial.
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
> O exemplo mede só erros 5xx para caber na tela. Para incluir latência no SLI, conte como "ruins" também as requisições acima do limite usando o histograma (`http_request_duration_seconds_bucket{le="0.8"}`): boas são as que caem no bucket, ruins são o total menos elas.

## Mudar o banco sem janela de manutenção

Produtos que permanecem mudam o esquema do banco o tempo todo, e cada mudança acontece com a aplicação rodando. "Colocar o sistema em manutenção às duas da manhã" não escala, e com várias instâncias da aplicação sempre existe um momento em que a versão antiga e a nova rodam juntas. Qualquer migração precisa funcionar com as duas.

O padrão para isso é **expand/contract**. Um renomear de coluna, que parece uma linha de SQL, vira cinco passos, cada um em um deploy separado e reversível:

![Linha do tempo em cinco fases: expand, dual write, backfill, troca de leitura e contract; a coluna antiga existe até o contract, a nova surge no expand e só fica completa depois do backfill; leituras mudam de coluna na fase 4](figures/expand-contract.svg "Renomear name para full_name sem downtime. Até a fase 5, qualquer passo pode ser desfeito sem perder dados.")

```sql title="migrations/0031_expand_full_name.sql"
-- Sem isso, o ALTER entra na fila do lock atrás de qualquer transação longa
-- e, enquanto espera, bloqueia todas as queries que chegarem depois dele.
set lock_timeout = '3s';

alter table customers add column full_name text;  -- só metadado: instantâneo
```

Na fase 2, a aplicação passa a gravar nas duas colunas. Na fase 3, as linhas antigas são copiadas em lotes pequenos, para que nenhum lock dure muito e a replicação não fique para trás:

```sql title="scripts/backfill-full-name.sql"
-- Rodar em loop até afetar 0 linhas.
update customers
   set full_name = name
 where id in (
   select id
     from customers
    where full_name is null
      and name is not null      -- sem isso, linhas com name nulo prendem o loop para sempre
    limit 5000
      for update skip locked    -- não disputa lock com o tráfego real
 );
```

Para tornar a coluna obrigatória sem varrer a tabela inteira sob lock exclusivo, o Postgres permite separar a declaração da validação:

```sql title="migrations/0033_full_name_not_null.sql"
set lock_timeout = '3s';

-- NOT VALID: vale para escritas novas, sem verificar as linhas existentes agora (lock curto)
alter table customers
  add constraint customers_full_name_not_null check (full_name is not null) not valid;

-- VALIDATE varre a tabela com um lock que não bloqueia leituras nem escritas
alter table customers validate constraint customers_full_name_not_null;

-- Postgres 12+: a constraint validada serve de prova e o SET NOT NULL pula a varredura
alter table customers alter column full_name set not null;
alter table customers drop constraint customers_full_name_not_null;
```

Na fase 4, um deploy troca as leituras para `full_name` e para de gravar em `name`. Só depois que essa versão estiver sozinha em produção, e que nenhum job ou relatório ainda consulte a coluna antiga, vem o contract: `alter table customers drop column name`. É o único passo sem volta, e por isso é o último.

> [!TIP]
> Índices seguem a mesma lógica: `create index concurrently` não bloqueia escritas, mas não pode rodar dentro de uma transação e, se falhar, deixa um índice inválido para trás. Rode fora do wrapper transacional da ferramenta de migração e confira `pg_index.indisvalid` depois.

## O suporte é onde a confiança se constrói

Muita gente avalia um fornecedor de software pela qualidade do lançamento. A confiança real se constrói nos meses seguintes: no primeiro incidente, na primeira dúvida sobre um comportamento estranho, no primeiro ajuste que parecia simples e não era. É aí que fica claro se existe engenharia do outro lado ou só um projeto entregue.

Duas práticas fazem essa diferença. A primeira é o **runbook**: um documento curto por tipo de alerta, com o que verificar primeiro e quais comandos rodar. Ele existe para que o conhecimento de quem construiu esteja disponível para quem está de plantão. Um trecho típico, para "banco lento":

```sql title="runbook: banco lento"
-- 1. Quem está bloqueando quem? Cadeias de lock aparecem aqui.
select pid,
       pg_blocking_pids(pid)      as bloqueado_por,
       now() - xact_start         as idade_da_transacao,
       state,
       left(query, 80)            as query
  from pg_stat_activity
 where cardinality(pg_blocking_pids(pid)) > 0
 order by xact_start;

-- 2. Cancelar a query que está na raiz da cadeia (a conexão continua viva):
-- select pg_cancel_backend(<pid>);
```

A segunda é o **postmortem sem culpados**. Todo incidente relevante gera um documento que descreve o que aconteceu, por que o sistema permitiu que acontecesse e o que muda para que não se repita. "Sem culpados" não é gentileza: é método. Se a conclusão for "fulano errou", a ação corretiva é "fulano, tome cuidado", e o sistema continua igual, esperando a próxima pessoa.

```markdown title="docs/incidents/2026-09-02-lock-em-invoices.md"
# API de faturas degradada por 24 minutos

Impacto: lentidão a partir de 14:02; ~60% das requisições com 503 entre 14:05 e 14:26.
Cerca de 6% do orçamento de erro do mês (21 min × 60% ÷ 216 min).
Detecção: alerta ErrorBudgetFastBurn às 14:13, oito minutos após os primeiros 503.

## Linha do tempo (BRT)
- 14:02 deploy aplica a migração 0042: `alter table invoices add column ...`
- 14:02 o ALTER espera o lock atrás de uma exportação aberta há 18 min;
        toda query nova em `invoices` passa a esperar atrás dele
- 14:05 pool de conexões esgota; a API começa a responder 503
- 14:13 alerta dispara; plantão abre o runbook "banco lento"
- 14:21 `pg_blocking_pids` mostra a cadeia; exportação cancelada
- 14:26 ALTER conclui, pool se recupera, taxa de erro normaliza

## Por que o sistema permitiu
- A migração não definia `lock_timeout`.
- Exportações longas rodam no primário, não na réplica de leitura.

## Ações
- [ ] `lock_timeout` de 3s obrigatório em migrações, verificado no CI (dono: plataforma, 09/09)
- [ ] Exportações passam a usar a réplica de leitura (dono: backend, 16/09)
```

Repare que o incidente do exemplo nasceu exatamente do detalhe que a seção anterior recomenda. Isso não é coincidência: a maior parte das boas práticas de operação é cicatriz de algum postmortem, escrito por alguém que decidiu que aquilo não ia acontecer duas vezes.

Software que permanece é, no fim, software que continua sendo observado, medido e ajustado por pessoas que sabem que não estarão na sala quando a próxima decisão importante precisar ser tomada, e que por isso deixam rastros claros: nos logs, nos alertas, nas migrações e nos documentos.
