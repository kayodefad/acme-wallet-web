# Acme Wallet Web

> **Candidates: start with [ASSIGNMENT.md](./ASSIGNMENT.md).**

Web dashboard for Acme Wallet: balances, transactions and currency conversion.

## Getting started

Requires Node 24 (see `.nvmrc`).

```bash
npm ci
npm run dev        # http://localhost:3000
```

The backend is mocked inside this app. See [API.md](./API.md).

## Scripts

| Script                 | What it does                    |
| ---------------------- | ------------------------------- |
| `npm run dev`          | Dev server                      |
| `npm run build`        | Production build                |
| `npm run lint`         | ESLint                          |
| `npm run typecheck`    | `tsc --noEmit`                  |
| `npm test`             | Vitest (unit + component tests) |
| `npm run test:e2e`     | Playwright end-to-end tests     |
| `npm run format`       | Prettier                        |
| `npm run format:check` | Prettier, check only            |

CI runs lint, typecheck, format:check, test and build on every pull request.

## Project layout

```
app/                 Routes (App Router). app/api/** is the mock backend
components/
  ui/                Design-system primitives: Button, Card, Badge, Input, Select, Drawer, Money, ...
  <feature>/         Feature components built from primitives (dashboard/, transactions/, layout/)
lib/
  api/               API client and typed endpoint functions
  format/            Money, date and label formatting
  mock/              Mock backend (out of scope)
styles/tokens.css    Design tokens: colour, spacing, type, radius
types/api.ts         Domain types shared across the app
design/              Pointer to the Figma design supplied with the invitation
```

## Conventions

- **Components.** Primitives live in `components/ui/<Name>/` with their CSS Module and an `index.ts`. They
  know nothing about the domain. Feature components compose primitives. Prefer extending a primitive over
  creating a near-duplicate.
- **Styling.** CSS Modules, using variables from `styles/tokens.css`.
- **Money.** Always integers in minor units. Format with `formatMoney` / `<Money>`, parse input with
  `parseMoney`. Never do arithmetic on floats.
- **Types.** API shapes live in `types/api.ts`. No `any`.
- **Tests.** Colocated as `*.test.ts(x)`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · CSS Modules · Vitest + Testing Library
