# AGENTS.md -- Dynamic React Business Forms

## Setup

```bash
npm install --legacy-peer-deps
npm run build          # Build all packages (core, fluent, mui)
npm run test           # Run 348 tests with Vitest
npm run test:coverage  # Run tests with coverage report
npm run clean          # Remove all dist/ directories
```

Build individual packages:

```bash
npm run build:core     # packages/core only
npm run build:fluent   # packages/fluent only
npm run build:mui      # packages/mui only
```

## Project Structure

Monorepo using npm workspaces. Three packages:

```
packages/
  core/    -- @bghcore/dynamic-forms-core (React + react-hook-form, NO UI library deps)
  fluent/  -- @bghcore/dynamic-forms-fluent (Fluent UI v9 field components)
  mui/     -- @bghcore/dynamic-forms-mui (Material UI field components)
docs/
  creating-an-adapter.md  -- Guide for building custom UI library adapters
  FINDINGS.md             -- Codebase analysis and strategic plan
```

Build output per package: `dist/index.js` (ESM), `dist/index.cjs` (CJS), `dist/index.d.ts` (types). Built with tsup.

**Per-package agent docs:**
- [packages/core/AGENTS.md](./packages/core/AGENTS.md) -- Core engine architecture, constraints, key files
- [packages/fluent/AGENTS.md](./packages/fluent/AGENTS.md) -- Fluent UI adapter patterns
- [packages/mui/AGENTS.md](./packages/mui/AGENTS.md) -- MUI adapter patterns

## Code Style

- Components use `Hook` prefix: `HookTextbox`, `HookDropdown`, `HookInlineForm`
- Read-only variants: `HookReadOnly` prefix in `fields/readonly/`
- Interfaces use `I` prefix: `IFieldConfig`, `IBusinessRule`, `IHookFieldSharedProps`
- Providers export both the component and a `Use*Context` hook
- Use `React.JSX.Element` not bare `JSX.Element`
- camelCase for variables/functions, PascalCase for components/types
- Field components receive `IHookFieldSharedProps<T>` via `React.cloneElement`
- Business rule actions follow Redux action pattern (type enum + payload)
- No lodash -- use local utilities from `utils/index.ts`
- Use `structuredClone` for deep copies (not `JSON.parse(JSON.stringify(...))`)
- All user-facing strings resolve through `LocaleRegistry` for i18n support

## Testing

348 tests using Vitest across 11 test files. Coverage targets met on all core helpers (80%+, many at 100%).

```bash
npm run test             # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

Test files live in `packages/core/src/__tests__/` with shared fixtures in `__fixtures__/`.

## Build Verification

After any code change, verify:

```bash
npm run build && npm run test
```

All three packages should build cleanly and all 348 tests should pass.

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- Single `main` branch
- Per-package tags for publishing: `core-v1.2.1`, `fluent-v1.2.1`, `mui-v1.2.1`
- Run `npm run build && npm run test` before committing

## Boundaries

### Always OK

- Reading any file in the repo
- Running `npm run build`, `npm run test`, `npm run clean`
- Editing source files in `packages/*/src/`
- Creating or editing tests
- Updating documentation

### Ask First

- Adding new npm dependencies
- Changing `tsconfig` or `tsup.config.ts` settings
- Modifying `package.json` exports, peerDependencies, or version numbers
- Renaming or removing public API exports
- Structural changes (new packages, moving files between packages)
- Running `npm publish` or creating release tags

### Never

- Running `rm -rf` on anything outside `dist/` directories
- Force-pushing to `main`
- Committing `.env` files or secrets
- Adding UI library dependencies (`@fluentui/*`, `@mui/*`) to the core package
