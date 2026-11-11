# LifePilot UI 🧭

Frontend do **LifePilot AI** — Copiloto inteligente para planejamento de mudanças de vida e residência nacionais e internacionais.

Projetado e implementado a partir do Design System **Botanical Calm** no **Paper**.

---

## 🚀 Tecnologias & Arquitetura

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Turbopack, React 19, Cache Components / Partial Prerendering)
- **Linguagem**: TypeScript 5
- **Estilização**: Tailwind CSS v4 (configuração CSS-first, tokens semânticos do Design System)
- **Componentes**: Baseados em [shadcn/ui](https://ui.shadcn.com) (`radix-nova`, `radix-ui`, `lucide-react`) customizados para a estética *Botanical Calm*
- **Gerenciador de Pacotes**: [pnpm](https://pnpm.io)
- **Persistência & Resiliência**: Camada offline-first com outbox store (`localStorage` + sincronização automática)

---

## 🎨 Design System (Paper)

- **Cores & Tokens**: `bg-canvas`, `bg-surface`, `text-ink`, `text-ink-secondary`, `bg-primary-soft`, `text-icon-mint`, `border-purple-stroke` em `src/styles/tokens.css`.
- **Tipografia**:
  - `font-display`: **Bricolage Grotesque** (Títulos e números de destaque)
  - `font-sans`: **Plus Jakarta Sans** (Interface e leitura)
  - `font-mono`: **JetBrains Mono** (Datas, rotas técnicas, tags e contadores)
- **Ícones Duotone**: Componentes duotone exclusivos em `src/components/icons/duotone.tsx` com suporte a temas tonais (`green`, `pink`, `purple`, `neutral`).

Catálogo vivo de componentes disponível na rota `/design-system`.

---

## 📱 Funcionalidades

1. **Dashboard Executivo (`/`)**:
   - Métricas em tempo real (total de planos, contagem regressiva para a próxima mudança, progresso global e status do Copiloto IA).
   - Onboarding ilustrado quando nenhum plano estiver cadastrado.
   - Cards de planos em andamento com acesso rápido ao workspace e exclusão de planos com confirmação.
   - Ações prioritárias pendentes com alternância de status em 1 clique.
2. **Workspace do Plano & Copiloto IA (`/planos/[id]`)**:
   - Checklist interativo com filtros rápidos (*Todas*, *Em Andamento*, *Sugestões da IA*).
   - Geração de sugestões com IA em tempo real conectada ao backend LifePilot (Ollama / Llama 3.2).
   - Adição manual rápida de tarefas com validação de datas limites.
   - Alternância de status (`TODO` → `IN_PROGRESS` → `DONE`) otimista com persistência e sincronização em background.
3. **Novo Plano Wizard (`/novo-plano`)**:
   - Etapa 1: Definição de rota (Origem, Destino, Teto da Mudança e quantidade de sugestões).
   - Etapa 2: Sugestões geradas pela IA revisadas em memória, com ajuste de prazos e confirmação atômica via transação de banco.

---

## 🛠️ Como Executar Localmente

### Pré-requisitos
- Node.js 20+
- pnpm 9+
- Backend [LifePilot-AI](https://github.com/euvini/LifePilot-AI) rodando na porta `3333` (com PostgreSQL e Ollama)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/euvini/LifePilot-UI.git
cd LifePilot-UI

# Instale as dependências
pnpm install
```

### Configuração de Ambiente

Crie um arquivo `.env.local` caso queira sobrescrever os apontamentos padrão:

```env
# O Next.js já realiza proxy de /api/v1/* para http://localhost:3333/api/v1/*
NEXT_PUBLIC_API_URL=/api/v1
BACKEND_URL=http://localhost:3333
```

### Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento com Turbopack
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🧪 Qualidade de Código & Build

```bash
# Verificação de tipos TypeScript
pnpm exec tsc --noEmit

# Linter (ESLint)
pnpm lint

# Build de produção otimizado
pnpm build
```

---

## 📄 Licença

Distribuído sob licença proprietária para o ecossistema LifePilot AI.
