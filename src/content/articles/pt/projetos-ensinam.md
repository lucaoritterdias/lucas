---
slug: projetos-ensinam
category: Negócio
date: 2026-08-17
word: APRENDER
title: O que muitos projetos ensinam sobre boas decisões
excerpt: Repertório não é intuição, é um conjunto de técnicas que se repetem. Custo de reversão, ADRs, sinais no git, fatias verticais e estimativas probabilísticas.
---

## Decisões têm custo de reversão

Depois de muitos projetos, a lição mais útil que aprendi não é sobre qual tecnologia escolher. É sobre quanto tempo gastar em cada escolha. A variável que decide isso é uma só: **quanto custa voltar atrás**.

A maioria das decisões é uma porta de mão dupla: se estiver errada, você volta e tenta outra. Biblioteca de componentes, ferramenta de CI, organização de pastas. Essas merecem minutos, não reuniões. Um punhado de decisões é porta de mão única, e errar nelas custa meses. O erro mais comum que vejo em times é tratar os dois tipos com a mesma cerimônia: ou tudo vira comitê, ou nada é pensado.

| Decisão | Custo de reverter | Como deixar mais reversível |
|---|---|---|
| Modelo de multi-tenancy | migrar todos os dados de todos os clientes | `tenant_id` em toda tabela desde o dia 1 |
| Identificadores públicos | quebrar URLs e integrações de clientes | IDs opacos (UUIDv7 ou prefixados), nunca o serial interno |
| Contrato de API pública | nova versão e meses de convivência | só mudanças aditivas; versão no path desde o início |
| Provedor de pagamento | recadastrar cartões de todos os clientes | tokens no provedor, interface própria com poucos métodos |
| Biblioteca de UI | reescrever telas, aos poucos | baixo: decida rápido |
| Ferramenta de CI | trocar um arquivo YAML | baixo: decida rápido |

Multi-tenancy é o exemplo mais caro que conheço. Começar com um banco por cliente ou com dados misturados sem coluna de tenant parece detalhe no MVP e vira um projeto de migração de trimestre quando o produto dá certo. Com `tenant_id` em toda tabela, o Postgres ainda oferece uma segunda linha de defesa: **Row Level Security**, que filtra linhas no próprio banco, mesmo que alguém esqueça o `where` na aplicação.

```sql title="migrations/0003_rls.sql"
alter table projects enable row level security;
alter table projects force row level security;  -- vale também para o dono da tabela

create policy tenant_isolation on projects
  using      (tenant_id = current_setting('app.tenant_id')::uuid)   -- leitura
  with check (tenant_id = current_setting('app.tenant_id')::uuid);  -- escrita
```

```ts title="db/with-tenant.ts" {5-7}
export async function withTenant<T>(tenantId: string, fn: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    // is_local = true: a configuração morre com a transação.
    // Com pool de conexões, nada vaza para a próxima requisição.
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
> RLS não se aplica a superusuários nem a papéis com `BYPASSRLS`. Se a aplicação conecta com o mesmo usuário que roda as migrações, a política existe mas não protege nada. Use um papel próprio para a aplicação, sem esses privilégios, e escreva um teste que tente ler dados de outro tenant e espere zero linhas.

Repare que a política falha fechada: se `app.tenant_id` não foi definido, a conversão para `uuid` gera erro em vez de devolver dados de todo mundo. Esse é o tipo de propriedade que vale buscar em decisões de mão única: quando algo der errado, que dê errado de forma barulhenta.

## Registre o porquê, não só o quê

O código mostra o que foi decidido. Ele nunca mostra por quê, nem quais alternativas foram descartadas, nem em que condição a decisão deixa de valer. Esse contexto mora na cabeça de quem estava na reunião e vai embora junto com essa pessoa.

A ferramenta mais barata que conheço para isso é o **ADR** (*Architecture Decision Record*), proposto por Michael Nygard: um arquivo Markdown curto, numerado, versionado no próprio repositório. Não é documentação de arquitetura; é um diário de decisões.

```markdown title="docs/adr/0007-fila-de-jobs-no-postgres.md"
# 7. Fila de jobs no Postgres, sem Redis

- Status: aceita
- Data: 2026-08-10
- Substitui: —

## Contexto
Precisamos de jobs assíncronos: e-mail de fatura, geração de PDF, sync com ERP.
Volume esperado no primeiro ano: menos de 50 jobs por minuto.
O banco já é Postgres gerenciado; hoje não há Redis em produção.

## Decisão
Tabela `jobs` consumida com `FOR UPDATE SKIP LOCKED`, com o job inserido
na mesma transação da regra de negócio que o originou.

## Alternativas consideradas
- BullMQ + Redis: maduro, mas adiciona uma peça e o problema de dual write.
- SQS: escala bem, mas exige outbox para consistência e acopla ao provedor.

## Consequências
+ Enfileiramento transacional; uma peça a menos para operar.
− Polling de 1s por worker; autovacuum da tabela entra no monitoramento.

## Revisitar se
- Volume sustentado acima de 500 jobs/s.
- Surgir necessidade de fan-out para vários consumidores independentes.
```

A seção mais valiosa é a última. Uma decisão com critério explícito de invalidação pode ser revista sem drama: ninguém precisa provar que quem decidiu estava errado, só que a condição mudou. Sem esse critério, rever uma decisão vira discussão sobre pessoas.

> [!TIP]
> Exija o ADR no mesmo pull request da mudança que ele justifica. O revisor passa a revisar a decisão, não só o diff, e o histórico do git liga para sempre o código ao motivo. Para decisões de mão dupla, não escreva ADR nenhum.

## O repositório já sabe onde estão os riscos

Alguns padrões de problema se repetem em quase todo projeto: conhecimento concentrado em uma pessoa, arquivos que todo mundo altera o tempo todo, módulos que ninguém toca há anos porque têm medo. Não é preciso intuição para encontrá-los. O histórico do git registra tudo isso, basta perguntar.

O primeiro sinal é o **bus factor**: arquivos em que uma única pessoa fez quase todas as alterações recentes. Se ela sair de férias, aquele pedaço do sistema para de evoluir.

```bash title="scripts/bus-factor.sh"
# Arquivos com 10+ commits no último ano em que uma única pessoa fez mais de 80% deles
git log --since="12 months ago" --format='@%ae' --name-only --no-merges \
| awk '
  /^@/ { author = substr($0, 2); next }       # linha de cabeçalho: guarda o autor
  NF   { total[$0]++; by[$0 SUBSEP author]++ } # linha de arquivo: conta por autor
  END {
    for (key in by) {
      split(key, part, SUBSEP)
      file = part[1]
      if (total[file] >= 10 && by[key] / total[file] > 0.8)
        printf "%3d%%  %-28s %s\n", 100 * by[key] / total[file], part[2], file
    }
  }' | sort -rn | head -20
```

O segundo sinal são os **hotspots**: arquivos que mudam com frequência muito acima da média. Adam Tornhill mostra em *Your Code as a Crime Scene* que defeitos se concentram onde alta frequência de mudança encontra alta complexidade. Churn é a metade fácil de medir:

```bash
# Os 15 arquivos mais alterados nos últimos 6 meses
git log --since="6 months ago" --format= --name-only --no-merges \
  | grep -v '^$' | sort | uniq -c | sort -rn | head -15
```

Cruze essa lista com o tamanho de cada arquivo (`wc -l`) ou com a complexidade ciclomática que o seu linter já calcula. Um arquivo de 1.500 linhas no topo do churn costuma ser onde nasce o próximo incidente. Um arquivo grande que ninguém altera há dois anos é estável, e mexer nele agora é risco sem retorno.

> [!NOTE]
> Esses números não avaliam pessoas. Uma pessoa com 90% dos commits em um módulo pode ser a melhor do time; o risco é do sistema, não dela. Use a lista para decidir onde fazer pareamento, revisão cruzada e documentação, nunca como métrica individual.

## A primeira entrega é uma fatia vertical

Um padrão que vi se repetir em projetos que atrasaram: o primeiro mês é gasto construindo "a fundação". Autenticação completa, modelagem de todas as entidades, pipeline, design system. Tudo necessário, nada utilizável. A primeira vez que alguém usa o sistema de verdade é também a primeira vez que se descobre que uma premissa central estava errada.

A alternativa é o que Alistair Cockburn chamou de **walking skeleton**: a menor implementação ponta a ponta que atravessa todas as camadas e já roda em produção. Uma tela, uma tabela, um deploy automático. Estreito, mas real.

![Dois quadros de camadas por funcionalidades: à esquerda, as camadas de banco e deploy preenchidas para todas as funcionalidades e nada utilizável; à direita, a primeira funcionalidade preenchida em todas as camadas](figures/fatia-vertical.svg "Mesmo esforço, formas diferentes. Por camadas, nada funciona até o fim; em fatia vertical, a primeira funcionalidade já recebe feedback de uso real.")

A fatia vertical inverte a ordem dos riscos. Integração, deploy, permissões, performance do banco: tudo que costuma explodir no final aparece na primeira semana, quando ainda é barato corrigir. E a pipeline existe desde o primeiro commit, porque sem ela não há fatia em produção:

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
      # Migrações rodam do zero em todo PR: se quebrarem aqui, quebrariam em produção
      - run: npm run db:migrate
      - run: npm test
```

## Estimativas são distribuições, não números

Todo projeto tem um prazo, e quase todo prazo nasce de uma soma de estimativas pontuais. O problema é que tarefas de software têm distribuição assimétrica: podem terminar um pouco antes do previsto, mas podem atrasar muito. Somar o valor "mais provável" de cada tarefa produz um número que tem pouca chance de acontecer.

A técnica PERT pede três números por tarefa (otimista, provável e pessimista) e estima a média como `(O + 4M + P) / 6` e o desvio padrão como `(P − O) / 6`. Na soma, as médias se somam e as variâncias também:

| Tarefa (dias) | O | M | P | Esperado | σ |
|---|---:|---:|---:|---:|---:|
| Autenticação e multi-tenant | 3 | 5 | 10 | 5,5 | 1,17 |
| Importação de planilhas | 2 | 4 | 12 | 5,0 | 1,67 |
| Cobrança recorrente | 5 | 8 | 15 | 8,7 | 1,67 |
| Relatórios | 2 | 3 | 6 | 3,3 | 0,67 |
| **Total** | | **20** | | **22,5** | **2,71** |

O time diria "20 dias", a soma dos prováveis. Aproximando o total por uma normal com média 22,5 e σ 2,71, a chance de terminar em até 20 dias é de cerca de **18%**. Com 84% de confiança (média + 1σ), são 25 dias. Não mudou nada no trabalho; mudou só a honestidade do número.

Quando o time já tem histórico, dá para dispensar a opinião e usar os dados. Uma simulação de Monte Carlo sorteia semanas reais do passado até esgotar o backlog, milhares de vezes:

```ts title="scripts/forecast.ts"
/** Quantas semanas para entregar `backlog` itens, dado o throughput semanal real do time? */
export function forecast(weeklyThroughput: number[], backlog: number, runs = 10_000) {
  if (!weeklyThroughput.some((n) => n > 0)) throw new Error("histórico sem entregas");

  const weeks: number[] = [];
  for (let run = 0; run < runs; run++) {
    let remaining = backlog;
    let elapsed = 0;
    while (remaining > 0) {
      // Sorteia uma semana qualquer do passado: supõe que o futuro se parece com ele
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

![Histograma de 100 mil simulações: a maioria termina entre 10 e 13 semanas, com p50 em 12, p85 em 14 e p95 em 15; a média ingênua de 11,4 semanas fica à esquerda do pico](figures/monte-carlo.svg "Histórico de 8 semanas, backlog de 40 itens. A média ingênua (40 ÷ 3,5 = 11,4 semanas) só se cumpre em 44% das simulações.")

A resposta deixa de ser "11 semanas" e passa a ser "12 semanas com 50% de chance, 14 com 85%". Essa frase muda a conversa com quem contrata: se o prazo é 12 semanas e o negócio precisa de 85% de confiança, ou o escopo diminui agora, ou o prazo cresce agora. Descobrir isso na semana 10 só deixa a pior opção: correria.

> [!TIP]
> Conte itens, não pontos. Com itens de tamanho razoavelmente parecido, o throughput em itens por semana prevê tão bem quanto story points e dispensa a cerimônia de pontuar. O que importa é quebrar trabalho grande antes de ele entrar no backlog.

## Confiança se constrói em lotes pequenos

Projetos longos falham em silêncio. Entre dois marcos distantes, desalinhamentos se acumulam sem que ninguém os veja, e aparecem todos juntos na homologação final. A resposta técnica para isso é reduzir o tamanho do lote: entregar pouco, com frequência, em produção.

A pesquisa do DORA (*Accelerate*, de Forsgren, Humble e Kim) mostrou que as quatro métricas abaixo andam juntas: times que entregam com mais frequência também quebram menos e se recuperam mais rápido. Velocidade e estabilidade não são uma troca.

| Métrica | O que mede | Onde medir |
|---|---|---|
| Frequência de deploy | quantas vezes o código chega à produção | histórico da pipeline |
| Lead time de mudança | do commit até produção | PRs e deploys |
| Taxa de falha de mudança | deploys que exigem correção ou rollback | incidentes × deploys |
| Tempo de recuperação | da falha até o serviço normalizado | registro de incidentes |

Não precisa de ferramenta para começar. O lead time aproximado de abertura de PR até merge sai direto do GitHub CLI:

```bash
# Horas entre abrir e mergear, nos últimos 50 PRs
gh pr list --state merged --limit 50 --json number,createdAt,mergedAt \
  --jq '.[] | [.number, (((.mergedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)) / 3600 | floor)] | @tsv'
```

A peça que torna lotes pequenos seguros é separar **deploy** de **release**. O código vai para produção desligado e é ativado por cliente, por percentual ou por papel, sem novo deploy:

```ts title="billing/close-invoice.ts"
// Deploy ≠ release: o fluxo novo já está em produção, mas só roda para quem foi ligado.
// A flag tem dono e data de validade, como qualquer exceção.
if (await flags.isEnabled("new-billing-engine", { tenantId })) {
  return closeWithNewEngine(invoice);
}
return closeWithLegacyEngine(invoice);
```

Cada entrega pequena que funciona é um depósito de confiança entre quem constrói e quem contrata. É essa confiança acumulada, mais do que qualquer contrato, que permite tomar decisões difíceis em conjunto quando a próxima urgência aparecer. E ela sempre aparece.
