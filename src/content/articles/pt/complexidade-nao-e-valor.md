---
slug: complexidade-nao-e-valor
category: Tecnologia
date: 2026-08-24
word: SIMPLIFICAR
title: Complexidade não é sinônimo de valor
excerpt: Cada peça nova no sistema é uma dívida com juros mensais. Um roteiro técnico para medir complexidade, trocar infraestrutura por SQL e dar prazo de validade às exceções.
---

## Complexidade tem unidade de medida

"Esse sistema está complexo demais" é uma frase que todo time já ouviu, e que quase nunca muda nada, porque não tem número. Complexidade não é uma sensação: é a soma das coisas que precisam continuar funcionando para que uma requisição termine bem, mais as coisas que alguém precisa saber para mexer nelas sem medo.

Quando preciso avaliar um projeto que chega à Polvor, começo por quatro medidas brutas. Nenhuma é sofisticada, e é justamente por isso que funcionam:

1. **Peças no caminho crítico.** Quantos processos, bancos, filas e APIs externas precisam estar de pé para o fluxo principal funcionar.
2. **Superfície de dependências.** Quantos pacotes realmente vão para produção, não quantos estão no `package.json`.
3. **Estados possíveis.** Quantas flags, exceções por cliente e modos de operação convivem no mesmo código.
4. **Conhecimento concentrado.** Quantas partes do sistema só uma pessoa entende.

As duas primeiras saem do terminal em segundos:

```bash title="terminal"
# Pacotes que vão para produção (diretos + transitivos)
npm ls --omit=dev --all --parseable | wc -l

# Por que esse pacote está aqui? Mostra a cadeia de quem o puxou
npm explain qs

# Quanto cada dependência direta pesa no node_modules
du -sh node_modules/* | sort -rh | head -15
```

Um `package.json` com 30 dependências diretas facilmente vira 700 ou 900 pacotes instalados. Cada um deles é código de terceiros rodando com as mesmas permissões que o seu, e cada um tem um ciclo próprio de versões, vulnerabilidades e abandono. Não é um argumento para escrever tudo do zero; é um argumento para saber o preço antes de pagar.

| Peça | O que resolve | Custo recorrente |
|---|---|---|
| Redis | cache, filas, locks | memória, persistência, failover, mais uma conexão para monitorar |
| Serviço separado | isolamento, deploy independente | rede no meio, versionamento de contrato, tracing distribuído |
| ORM com migrações próprias | produtividade no CRUD | SQL gerado opaco, upgrades que quebram migrações antigas |
| Feature flag | rollout gradual | dois caminhos de código até alguém remover um |
| Integração externa | uma capacidade que não é o seu negócio | rate limits, mudanças de API, credenciais, reprocessamento |

A coluna da direita é a que não aparece na demo. Ela é paga todo mês, por quem estiver no time naquele mês.

> [!TIP]
> Mantenha essa tabela viva no repositório, em `docs/stack.md`, com uma linha por peça de infraestrutura e o nome de quem responde por ela. Se ninguém quer ser o dono de uma linha, isso já é uma resposta sobre se ela deveria existir.

## A fila que não precisava de Redis

O exemplo que mais se repete: o produto precisa de tarefas em segundo plano (enviar e-mail de fatura, gerar um PDF, sincronizar com um ERP) e a resposta automática é "coloca um Redis com BullMQ". Funciona. Mas repare no que acontece no código da requisição:

```ts title="billing/close-invoice.ts" {4-7}
export async function closeInvoice(invoiceId: string) {
  await db.query("update invoices set status = 'closed' where id = $1", [invoiceId]);

  // Se o processo morrer exatamente aqui, a fatura está fechada
  // e o e-mail nunca será enviado. Se invertermos a ordem, o worker
  // pode pegar o job antes do commit e não encontrar a fatura fechada.
  // Não existe ordem correta: são dois sistemas, sem transação entre eles.
  await emailQueue.add("send-invoice", { invoiceId });
}
```

Esse é o problema do *dual write*: duas escritas em sistemas diferentes nunca são atômicas. Dá para contornar com o padrão *outbox*, gravando a intenção no banco e publicando depois, mas nesse ponto você já tem uma tabela de jobs no Postgres. A pergunta honesta é: por que não deixar o Postgres ser a fila?

![Duas arquiteturas de fila lado a lado: à esquerda, API escreve no Postgres e no Redis em passos separados; à direita, API grava fatura e job na mesma transação do Postgres e o worker consome com SKIP LOCKED](figures/fila-postgres.svg "À esquerda, quatro setas e uma lacuna entre o commit e o enqueue. À direita, a mesma garantia com uma peça a menos.")

Desde a versão 9.5, o Postgres tem `FOR UPDATE SKIP LOCKED`, que permite que vários workers disputem linhas de uma tabela sem se bloquear: cada um trava as linhas que pegou e simplesmente pula as que outro já travou. É exatamente a semântica de uma fila.

```sql title="migrations/0012_jobs.sql"
create table jobs (
  id          bigint generated always as identity primary key,
  queue       text        not null,
  payload     jsonb       not null,
  run_at      timestamptz not null default now(),
  attempts    int         not null default 0,
  locked_at   timestamptz,           -- "lease": quem pegou e quando
  last_error  text
);

-- Índice parcial: só entram jobs livres. Ele continua pequeno mesmo
-- com milhões de linhas processadas, porque jobs concluídos são apagados.
create index jobs_ready on jobs (queue, run_at) where locked_at is null;
```

O enfileiramento acontece dentro da mesma transação que muda o estado do negócio. Se a transação falhar, o job não existe; se ela confirmar, o job existe. Não há terceira possibilidade.

```ts title="billing/close-invoice.ts" {7-11}
export async function closeInvoice(invoiceId: string) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("update invoices set status = 'closed' where id = $1", [invoiceId]);

    // Mesmo commit: fatura fechada e e-mail agendado são um fato só.
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

Do lado do worker, uma única query pega um lote, marca o lease e devolve os dados:

```sql title="queue/dequeue.sql"
with next as (
  select id
    from jobs
   where queue = $1
     and locked_at is null
     and run_at <= now()
   order by run_at
   limit $2
     for update skip locked   -- concorrência sem espera: linhas travadas são puladas
)
update jobs j
   set locked_at = now(),
       attempts  = j.attempts + 1
  from next
 where j.id = next.id
returning j.id, j.payload, j.attempts;
```

E o loop que processa, com backoff exponencial e fila morta:

```ts title="queue/worker.ts"
const MAX_ATTEMPTS = 8;

export async function work(queue: string, handler: (payload: unknown) => Promise<void>) {
  while (!shuttingDown) {
    const { rows } = await pool.query(DEQUEUE_SQL, [queue, 10]);
    if (rows.length === 0) {
      await sleep(1_000); // LISTEN/NOTIFY remove esse polling, se a latência importar
      continue;
    }

    await Promise.all(
      rows.map(async (job) => {
        try {
          await handler(job.payload);
          await pool.query("delete from jobs where id = $1", [job.id]);
        } catch (error) {
          if (job.attempts >= MAX_ATTEMPTS) {
            // Fila morta: sai do caminho, mas fica para investigação
            await pool.query(
              "update jobs set queue = queue || ':dead', last_error = $2 where id = $1",
              [job.id, String(error)],
            );
            return;
          }
          const delay = Math.min(2 ** job.attempts, 3_600); // 2s, 4s, 8s… teto de 1h
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

Falta um detalhe: se o worker morrer no meio do processamento, o job fica com `locked_at` preenchido para sempre. Um *reaper* periódico devolve leases vencidos à fila:

```sql
update jobs set locked_at = null
 where locked_at < now() - interval '5 minutes';
```

> [!NOTE]
> Esse desenho entrega *at-least-once*: se o handler enviar o e-mail e o processo cair antes do `delete`, o job roda de novo. Toda fila real tem essa propriedade, inclusive as dedicadas. A saída é tornar o handler idempotente, por exemplo gravando `sent_at` na fatura e saindo cedo se já estiver preenchido.

> [!WARNING] Quando isso deixa de ser suficiente
> Com dezenas de milhares de jobs por segundo, o custo de `update` e `delete` gera muitas tuplas mortas, e o autovacuum passa a ser parte da sua operação. Também não é a ferramenta para fan-out de eventos entre muitos consumidores. Nesses casos, uma fila dedicada se paga. Um produto B2B típico, com dezenas ou centenas de jobs por minuto, está muito longe desse limite.

O ganho não está em economizar uma instância de Redis. Está em ter uma peça a menos para monitorar, fazer backup e atualizar, e principalmente em ganhar uma garantia de consistência que antes simplesmente não existia.

## Disponibilidade se multiplica, não se soma

A segunda fonte de complexidade que mais custa caro é distribuir cedo demais. Um monólito que chama cinco funções vira cinco serviços que se chamam pela rede, e cada salto síncrono multiplica a probabilidade de falha.

Se cada serviço tem 99,9% de disponibilidade e as falhas são independentes, uma requisição que atravessa cinco deles tem 0,999⁵ ≈ 99,5%. Parece pouca diferença até convertermos em tempo: de 43 minutos de indisponibilidade por mês para 3 horas e 36 minutos.

![Cinco serviços em cadeia, cada um com 99,9% de disponibilidade; a disponibilidade acumulada cai de 99,90% para 99,50% e o tempo fora por mês sobe de 43 minutos para 3h36](figures/cadeia-disponibilidade.svg "Cada seta é uma chamada de rede. A barra mostra quanto sobra de disponibilidade depois de cada salto.")

Latência sofre um efeito parecido, e pior. Se uma requisição dispara chamadas paralelas para N serviços e cada um tem 1% de chance de responder no seu p99, a chance de pelo menos um estar lento é `1 − 0,99^N`. Com 10 chamadas, 9,6% das requisições pegam alguma cauda. Com cerca de 70, metade delas: o p99 de cada peça virou a mediana do sistema. Jeff Dean e Luiz André Barroso descrevem esse efeito em *The Tail at Scale*.

Nada disso proíbe serviços separados. Mas a razão para separar deveria ser organizacional ou de escala comprovada, não estética. Para a maioria dos times, um **monólito modular** entrega a mesma fronteira de código sem a rede no meio. A fronteira pode, e deve, ser verificada pela máquina:

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
              // Cada módulo expõe só o seu index.ts. Dentro do próprio módulo,
              // imports relativos (./internal/...) continuam permitidos.
              group: ["@/modules/*/internal/**"],
              message: "Use a API pública do módulo (@/modules/<nome>), não os internals.",
            },
          ],
        },
      ],
    },
  },
];
```

Se um dia `billing` precisar virar um serviço, a fronteira já existe e já está testada. Até lá, a chamada custa nanossegundos, não milissegundos, e um *stack trace* conta a história inteira.

## Cada exceção é um branch permanente

Exceções de negócio são a forma mais silenciosa de complexidade. Nenhuma parece grande no dia em que entra:

```ts
// "É só esse cliente, é temporário"
if (tenant.id === "tnt_8f2k") {
  total = items.reduce((sum, item) => sum + Math.round(item.price * item.qty), 0);
} else {
  total = Math.round(items.reduce((sum, item) => sum + item.price * item.qty, 0));
}
```

O problema é combinatório. Cada condicional booleana independente dobra o número de caminhos possíveis pelo código. Com `n` exceções que podem se combinar, há até `2ⁿ` comportamentos distintos:

| Exceções ativas | Combinações possíveis | Testadas na prática |
|---:|---:|---|
| 1 | 2 | todas |
| 3 | 8 | quase todas |
| 5 | 32 | as que alguém lembrou |
| 10 | 1.024 | nenhuma de forma sistemática |

A saída não é proibir exceções. É torná-las explícitas, com dono, motivo e data de validade, e fazer a máquina cobrar essa data:

```ts title="src/exceptions.ts"
type Exception = {
  owner: string;      // quem decide se ela continua existindo
  reason: string;     // por que existe, em uma frase de negócio
  expires: string;    // YYYY-MM-DD: depois disso o CI falha
  tenants: readonly string[];
};

export const EXCEPTIONS = {
  perItemRounding: {
    owner: "time-financeiro",
    reason: "Cliente fatura com arredondamento por item até migrar o ERP",
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

test("nenhuma exceção vencida", () => {
  const today = new Date().toISOString().slice(0, 10);
  const expired = Object.entries(EXCEPTIONS)
    .filter(([, exception]) => exception.expires < today)
    .map(([name, exception]) => `${name} (${exception.owner}, venceu em ${exception.expires})`);

  // Falhar aqui não é bug: é o lembrete agendado de uma conversa adiada.
  expect(expired).toEqual([]);
});
```

Agora a exceção tem um lugar para ser encontrada (`grep hasException`), um responsável e um prazo. Quando o teste quebra, a conversa é objetiva: renovar com uma nova data e um motivo, ou apagar o código. As duas respostas são aceitáveis. O que deixa de ser aceitável é a exceção esquecida.

## Antes de adicionar, pergunte como remover

Simplicidade não é gosto por código limpo; é uma decisão financeira. Cada peça tem um custo de construção, que aparece no orçamento, e um custo de posse, que aparece na folha de pagamento dos próximos anos: upgrades, incidentes, onboarding de cada pessoa nova, contexto que precisa ser explicado.

Antes de aceitar uma dependência ou uma nova peça de infraestrutura, uso um checklist curto. Ele cabe na descrição do PR:

- **O que ela substitui?** Se a resposta for "nada, é adicional", o ônus da prova é maior.
- **Quem é o dono?** Um nome, não um time.
- **Qual o raio de explosão se ela cair?** A funcionalidade degrada ou o produto para?
- **Qual o sinal de abandono?** Último release, issues abertas, número de mantenedores.
- **Dá para remover em um dia?** Se não der, ela precisa de uma interface nossa na frente.

A última pergunta é a mais importante. Uma dependência atrás de uma interface pequena, com dois ou três métodos que o domínio realmente usa, é uma decisão reversível. Espalhada em 40 arquivos, virou arquitetura, quer alguém tenha decidido isso ou não.

> [!TIP]
> Uma métrica simples para acompanhar por trimestre: número de peças no caminho crítico e número de exceções ativas. Se os dois só sobem, o sistema está ficando mais caro de operar, independentemente de quantas funcionalidades foram entregues.

A tecnologia que mais agrega valor é, quase sempre, a que o usuário nunca percebe e a que o próximo desenvolvedor entende em uma tarde. Chegar lá dá mais trabalho do que empilhar ferramentas, porque exige entender o problema bem o suficiente para saber o que deixar de fora.
