---
slug: frontends-melhores-com-skills
category: AI
date: 2026-09-14
word: CONTEXTO
title: Better frontends with Claude Code skills
excerpt: The model knows React, but it does not know your design system. How to use skills, automated visual verification, lint, and hooks so AI-generated interface code comes out matching the product.
---

## The model knows React, not your product

Asking a language model for a screen without context produces the internet's average frontend: Tailwind's default palette, arbitrary spacing like `p-[13px]`, a new `<Button>` when the project already has three, a `div` with `onClick` instead of a `button`, and no loading, empty, or error state. None of that is a lack of capability. It is a lack of information: the model knows React very well and knows nothing about the decisions your team has already made.

The lever, then, is context. Claude Code offers three places to put it, each with a different cost:

| Mechanism | When it acts | Good for |
|---|---|---|
| `CLAUDE.md` | always, in every conversation | short, universal facts: commands, stack, folder layout |
| Skill | description always visible; body only when relevant | domain knowledge and workflows: design system, verification |
| Hook | outside the model, on every event | rules that must hold 100% of the time |

The most common mistake is putting everything in `CLAUDE.md`. An 800-line interface guide loaded into every conversation, including the ones about a database migration, burns context and dilutes exactly the instructions that matter. Skills solve that with progressive loading.

## Anatomy of a skill

A skill is a directory with a `SKILL.md` file. Project skills live in `.claude/skills/<name>/` and are versioned with the code: the whole team, and every Claude Code session opened in the repository, works with the same conventions.

```text title="repository tree"
.claude/skills/
├── ui/
│   ├── SKILL.md              # rules and workflow: enters context when invoked
│   └── references/
│       ├── tokens.md         # generated from the CSS, read on demand
│       └── patterns.md       # forms, tables, empty states
└── verify-ui/
    ├── SKILL.md
    └── scripts/
        └── shot.mjs          # executed, never loaded into context
```

Loading happens in three layers. Each skill's name and description are always visible to the model, at a cost of a few dozen tokens. The body of `SKILL.md` only enters when the skill is invoked, by you with `/ui` or by the model itself when the description matches the task. And supporting files are only read, or executed, when the body says so.

![Three stacked bands: at the top, names and descriptions of several skills always in context; in the middle, the body of ui/SKILL.md loaded on invocation; at the bottom, reference files and scripts loaded on demand](figures/skills-camadas.svg "A skill costs almost nothing until it is needed. Long references live in the third layer, out of context until someone needs them.")

That changes the economics of context. You can have a 200-line token guide and a pattern catalogue with full examples without them weighing on any conversation that is not about the interface.

The frontmatter controls when and how the skill acts:

| Field | Effect |
|---|---|
| `description` | the trigger: always in context, it is how the model decides to load the skill |
| `paths` | globs; the skill only loads automatically when working on matching files |
| `allowed-tools` | tools pre-approved during the turn that invokes the skill |
| `disable-model-invocation` | only you invoke it, with `/name`; for actions with side effects |
| `context: fork` | runs in an isolated subagent, without the conversation history |

> [!TIP]
> The description is the part that fails most. "Helps with frontend" fires at the wrong moment or not at all. A good description says what the skill does and when to use it, in the words people actually type in their requests: "screen", "component", "style", "page".

## A design system skill

The `ui` skill holds what an experienced developer on the team would explain to a newcomer on day one: what already exists, where colours come from, which states every screen needs, and what is non-negotiable in accessibility.

```markdown title=".claude/skills/ui/SKILL.md"
---
name: ui
description: This project's interface conventions (tokens, existing components, screen states, accessibility). Use when creating or changing React components, pages, layouts, or styles.
paths:
  - "src/**/*.tsx"
  - "src/**/*.css"
---

# Interface

## Components that already exist
Before creating a component, check this list. Reuse or extend; do not duplicate.

!`ls src/components/ui | sed 's/\.tsx$//'`

## Tokens
- Colour, spacing, radius, and type come from CSS variables. Never hex, rgb,
  or Tailwind arbitrary values (`p-[13px]`, `text-[#333]`).
- Values and usage for every token: [references/tokens.md](references/tokens.md).

## Every screen has four states
- Loading: a skeleton at final dimensions, never a spinner in the middle of the page.
- Empty: explains what is missing and offers the action that fixes it.
- Error: a specific message and "try again".
- With data, including long text and single-item lists.

## Accessibility
- Actions are `<button>`, navigation is `<a>`. Never a `div` with `onClick`.
- Every control has an accessible name: visible text, `<label>`, or `aria-label`.
- Visible focus on every interactive element; never remove `outline` without a replacement.
- Minimum 4.5:1 contrast for text. Colour is never the only signal of state.

## Before finishing
Invoke `verify-ui` with the changed route. The task is only done when it passes.
```

Two technical details make a difference. The first is the line starting with `` !`ls ...` ``: dynamic context injection. The command runs when the skill is invoked and its output replaces the placeholder, so the model receives the real list of components, not a hand-written list that goes stale in the first week.

The second is that `references/tokens.md` is not written by hand. It is generated from the CSS, the same source the browser uses:

```bash title="scripts/sync-tokens.sh"
# Regenerates the token reference from the CSS: the skill can never go stale
{
  echo "# Tokens (generated by scripts/sync-tokens.sh, do not edit by hand)"
  echo
  echo "| token | value (light theme) |"
  echo "|---|---|"
  awk '/^:root \{/,/^\}/' src/app/globals.css \
    | grep -oE -- '--[a-z0-9-]+: [^;]+' \
    | sed -E 's/^(--[a-z0-9-]+): (.*)$/| `\1` | `\2` |/'
} > .claude/skills/ui/references/tokens.md
```

Run that script in a `pre-commit` hook or in CI, and the documentation the model reads and the CSS the user sees have no way to drift apart.

> [!NOTE]
> A skill does not replace taste. It encodes decisions people have already made: that spacing follows a scale, that primary buttons are rare, that tables right-align numbers. If the team has not decided those things yet, the skill will only crystallise the indecision.

## Closing the loop: a skill that looks at the result

Context improves the first attempt. What really changes quality is the model being able to see what it produced. A developer does not ship a screen without opening the browser; an agent should not either.

The `verify-ui` skill turns that check into a procedure the model runs on its own: type checking, lint, an accessibility audit with axe, and screenshots at three widths and two themes. Since Claude reads images, the PNGs come back as input for the next iteration.

![A five-step flow: request, ui skill, edit, eslint hook, and verify-ui; a return arrow goes from verify-ui back to edit, labelled fixes until it passes](figures/ciclo-verificacao.svg "The loop that separates a draft from a delivery. Each pass uses the previous result as context.")

```markdown title=".claude/skills/verify-ui/SKILL.md"
---
name: verify-ui
description: Verifies a frontend route (types, lint, accessibility with axe, screenshots at 3 widths and 2 themes). Use after changing any interface and before declaring the task done.
argument-hint: "[route, e.g. /invoices]"
allowed-tools: Bash(npx tsc *) Bash(npx eslint *) Bash(node *) Read
---

Route: $ARGUMENTS (if empty, the route you just changed).

1. Run `npx tsc --noEmit` and `npx eslint --max-warnings=0` on the changed files.
   Fix everything before moving on.
2. With the dev server running, run `node ${CLAUDE_SKILL_DIR}/scripts/shot.mjs <route>`.
   It writes screenshots to `.shots/` and prints a JSON report.
3. Open EVERY PNG with Read. Look for clipped or overlapping text, horizontal
   scrolling, misalignment, and poor contrast in the dark theme.
4. `overflow: true` or any axe violation with `serious`/`critical` impact blocks delivery.
5. Repeat until it passes. In the final summary, say what you checked and what is still open.
```

The script uses Playwright and `@axe-core/playwright`, and it lives inside the skill itself, so it travels with it:

```js title=".claude/skills/verify-ui/scripts/shot.mjs"
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const route = process.argv[2] ?? "/";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const widths = [390, 768, 1440]; // phone, tablet, desktop
const themes = ["light", "dark"];

const browser = await chromium.launch();
const report = [];

for (const colorScheme of themes) {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme });
    await page.goto(base + route, { waitUntil: "networkidle" });

    const file = `.shots/${route.replaceAll("/", "_")}-${width}-${colorScheme}.png`;
    await page.screenshot({ path: file, fullPage: true });

    // Horizontal scrolling is the most common layout defect on phones
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
> Add `.shots/` to `.gitignore`. And remember that `allowed-tools` pre-approves commands: keep the patterns narrow (`Bash(node *)` is already broad). A verification skill needs no permission to `git push` or delete files.

## Rules become lint, not prose

Instructions in a skill are probabilistic: the model follows them almost always, and "almost always" is not enough for accessibility. Anything that can be checked mechanically should leave the prose and become tooling. The skill explains the why; lint guarantees the what.

```js title="eslint.config.mjs"
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  jsxA11y.flatConfigs.recommended, // clickable divs, images without alt, missing labels…
  {
    files: ["src/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          // className="text-[#333] p-[13px]": an arbitrary value is a parallel design system
          selector: "JSXAttribute[name.name='className'] Literal[value=/\\[(#|\\d+px)/]",
          message: "Use design system tokens, not arbitrary values.",
        },
      ],
    },
  },
];
```

For the model to get that feedback at edit time, not only at the end, a `PostToolUse` hook runs ESLint on the file that was just changed. Exiting with code 2 sends the output back to Claude as an error to fix:

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
# The hook receives the event as JSON on stdin; lint only the file just edited.
file=$(jq -r '.tool_input.file_path // empty')
[[ "$file" =~ \.(ts|tsx)$ ]] || exit 0

# exit 2: stderr goes back to the model, which fixes it before moving on
npx eslint --max-warnings=0 "$file" 1>&2 || exit 2
```

The division of labour becomes clear: `CLAUDE.md` says where things are, the `ui` skill says how we build interfaces here, the hook blocks what must never pass, and `verify-ui` checks the result the way a human would.

## Measuring whether the skill works

A skill is code and deserves the same scepticism. The simplest way to evaluate it is to run the same requests with and without it (switching it off via `skillOverrides` in `settings.json`) and compare objective signals in the resulting diff:

```bash title="scripts/ui-audit.sh"
# Signs of the "internet's average frontend" in lines added on this branch
base=$(git merge-base HEAD main)
added_tsx=$(git diff "$base" -- '*.tsx' | grep '^+' || true)
added_css=$(git diff "$base" -- '*.css' | grep '^+' || true)

echo "hex in components:    $(grep -cE '#[0-9a-fA-F]{3,8}\b' <<<"$added_tsx")"
echo "arbitrary values:     $(grep -cE '\[[0-9]+px\]' <<<"$added_tsx")"
echo "clickable divs:       $(grep -cE '<div[^>]*onClick' <<<"$added_tsx")"
echo "outline removed:      $(grep -cE 'outline(-none|: ?none)' <<<"$added_tsx$added_css")"
echo "new components:       $(git diff --name-only --diff-filter=A "$base" -- src/components/ | wc -l)"
```

Pick five or six fixed requests that represent real work ("list screen with a filter", "sign-up form with validation", "dashboard empty state") and run each in a clean session. If the version with the skill does not consistently lower those numbers, the problem is almost always in one of three places: the description does not fire, the body has too many rules competing for attention, or the rule should have been lint.

> [!TIP]
> Keep `SKILL.md` under 500 lines, as the documentation itself recommends, and push long examples into `references/`. A lean skill is followed more faithfully than an encyclopaedia, for the same reason a one-page style guide gets read more than a fifty-page one.

The real gain is not the model "knowing design". It is the team being able to write down, once, the decisions that used to live in the heads of whoever reviewed PRs, and having them applied on every screen, by humans and agents alike, without depending on someone remembering.
