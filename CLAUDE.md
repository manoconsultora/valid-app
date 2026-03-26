# CLAUDE.md — Valid App

## Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript 5 (strict mode)
- **Backend**: Supabase (Auth + PostgreSQL + Storage)
- **Styling**: Tailwind CSS v4
- **Validation**: Zod
- **Linting**: ESLint 9 (flat config) + Prettier 3
- **Path alias**: `@/*` → `src/*`

---

## Methodology & Approach

**Agile**. Senior mindset: 10+ years. No condescension, no boilerplate explanations. Deliver optimal, production-grade solutions.

### Before starting any task

1. **Understand the task** — clarify ambiguities before writing a single line.
2. **Identify all actors** — components, hooks, actions, services, types, DB schema, RLS policies.
3. **If the task touches multiple files** — propose an iteration strategy before coding. Touch each layer in order: types → validation → actions → hooks → UI.

---

## Quality Gate — Non-Negotiable

After every task, **zero lint errors are acceptable**. Run in this order:

```bash
npm run lint:fix       # Auto-fix ESLint issues
npm run format         # Auto-format with Prettier
npm run typecheck      # Confirm TypeScript is clean
```

For a full check before committing:

```bash
npm run check          # typecheck + lint + format:check
```

> **Rule**: `lint:fix` + `format` after every task. `check` before every commit.

---

## Code Style Rules

Derived from `eslint.config.mjs` and `.prettierrc.json`. Violations are CI failures.

### TypeScript

- **Strict mode** is on — no implicit `any`, no unsafe casts.
- Use `@typescript-eslint/no-unused-vars`. Prefix intentionally unused args with `_`.
- No variable shadowing (`@typescript-eslint/no-shadow`).
- Use `no-use-before-define` — declare before referencing.

### Functions & Variables

- **Prefer arrow functions** for single-return expressions (`prefer-arrow/prefer-arrow-functions`).
- No `var` — always `const`/`let`.
- No parameter reassignment (`no-param-reassign`).
- No `else` after `return` (`no-else-return`).
- Arrow functions: omit body braces for single expressions (`arrow-body-style: never`).
- Max **4 parameters** per function. Use an options object for more.
- Max **cyclomatic complexity of 10** per function.

### Naming

- `camelCase` everywhere except DB types (`snake_case`) and React components (`PascalCase`).
- Boolean variables: use `is`, `has`, `can` prefixes.
- Constants: `UPPER_SNAKE_CASE` for module-level constants.

### Strings & Templates

- Single quotes (`'`) — no double quotes.
- Use template literals over concatenation (`prefer-template`).
- No unnecessary template literals (`avoidEscape: true`).

### Objects & Imports

- **Sort object keys** alphabetically (`sort-keys`, case-insensitive, natural order).
- **Sort destructured keys** alphabetically (`sort-destructure-keys`).
- **Sort imports** by group — external → internal → parent → sibling — with newlines between groups (`import/order`).
- Use object shorthand (`object-shorthand`).

### React / JSX

- Sort JSX props alphabetically (`react/jsx-sort-props`).
- No `React` import needed (JSX transform).
- No `prop-types` — TypeScript covers it.

### Promises

- Always catch or return promises (`promise/catch-or-return`, `allowFinally: true`).

### Formatting (Prettier)

- `printWidth`: 90 chars
- `tabWidth`: 2 spaces
- No semicolons
- Single quotes
- Trailing commas: ES5
- Arrow parens: omit for single param (`avoid`)
- Tailwind class order enforced via `prettier-plugin-tailwindcss`

---

## Architecture

### Directory Structure

```
src/
├── app/              # Next.js App Router — pages and layouts
├── components/
│   └── ui/           # Reusable UI primitives
├── hooks/            # Custom React hooks (data fetching, guards, utilities)
├── lib/
│   ├── actions/      # Server Actions (grouped by domain)
│   │   └── <domain>/
│   │       ├── actions.ts   # 'use server' entry points
│   │       ├── helpers.ts   # Business logic
│   │       ├── utils.ts     # Pure utilities
│   │       ├── types.ts     # Domain types
│   │       └── index.ts     # Public exports
│   ├── adapters/     # DB (snake_case) → App (camelCase) converters
│   ├── auth/         # Role utilities (requireRole, getUserRole)
│   ├── supabase/     # Supabase clients (client, server, admin)
│   ├── utils/        # Domain utilities (CUIT, etc.)
│   └── validations/  # Zod schemas
├── services/         # Reusable auth logic (dependency-injected client)
├── types/
│   ├── index.ts      # App types (camelCase)
│   ├── db.ts         # DB types (snake_case)
│   └── database.types.ts  # Auto-generated Supabase types
└── data/             # Mock data (development/testing only)
```

### Supabase Clients — When to Use Which

| Client  | File                     | When                                                   |
| ------- | ------------------------ | ------------------------------------------------------ |
| Browser | `lib/supabase/client.ts` | Hooks, client components                               |
| Server  | `lib/supabase/server.ts` | Server actions, SSR data fetching                      |
| Admin   | `lib/supabase/admin.ts`  | Admin ops only (invite, delete user). Never on client. |

### Data Flow

```
UI Component
  └─> Custom Hook (useXxx)
        └─> Server Action (lib/actions/<domain>/actions.ts)
              ├─> Validation (Zod schema)
              ├─> Business Logic (helpers.ts)
              └─> Supabase (server or admin client)
```

Response contract from server actions:

```typescript
{
  data: T | null
  error: string | null
}
```

### Auth & Authorization

- **Middleware** (`src/middleware.ts`): Redirects unauthenticated users to `/login`. Guards all routes except `/login`, `/unauthorized`, `/auth/*`.
- **Role source**: Always `public.users.role` — never JWT metadata.
- **Client guards**: `useAdminGuard`, `useProveedorGuard` hooks in layouts.
- **Server guards**: `requireRole()` in `lib/auth/roles.ts` for server-side protection.
- **Roles**: `admin` | `proveedor` | `null` (pending assignment).

### Type Layers

- **DB types** (`types/db.ts`): `snake_case`, mirror the Supabase schema.
- **App types** (`types/index.ts`): `camelCase`, used throughout the app.
- **Adapters** (`lib/adapters/db-to-app.ts`): Convert between layers. Never skip this.

---

## Design Patterns

Apply these whenever a new domain or feature is added.

### New Domain / Feature Checklist

1. **Types first**: Add DB type in `types/db.ts`, App type in `types/index.ts`, adapter in `lib/adapters/db-to-app.ts`.
2. **Validation**: Zod schema in `lib/validations/<domain>.ts`. Compose atomic schemas → form schema → update schema (partial).
3. **Server Actions**: Create `lib/actions/<domain>/` with `actions.ts`, `helpers.ts`, `utils.ts`, `types.ts`, `index.ts`.
4. **Hook**: Create `hooks/use<Domain>.ts` — return `{ data, error, loading, refresh }`.
5. **UI**: Build page/component consuming the hook.
6. **DB**: Add migration in `scripts/` (numbered, sequential). Include RLS policies.

### Hook Return Shape (standard)

```typescript
export const useXxx = (): {
  data: T[]
  error: string | null
  loading: boolean
  refresh: () => Promise<void>
} => { ... }
```

### Zod Schema Composition

```typescript
// Atomic first
const emailSchema = z.string().email().trim()

// Compose
export const createXxxSchema = z.object({ email: emailSchema, ... })

// Update is partial
export const updateXxxSchema = createXxxSchema.partial()

// Infer types
export type CreateXxxInput = z.infer<typeof createXxxSchema>
```

### Server Action Pattern

```typescript
'use server'

export const createXxx = async (
  input: CreateXxxInput
): Promise<{ data: Xxx | null; error: string | null }> => {
  const parsed = createXxxSchema.safeParse(input)
  if (!parsed.success) {
    return { data: null, error: parseZodError(parsed.error) }
  }
  // business logic via helpers.ts
}
```

---

## Validation — Zod Rules

- Error messages in **Spanish**.
- Use `.trim()` on all string fields.
- Optional string fields: `.optional().or(z.literal(''))`.
- Custom logic via `.refine()` with descriptive messages.
- Never duplicate schema logic — compose from atomics.

---

## Database & Migrations

- Migrations live in `scripts/` — numbered sequentially (`001_`, `002_`, ...).
- Always include RLS policies with each new table migration.
- DB types are `snake_case`. App types are `camelCase`. Always go through the adapter.
- Auto-generated types in `types/database.types.ts` — regenerate after schema changes with Supabase CLI.

---

## What NOT to Do

- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the client — ever.
- Do not read role from JWT/auth metadata — always from `public.users`.
- Do not skip the adapter layer when converting DB results.
- Do not create helpers for one-off operations.
- Do not add error handling for scenarios that cannot happen.
- Do not add features beyond what was explicitly requested.
- Do not add comments where the code is self-evident.
- Do not use `var`. Do not use `any` unless absolutely unavoidable with a comment.
- Do not leave `console.log` statements in committed code.

## CSS Review — Rol por defecto

Cuando se pida revisar, auditar, o evaluar componentes, clases Tailwind, migraciones o arquitectura CSS, actuar como **frontend senior**. Emitir veredicto con esta estructura:

| Área                  | Puntuación | Resumen |
| --------------------- | ---------- | ------- |
| API del componente    | X/10       | ...     |
| Implementación CSS    | X/10       | ...     |
| Coherencia de temas   | X/10       | ...     |
| Migración (si aplica) | X/10       | ...     |
| Arquitectura y código | X/10       | ...     |

**Problemas críticos 🔴** → **Problemas menores 🟡** → **Lo que está bien ✅** → **Deuda pendiente 📋**

Citar archivo + fragmento exacto en cada problema. Dar solución concreta. Sin diplomacia innecesaria.

### Sistema de temas

Dos temas en `globals.css`: `:root` (admin, `--accent: #0071e3`) y `.theme-proveedor` (proveedor, `--accent: #667eea`). Mismas custom properties en ambos.

### Tailwind v4 — dos sintaxis

- Variables en `@theme inline` → clase directa: `bg-accent`, `text-warning-soft-text`
- Variables fuera de `@theme` → `border-(--border)`, `text-(--text)`, `rounded-(--radius)`, `bg-(--bg)`
- ❌ Nunca sintaxis v3: `border-[var(--border)]`

### Componentes UI

- `Button.tsx` — variantes: `accent`, `accent-outline`, `ghost`, `icon`, `warning-soft`, `success-soft`
- `Badge.tsx` — referencia de patrón

### Deuda técnica

No está hardcodeada aquí. Al revisar, detectarla leyendo el proyecto:

- Clases CSS globales legacy que deberían ser componentes (`btn-*`, `card-*`, etc.)
- Componentes con clases inline repetidas 3+ veces → candidatos a variante
- Archivos que mezclan el componente viejo y el nuevo en el mismo import
- Tokens hardcodeados (`#xxxxxx`) donde debería haber una variable CSS

Reportar lo encontrado en la sección **Deuda pendiente 📋** del veredicto.
