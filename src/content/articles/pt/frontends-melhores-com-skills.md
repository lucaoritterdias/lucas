---
slug: frontends-melhores-com-skills
category: IA
date: 2026-09-14
word: CONTEXTO
title: Frontends melhores com skills do Claude Code
excerpt: O modelo sabe React, mas não conhece o seu design system. Como usar skills, verificação visual automatizada, lint e hooks para que o código de interface gerado por IA saia no padrão do produto.
---

## O modelo sabe React, não sabe o seu produto

Pedir uma tela a um modelo de linguagem sem contexto produz o frontend médio da internet: cores da paleta padrão do Tailwind, espaçamentos arbitrários como `p-[13px]`, um `<Button>` novo quando o projeto já tem três, `div` com `onClick` no lugar de `button`, e nenhum estado de carregamento, vazio ou erro. Nada disso é falta de capacidade. É falta de informação: o modelo conhece React muito bem e não sabe nada sobre as decisões que o seu time já tomou.

A alavanca, portanto, é contexto. O Claude Code oferece três lugares para colocá-lo, e cada um tem um custo diferente:

| Mecanismo | Quando atua | Serve para |
|---|---|---|
| `CLAUDE.md` | sempre, em toda conversa | fatos curtos e universais: comandos, stack, estrutura de pastas |
| Skill | descrição sempre visível; corpo só quando relevante | conhecimento de domínio e fluxos: design system, verificação |
| Hook | fora do modelo, a cada evento | regras que precisam valer 100% das vezes |

O erro mais comum é colocar tudo no `CLAUDE.md`. Um guia de interface de 800 linhas carregado em toda conversa, inclusive nas que tratam de uma migração de banco, consome contexto e dilui justamente as instruções que importam. Skills resolvem isso com carregamento progressivo.

## Anatomia de uma skill

Uma skill é um diretório com um arquivo `SKILL.md`. As skills de projeto ficam em `.claude/skills/<nome>/` e são versionadas junto com o código: o time inteiro, e cada sessão do Claude Code aberta no repositório, passa a trabalhar com as mesmas convenções.

```text title="árvore do repositório"
.claude/skills/
├── ui/
│   ├── SKILL.md              # regras e fluxo: entra no contexto ao ser invocada
│   └── references/
│       ├── tokens.md         # gerado a partir do CSS, lido sob demanda
│       └── patterns.md       # formulários, tabelas, estados vazios
└── verify-ui/
    ├── SKILL.md
    └── scripts/
        └── shot.mjs          # executado, nunca carregado no contexto
```

O carregamento acontece em três camadas. O nome e a descrição de cada skill ficam sempre visíveis para o modelo, a um custo de algumas dezenas de tokens. O corpo do `SKILL.md` só entra quando a skill é invocada, por você com `/ui` ou pelo próprio modelo quando a descrição combina com a tarefa. E os arquivos de apoio só são lidos, ou executados, quando o corpo manda.

![Três faixas empilhadas: no topo, nomes e descrições de várias skills sempre no contexto; no meio, o corpo de ui/SKILL.md carregado ao invocar; embaixo, arquivos de referência e scripts carregados sob demanda](figures/skills-camadas.svg "Uma skill custa quase nada até ser necessária. Referências longas ficam na terceira camada, fora do contexto até alguém precisar delas.")

Isso muda a economia do contexto. Dá para ter um guia de tokens com 200 linhas e um catálogo de padrões com exemplos completos sem que eles pesem em nenhuma conversa que não seja sobre interface.

O frontmatter controla quando e como a skill age:

| Campo | Efeito |
|---|---|
| `description` | o gatilho: sempre no contexto, é por ela que o modelo decide carregar a skill |
| `paths` | globs; a skill só é carregada automaticamente ao trabalhar em arquivos que casam |
| `allowed-tools` | ferramentas pré-aprovadas no turno em que a skill é invocada |
| `disable-model-invocation` | só você invoca, com `/nome`; para ações com efeito colateral |
| `context: fork` | roda num subagente isolado, sem o histórico da conversa |

> [!TIP]
> A descrição é a parte que mais falha. "Ajuda com frontend" dispara na hora errada ou não dispara. Uma boa descrição diz o que a skill faz e quando usar, com as palavras que as pessoas realmente escrevem no pedido: "tela", "componente", "estilo", "página".

## Uma skill de design system

A skill `ui` concentra o que um desenvolvedor experiente do time explicaria a alguém no primeiro dia: o que já existe, de onde vêm as cores, quais estados toda tela precisa ter e o que é inegociável em acessibilidade.

```markdown title=".claude/skills/ui/SKILL.md"
---
name: ui
description: Convenções de interface deste projeto (tokens, componentes existentes, estados de tela, acessibilidade). Use ao criar ou alterar componentes React, páginas, layouts ou estilos.
paths:
  - "src/**/*.tsx"
  - "src/**/*.css"
---

# Interface

## Componentes que já existem
Antes de criar um componente, confira esta lista. Reutilize ou estenda; não duplique.

!`ls src/components/ui | sed 's/\.tsx$//'`

## Tokens
- Cor, espaçamento, raio e tipografia vêm de variáveis CSS. Nunca hex, rgb
  ou valores arbitrários do Tailwind (`p-[13px]`, `text-[#333]`).
- Valores e usos de cada token: [references/tokens.md](references/tokens.md).

## Toda tela tem quatro estados
- Carregando: skeleton com as dimensões finais, nunca spinner no meio da página.
- Vazio: explica o que falta e oferece a ação que resolve.
- Erro: mensagem específica e "tentar de novo".
- Com dados, incluindo textos longos e listas com um só item.

## Acessibilidade
- Ação é `<button>`, navegação é `<a>`. Nunca `div` com `onClick`.
- Todo controle tem nome acessível: texto visível, `<label>` ou `aria-label`.
- Foco visível em todo elemento interativo; nunca remova `outline` sem substituto.
- Contraste mínimo de 4.5:1 para texto. Cor nunca é o único sinal de estado.

## Antes de concluir
Invoque `verify-ui` com a rota alterada. A tarefa só está pronta quando ela passar.
```

Dois detalhes técnicos fazem diferença. O primeiro é a linha que começa com `` !`ls ...` ``: é injeção de contexto dinâmica. O comando roda no momento em que a skill é invocada e a saída substitui o placeholder, então o modelo recebe a lista real de componentes, e não uma lista escrita à mão que envelhece na primeira semana.

O segundo é que `references/tokens.md` não é escrito à mão. Ele é gerado a partir do CSS, a mesma fonte que o navegador usa:

```bash title="scripts/sync-tokens.sh"
# Regenera a referência de tokens a partir do CSS: a skill nunca fica desatualizada
{
  echo "# Tokens (gerado por scripts/sync-tokens.sh, não edite à mão)"
  echo
  echo "| token | valor (tema claro) |"
  echo "|---|---|"
  awk '/^:root \{/,/^\}/' src/app/globals.css \
    | grep -oE -- '--[a-z0-9-]+: [^;]+' \
    | sed -E 's/^(--[a-z0-9-]+): (.*)$/| `\1` | `\2` |/'
} > .claude/skills/ui/references/tokens.md
```

Rodando esse script num `pre-commit` ou no CI, a documentação que o modelo lê e o CSS que o usuário vê não têm como divergir.

> [!NOTE]
> Skill não substitui gosto. Ela codifica decisões que já foram tomadas por pessoas: que o espaçamento segue uma escala, que botões primários são raros, que tabelas alinham números à direita. Se o time ainda não decidiu essas coisas, a skill vai apenas cristalizar a indecisão.

## Fechar o ciclo: uma skill que olha o resultado

Contexto melhora a primeira tentativa. O que realmente muda a qualidade é o modelo conseguir ver o que produziu. Um desenvolvedor não entrega uma tela sem abrir o navegador; um agente também não deveria.

A skill `verify-ui` transforma essa verificação num procedimento que o modelo executa sozinho: checagem de tipos, lint, auditoria de acessibilidade com axe e screenshots em três larguras e dois temas. Como o Claude lê imagens, os PNGs voltam como entrada para a próxima iteração.

![Fluxo em cinco etapas: pedido, skill ui, edição, hook de eslint e verify-ui; uma seta de retorno leva de verify-ui de volta à edição com o rótulo corrige até passar](figures/ciclo-verificacao.svg "O ciclo que separa um rascunho de uma entrega. Cada volta usa o resultado anterior como contexto.")

```markdown title=".claude/skills/verify-ui/SKILL.md"
---
name: verify-ui
description: Verifica uma rota do frontend (tipos, lint, acessibilidade com axe, screenshots em 3 larguras e 2 temas). Use depois de alterar qualquer interface e antes de declarar a tarefa concluída.
argument-hint: "[rota, ex.: /faturas]"
allowed-tools: Bash(npx tsc *) Bash(npx eslint *) Bash(node *) Read
---

Rota: $ARGUMENTS (se vazio, a rota que você acabou de alterar).

1. Rode `npx tsc --noEmit` e `npx eslint --max-warnings=0` nos arquivos alterados.
   Corrija tudo antes de seguir.
2. Com o dev server no ar, rode `node ${CLAUDE_SKILL_DIR}/scripts/shot.mjs <rota>`.
   Ele grava prints em `.shots/` e imprime um relatório JSON.
3. Abra TODOS os PNGs com Read. Procure texto cortado ou sobreposto, rolagem
   horizontal, desalinhamentos e contraste ruim no tema escuro.
4. `overflow: true` ou violação do axe com impacto `serious`/`critical` bloqueiam a entrega.
5. Repita até passar. No resumo final, diga o que verificou e o que ficou pendente.
```

O script usa Playwright e o `@axe-core/playwright`, e fica dentro da própria skill, então viaja junto com ela:

```js title=".claude/skills/verify-ui/scripts/shot.mjs"
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const route = process.argv[2] ?? "/";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const widths = [390, 768, 1440]; // celular, tablet, desktop
const themes = ["light", "dark"];

const browser = await chromium.launch();
const report = [];

for (const colorScheme of themes) {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme });
    await page.goto(base + route, { waitUntil: "networkidle" });

    const file = `.shots/${route.replaceAll("/", "_")}-${width}-${colorScheme}.png`;
    await page.screenshot({ path: file, fullPage: true });

    // Rolagem horizontal é o defeito de layout mais comum no celular
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);

    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    report.push({
      file,
      overflow,
      violations: violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
    });
    await page.close();
  }
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
```

> [!WARNING]
> Adicione `.shots/` ao `.gitignore`. E lembre que `allowed-tools` pré-aprova comandos: mantenha os padrões estreitos (`Bash(node *)` já é amplo). Uma skill de verificação não precisa de permissão para `git push` nem para apagar arquivos.

## O que é regra vira lint, não prosa

Instruções numa skill são probabilísticas: o modelo segue quase sempre, e "quase sempre" não basta para acessibilidade. Tudo o que pode ser verificado mecanicamente deveria sair da prosa e virar ferramenta. A skill explica o porquê; o lint garante o quê.

```js title="eslint.config.mjs"
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  jsxA11y.flatConfigs.recommended, // div clicável, imagem sem alt, label ausente…
  {
    files: ["src/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          // className="text-[#333] p-[13px]": valor arbitrário é design system paralelo
          selector: "JSXAttribute[name.name='className'] Literal[value=/\\[(#|\\d+px)/]",
          message: "Use tokens do design system, não valores arbitrários.",
        },
      ],
    },
  },
];
```

Para que o modelo receba esse feedback no momento da edição, e não só no fim, um hook `PostToolUse` roda o ESLint no arquivo que acabou de ser alterado. Saída com código 2 volta para o Claude como erro a corrigir:

```json title=".claude/settings.json"
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/lint-edited.sh" }]
      }
    ]
  }
}
```

```bash title=".claude/hooks/lint-edited.sh"
#!/usr/bin/env bash
# O hook recebe o evento em JSON no stdin; lint só no arquivo recém-editado.
file=$(jq -r '.tool_input.file_path // empty')
[[ "$file" =~ \.(ts|tsx)$ ]] || exit 0

# exit 2: o stderr volta para o modelo, que corrige antes de seguir
npx eslint --max-warnings=0 "$file" 1>&2 || exit 2
```

A divisão de trabalho fica clara: o `CLAUDE.md` diz onde as coisas estão, a skill `ui` diz como fazemos interface aqui, o hook impede o que nunca pode passar e a `verify-ui` confere o resultado como um humano conferiria.

## Medir se a skill funciona

Uma skill é código e merece o mesmo ceticismo. A forma mais simples de avaliá-la é rodar os mesmos pedidos com e sem ela (desligando-a em `skillOverrides` no `settings.json`) e comparar sinais objetivos no diff gerado:

```bash title="scripts/ui-audit.sh"
# Sinais de "frontend médio da internet" nas linhas adicionadas neste branch
base=$(git merge-base HEAD main)
added_tsx=$(git diff "$base" -- '*.tsx' | grep '^+' || true)
added_css=$(git diff "$base" -- '*.css' | grep '^+' || true)

echo "hex em componentes:   $(grep -cE '#[0-9a-fA-F]{3,8}\b' <<<"$added_tsx")"
echo "valores arbitrários:  $(grep -cE '\[[0-9]+px\]' <<<"$added_tsx")"
echo "div clicável:         $(grep -cE '<div[^>]*onClick' <<<"$added_tsx")"
echo "outline removido:     $(grep -cE 'outline(-none|: ?none)' <<<"$added_tsx$added_css")"
echo "componentes novos:    $(git diff --name-only --diff-filter=A "$base" -- src/components/ | wc -l)"
```

Escolha cinco ou seis pedidos fixos que representem o trabalho real ("tela de listagem com filtro", "formulário de cadastro com validação", "estado vazio do dashboard") e rode cada um em sessões limpas. Se a versão com skill não reduz esses números de forma consistente, o problema quase sempre está em um de três lugares: a descrição não dispara, o corpo tem regras demais competindo por atenção, ou a regra deveria ser lint.

> [!TIP]
> Mantenha o `SKILL.md` abaixo de 500 linhas, como a própria documentação recomenda, e empurre exemplos longos para `references/`. Uma skill enxuta é seguida com mais fidelidade do que uma enciclopédia, pelo mesmo motivo que um guia de estilo de uma página é mais lido do que um de cinquenta.

O ganho real não é o modelo "saber design". É o time conseguir escrever, uma vez, as decisões que antes viviam na cabeça de quem revisava PRs, e fazer com que elas sejam aplicadas em cada tela, por humanos e por agentes, sem depender de alguém lembrar.
