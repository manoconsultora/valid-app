# Análisis: especificación ESLint/Prettier vs valid-app

## 1. Diferencias de entorno

| Aspecto               | Especificación (monorepo)                                                    | valid-app actual                  |
| --------------------- | ---------------------------------------------------------------------------- | --------------------------------- |
| **Formato de config** | `.eslintrc.json` (legacy)                                                    | `eslint.config.mjs` (flat config) |
| **ESLint**            | ^8.57                                                                        | ^9                                |
| **Next**              | ^13                                                                          | 16                                |
| **Estructura**        | Varios proyectos: `portal/`, `portal-backend/`, `subgraph-api/`, `packages/` | Un solo app en `src/`             |

La especificación está pensada para un monorepo con varios tipos de código (Next, Node scripts, backend, subgraph, tests, Markdown). En valid-app solo tenemos **Next + TypeScript** en `src/`, así que aplicamos solo la parte equivalente al primer override (Next/TS/React).

---

## 2. Contenido de la especificación que sí aplica

### Base (reglas generales)

- **Plugins**: `prefer-arrow`, `promise`, `sort-destructure-keys`
- **Reglas**: `arrow-body-style`, `camelcase`, `complexity`, `consistent-return`, `curly`, `max-params`, `no-console`, `no-var`, `object-shorthand`, `prefer-template`, `quotes` single, `sort-keys`, etc.
- **Extends**: `eslint:recommended`, `plugin:promise/recommended`, `prettier`

### Override Next/TS/React (el que nos interesa)

- **Parser**: `@typescript-eslint/parser`
- **Plugins**: `@typescript-eslint`, `import`, `react`
- **Reglas**: `@typescript-eslint/no-shadow`, `@typescript-eslint/no-unused-vars`, `import/order` (grupos, alfabético, newlines-between), `react/jsx-sort-props`, etc.

### Prettier (especificación)

- `arrowParens: "avoid"`
- `quoteProps: "consistent"`
- `semi: false` (en la spec; en valid-app teníamos `true`, se puede unificar)
- `singleQuote: true`
- `prettier-plugin-tailwindcss` para ordenar clases

---

## 3. Lo que no aplica en valid-app (sin cambios)

- **Override `portal/*.config.js`, `scripts/*.js`**: no tenemos scripts Node en esa forma.
- **Override `portal-backend/**`\*\*: no hay backend en este repo.
- **Override `subgraph-api/**`\*\*: no hay subgraph.
- **Override `*.d.ts`**: se puede añadir si se quiere reglas estrictas en declaraciones.
- **Override `*.spec/test`**: no hay Vitest todavía; cuando se agreguen tests, se puede sumar el bloque.
- **Override `*.md`** y **pull_request_template**: opcional; se puede añadir markdownlint más adelante.

---

## 4. Resumen de decisión

- **Mantener**: ESLint 9, flat config (`eslint.config.mjs`), Next 16.
- **Añadir (adaptado)**:
  - Reglas base de la spec que tengan sentido en un app Next (no-var, prefer-arrow, promise, complexity, etc.).
  - Para `src/**/*.{ts,tsx}`: TypeScript + React + `import/order` y `react/jsx-sort-props`.
  - Prettier: `arrowParens`, `quoteProps`, opción de `semi`, plugin Tailwind.
- **Opcional**: Vitest y markdownlint cuando existan tests o se quiera lint de docs.

El archivo `eslint.config.mjs` actualizado implementa esta adaptación (solo Next/TS en `src/`).
