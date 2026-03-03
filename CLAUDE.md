# dynamic-react-business-forms

## Project Overview

A React library for rendering complex, configuration-driven forms with a built-in business rules engine. Forms are defined as JSON configurations (field definitions, dependency rules, dropdown options, ordering) and the library handles rendering, validation, auto-save, and field interactions automatically.

Published as three npm packages:
- `@bghcore/dynamic-forms-core` -- UI-library agnostic business rules engine and form orchestration (React + react-hook-form only)
- `@bghcore/dynamic-forms-fluent` -- Fluent UI v9 field component implementations
- `@bghcore/dynamic-forms-mui` -- Material UI (MUI) field component implementations

## Architecture

### Rendering Pipeline

```
Config Name
  -> HookInlineForm (form state via react-hook-form, save with AbortController/retry)
    -> initBusinessRules() -> business rules state
    -> HookInlineFormFields (ordered field list)
      -> HookFormErrorBoundary (per-field crash isolation)
        -> HookRenderField (per field, useMemo for component resolution)
          -> Looks up injectedFields[component] from context
          -> Controller (react-hook-form integration, async validation wired)
          -> HookFieldWrapper (label, error, status chrome, render props for theming)
            -> React.cloneElement(InjectedFieldComponent, fieldProps)
```

### Provider Hierarchy

Two React context providers must wrap the form tree (both memoized via useMemo):

```
<BusinessRulesProvider>          -- Owns rule state via useReducer (memoized context value)
  <InjectedHookFieldProvider>    -- Component injection registry (memoized context value)
    <HookInlineForm>             -- Entry point
```

### Business Rules Engine

Rules are **declarative** -- defined as data in `IFieldConfig.dependencies`, not imperative code.

**Lifecycle:**
1. **Init**: `IFieldConfig[]` + entity data -> `ProcessAllBusinessRules()` -> builds dependency graph + initial rule state
2. **Validate**: `validateDependencyGraph()` checks for circular dependencies via Kahn's algorithm (dev-mode warnings)
3. **Normalize**: `normalizeFieldConfig()` maps deprecated `isReadonly` -> `readOnly` with dev-mode warning
4. **Trigger**: Field value change -> `processBusinessRule()`
5. **Evaluate**: Revert previous rules -> re-evaluate dependents -> apply new rules -> combo (AND) rules -> dropdown deps -> order deps
6. **Apply**: Dispatch to reducer -> React re-render -> fields read updated state

**Rule types supported:**
- Required/Hidden/ReadOnly toggle
- Component type swap
- Validation rule changes (sync + async, wired into HookRenderField with AbortController)
- Computed value functions
- Dropdown option filtering
- Field ordering
- Combo (AND) multi-field conditions
- Confirm input modal trigger

### Component Injection System

Fields are registered as a `Dictionary<JSX.Element>` via `InjectedHookFieldProvider`. `HookRenderField` looks up the component by string key and uses `React.cloneElement()` to pass standardized `IHookFieldSharedProps`. Consumers can override any built-in field or add custom ones.

### Pluggable Registries

Validation and value functions use pluggable registries instead of hardcoded switch/case:
- `ValidationRegistry` -- 15 built-in sync validators + async validation support via `registerAsyncValidations()` (async now wired into HookRenderField with AbortController)
- `ValueFunctionRegistry` -- register custom value functions via `registerValueFunctions()`
- `LocaleRegistry` -- i18n support via `registerLocale()` with partial overrides and English fallback
- `formStateSerialization` -- Date-safe JSON round-trip for draft persistence
- `jsonSchemaImport` -- Convert JSON Schema to `Dictionary<IFieldConfig>`
- `lazyFieldRegistry` -- Create field registries with React.lazy for on-demand loading

## Key Directories

```
packages/
  core/                          -- @bghcore/dynamic-forms-core
    src/
      index.ts                   -- Public API barrel exports
      constants.ts               -- Form constants + ComponentTypes (including FieldArray)
      strings.ts                 -- i18n-aware string literals (getters over LocaleRegistry)
      components/
        HookInlineForm.tsx       -- Main form component (form state, auto-save with AbortController/retry, business rules)
        HookInlineFormFields.tsx -- Field list rendering
        HookRenderField.tsx      -- Per-field routing + Controller (useMemo, no extra render cycle)
        HookFieldWrapper.tsx     -- Field chrome: label, error, status (React.memo, render props for theming)
        HookConfirmInputsModal.tsx -- Confirmation dialog using native <dialog> (focus trap, Escape closes)
        HookWizardForm.tsx       -- Multi-step wizard (render props for nav/headers, step announcements)
        HookFieldArray.tsx       -- Repeating sections via react-hook-form useFieldArray
        HookFormErrorBoundary.tsx -- Per-field error boundary (crash isolation, fallback render prop)
        HookFormDevTools.tsx     -- Dev-only panel: business rules, form values, errors, dependency graph
      helpers/
        BusinessRulesHelper.ts   -- Rule evaluation logic (~700 lines, largest file)
        FieldHelper.ts           -- Dropdown sorting utility
        HookInlineFormHelper.ts  -- Form init, validation (sync+async), value functions, schema merging
        ValidationRegistry.ts    -- 15 sync + async validator registry
        ValueFunctionRegistry.ts -- Pluggable value function registry
        DependencyGraphValidator.ts -- Circular dependency detection (Kahn's algorithm)
        ConfigValidator.ts       -- Dev-mode config validation (deps, components, validators)
        LocaleRegistry.ts        -- i18n: registerLocale(), getLocaleString(), resetLocale()
        WizardHelper.ts          -- getVisibleSteps, getStepFields, validateStepFields
      types/
        IBusinessRule.ts         -- Runtime rule state per field (includes asyncValidations)
        IFieldConfig.ts          -- Static field config (includes asyncValidations, fieldArray)
        IHookFieldSharedProps.ts -- Props contract for injected field components
        ILocaleStrings.ts        -- ICoreLocaleStrings interface (~50 keys)
        IWizardConfig.ts         -- IWizardStep, IWizardConfig, IWizardStepCondition
        IFieldArrayConfig.ts     -- IFieldArrayConfig (itemFields, min/max, reorderable)
        TypedFieldConfig.ts      -- defineFieldConfigs() type-safe field config builder
        IBusinessRulesState.ts, IConfigBusinessRules.ts, IBusinessRuleAction.ts,
        IBusinessRuleActionKeys.ts, IConfirmInputModalProps.ts, IExecuteValueFunction.ts,
        IFieldToRender.ts, IHookPerson.ts, IOrderDependencies.ts, IDropdownOption.ts,
        IHookInlineFormSharedProps.ts
      providers/
        BusinessRulesProvider.tsx -- Business rules state (useCallback + useMemo memoized)
        InjectedHookFieldProvider.tsx -- Component injection (useMemo memoized)
        I*.ts                    -- Provider interfaces
      reducers/
        BusinessRulesReducer.ts  -- useReducer reducer for business rules
      hooks/
        useDraftPersistence.ts   -- Auto-save form state to localStorage, recover on mount
        useBeforeUnload.ts       -- Browser warning on page leave with unsaved changes
      utils/
        index.ts                 -- isEmpty, isNull, deepCopy, Dictionary, etc.
        formStateSerialization.ts -- serializeFormState/deserializeFormState (Date-safe JSON)
        jsonSchemaImport.ts      -- jsonSchemaToFieldConfig (JSON Schema -> IFieldConfig)
        zodSchemaImport.ts       -- zodSchemaToFieldConfig (Zod schema -> IFieldConfig, no zod dep)
        lazyFieldRegistry.ts     -- createLazyFieldRegistry (React.lazy field loading)
      styles.css                 -- Optional CSS custom properties for theming
      __tests__/                 -- Vitest tests (513 tests, 24 files)
        __fixtures__/            -- Shared test configs and entity data
        helpers/                 -- Tests for all helper modules
        reducers/                -- Tests for reducer
    schemas/
      field-config.schema.json   -- JSON Schema for IFieldConfig (IDE autocompletion)
      wizard-config.schema.json  -- JSON Schema for IWizardConfig (IDE autocompletion)

  fluent/                        -- @bghcore/dynamic-forms-fluent
    src/
      index.ts, registry.ts, helpers.ts
      components/ (ReadOnlyText, StatusMessage, HookFormLoading, StatusDropdown/, DocumentLinks/)
      fields/ (13 editable + 6 read-only)

  mui/                           -- @bghcore/dynamic-forms-mui
    src/
      index.ts, registry.ts, helpers.ts
      components/ (ReadOnlyText, StatusMessage, HookFormLoading)
      fields/ (13 editable + 6 read-only, using @mui/material)
```

## Build & Dev

```bash
npm run build            # Build all packages (core, fluent, mui)
npm run build:core       # Build core package only
npm run build:fluent     # Build fluent package only
npm run build:mui        # Build MUI package only
npm run clean            # Remove all dist/ directories
npm run test             # Run all tests (vitest)
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

**Build output per package:** `dist/index.js` (ESM), `dist/index.cjs` (CJS), `dist/index.d.ts` (types)

**Monorepo:** npm workspaces with `packages/core`, `packages/fluent`, `packages/mui`

## Tech Stack

- **React 18/19** with hooks
- **react-hook-form v7** for form state management
- **Fluent UI v9** (`@fluentui/react-components`) for UI components (fluent package)
- **MUI v5/v6** (`@mui/material`) for UI components (mui package)
- **TypeScript** with `strict: true`
- **Vitest** for testing (513 tests across 24 files, 80%+ coverage on core helpers)
- **tsup** for bundling (CJS + ESM + .d.ts)
- **npm workspaces** for monorepo management

## Known Issues

- `isReadonly` is deprecated in favor of `readOnly` (dev-mode warning emitted via `normalizeFieldConfig`)
- `CombineBusinessRules` is now immutable (fixed in v1.4.0)
- Hardcoded English strings in some older code paths (mostly migrated to `LocaleRegistry`)

## Coding Conventions

- Components use `Hook` prefix (e.g., `HookTextbox`, `HookDropdown`)
- Read-only variants in `fields/readonly/` with `HookReadOnly` prefix
- Interfaces use `I` prefix (e.g., `IFieldConfig`, `IBusinessRule`)
- Providers export both the provider component and a `Use*Context` hook
- Field components receive `IHookFieldSharedProps<T>` via `React.cloneElement`
- Business rule actions follow Redux action pattern (type enum + payload)
- All user-facing strings resolve through `LocaleRegistry` for i18n support
