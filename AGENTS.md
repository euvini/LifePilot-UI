# LifePilot UI — Guia para agentes

Frontend do **LifePilot AI** (planejamento pessoal & mudança de casa assistida por IA).

## Stack

- Next.js 16 (App Router, `src/`, Turbopack, `cacheComponents`) · React 19 · TypeScript
- Tailwind CSS v4 (config CSS-first, sem `tailwind.config`)
- shadcn/ui (estilo `radix-nova`, primitives `radix-ui`, ícones `lucide-react`, merge de classes com `cn`)
- pnpm

## Design System (Paper)

Fonte da verdade: Paper → arquivo **"LifePilot AI"** (`fileId: 01M61MD1EZJNQHVB7GVCTX4MZ7`).

| Página | Conteúdo |
| --- | --- |
| `01 · Design System` | Fundamentos (cores, tipografia, ícones), componentes base, cards do domínio |
| `02 · Telas & Fluxos` | Workspace & Copiloto IA, Novo Plano (etapas 1/2 e 2/2) |

O servidor MCP do Paper está em [`.mcp.json`](./.mcp.json) (requer o app Paper aberto).

### Regras

1. **Tokens** ficam em `src/styles/tokens.css` com os **mesmos nomes do Paper**
   (`bg-canvas`, `text-ink`, `text-ink-muted`, `bg-primary-soft`, `text-icon-mint`,
   `border-purple-stroke`, `text-xs/xs`, `rounded-lg`…). Não use cores hex soltas nem a
   paleta padrão do Tailwind (`gray-*`, `blue-*`…).
2. A escala tipográfica **substitui** a do Tailwind: `text-xs` 11px · `sm` 12 · `base` 14 ·
   `md` 16 · `lg` 20 · `xl` 28 · `2xl` 36. Raios: `sm` 6 · `md` 10 · `lg` 14 · `xl` 20.
3. Fontes: `font-display` (Bricolage Grotesque — títulos), `font-sans` (Plus Jakarta Sans —
   interface), `font-mono` (JetBrains Mono — datas `YYYY-MM-DD`, status, contadores).
4. As variáveis semânticas do shadcn (`--primary`, `--border`, `--muted`…) apontam para os
   tokens em `src/app/globals.css`. Tema **somente claro**.
5. Ícones ilustrativos duotone: `src/components/icons/duotone.tsx` (`tone`: neutral, pink,
   purple, green). `lucide-react` só para ícones utilitários pequenos (chevron, check…).
6. Ao implementar uma tela do Paper: use `get_jsx` (`format: "tailwind"`,
   `includeNodeIds: false`) e `get_computed_styles` para valores exatos — nunca a partir de
   screenshots — e traduza para os componentes de `src/components/ui`.
7. Ao alterar tokens no Paper, rode `get_basic_info`/`get_tokens` e atualize `tokens.css`.

### Componentes customizados

- `Button`: variantes `default`, `ai`, `ai-solid`, `outline`, `secondary`, `destructive`,
  `ghost`, `link`; tamanhos `default` (42px), `sm` (34px), `lg` (48px), `icon*`.
- `Badge`: status `todo`, `in_progress`, `done`, `ai` com `appearance="soft" | "solid"`.
- `Alert`: `default`, `ai` (HTTP 429), `destructive` (HTTP 503/504).
- `Input`/`Textarea`, `Card`, `Checkbox` ajustados ao Paper.

Referência viva: rota `/design-system`.
