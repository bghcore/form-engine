# API Stability

This document classifies every public export from the `@formosaic/*` packages by stability level and intended audience. Use this guide to understand which APIs are safe to depend on and which are internal implementation details.

## Stability Levels

- **Stable**: Covered by semver. Breaking changes require a major version bump.
- **Internal**: Not part of the public API. May change or be removed in any release without notice.

## Audience Categories

- **All consumers**: Anyone using Formosaic to render forms.
- **Advanced**: Consumers who need direct access to the rules engine or dependency graph.
- **Extension authors**: Developers registering custom validators, value functions, or locales.
- **Adapter authors**: Developers building or maintaining adapter packages.
- **Adapter + CI**: Adapter authors using the contract test infrastructure.
- **Schema importers**: Consumers converting from external schema formats (JSON Schema, Zod).
- **DevTools only**: Internal debugging/profiling tools, not intended for production use.

---

## Export Classification

### Types and Interfaces

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `IFormConfig` | `@formosaic/core` | Stable | All consumers |
| `IFieldConfig` | `@formosaic/core` | Stable | All consumers |
| `IFieldProps` | `@formosaic/core` | Stable | All consumers |
| `IRule` | `@formosaic/core` | Stable | All consumers |
| `ICondition` | `@formosaic/core` | Stable | All consumers |
| `IOption` | `@formosaic/core` | Stable | All consumers |
| `IRuntimeFieldState` | `@formosaic/core` | Stable | All consumers |
| `IRuntimeFormState` | `@formosaic/core` | Stable | All consumers |
| `IWizardConfig` | `@formosaic/core` | Stable | All consumers |

### Components

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `FormEngine` | `@formosaic/core` | Stable | All consumers |
| `FormFields` | `@formosaic/core` | Stable | All consumers |
| `FieldWrapper` | `@formosaic/core` | Stable | All consumers |
| `WizardForm` | `@formosaic/core` | Stable | All consumers |
| `FieldArray` | `@formosaic/core` | Stable | All consumers |
| `ConfirmInputsModal` | `@formosaic/core` | Stable | All consumers |
| `FormErrorBoundary` | `@formosaic/core` | Stable | All consumers |
| `FormDevTools` | `@formosaic/core` | Internal | DevTools only |

### Providers and Context

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `RulesEngineProvider` | `@formosaic/core` | Stable | All consumers |
| `InjectedFieldProvider` | `@formosaic/core` | Stable | All consumers |
| `UseRulesEngineContext` | `@formosaic/core` | Stable | All consumers |
| `UseInjectedFieldContext` | `@formosaic/core` | Stable | All consumers |

### Constants

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `ComponentTypes` | `@formosaic/core` | Stable | All consumers |
| `FormConstants` | `@formosaic/core` | Stable | All consumers |

### Hooks

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `useDraftPersistence` | `@formosaic/core` | Stable | All consumers |
| `useBeforeUnload` | `@formosaic/core` | Stable | All consumers |
| `useFormAnalytics` | `@formosaic/core` | Stable | All consumers |

### Rules Engine (Advanced)

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `evaluateAllRules` | `@formosaic/core` | Stable | Advanced |
| `evaluateAffectedFields` | `@formosaic/core` | Stable | Advanced |
| `buildDependencyGraph` | `@formosaic/core` | Stable | Advanced |
| `evaluateCondition` | `@formosaic/core` | Stable | Advanced |
| `topologicalSort` | `@formosaic/core` | Stable | Advanced |

### Registries (Extension Authors)

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `registerValidators` | `@formosaic/core` | Stable | Extension authors |
| `registerValueFunctions` | `@formosaic/core` | Stable | Extension authors |
| `registerLocale` | `@formosaic/core` | Stable | Extension authors |
| `getLocaleString` | `@formosaic/core` | Stable | Extension authors |
| `resetLocale` | `@formosaic/core` | Stable | Extension authors |

### Adapter Utilities

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `GetFieldDataTestId` | `@formosaic/core/adapter-utils` | Stable | Adapter authors |
| `FieldClassName` | `@formosaic/core/adapter-utils` | Stable | Adapter authors |
| `getFieldState` | `@formosaic/core/adapter-utils` | Stable | Adapter authors |
| `formatDateTime` | `@formosaic/core/adapter-utils` | Stable | Adapter authors |
| `convertBooleanToYesOrNoText` | `@formosaic/core/adapter-utils` | Stable | Adapter authors |
| `isNull` | `@formosaic/core/adapter-utils` | Stable | Adapter authors |

### Contract Test Infrastructure

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `runAdapterContractTests` | `@formosaic/core/testing` | Stable | Adapter + CI |
| `TIER_1_FIELDS` | `@formosaic/core/testing` | Stable | Adapter + CI |
| `ALL_FIELD_TYPES` | `@formosaic/core/testing` | Stable | Adapter + CI |
| `runParityTests` | `@formosaic/core/testing` | Stable | Adapter + CI |

### Schema Import/Export

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `fromRjsfSchema` | `@formosaic/core` | Stable | Schema importers |
| `toRjsfSchema` | `@formosaic/core` | Stable | Schema importers |
| `fromZodSchema` | `@formosaic/core` | Stable | Schema importers |

### Internal / DevTools

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `RenderTracker` | `@formosaic/core` | Internal | DevTools only |
| `EventTimeline` | `@formosaic/core` | Internal | DevTools only |
| `FormDevTools` | `@formosaic/core` | Internal | DevTools only |
| `RuleTracer` | `@formosaic/core` | Internal | DevTools only |

---

## Notes

- Internal exports are tree-shakeable and will not appear in production bundles when unused.
- The `@formosaic/core/adapter-utils` and `@formosaic/core/testing` subpath exports are separate entry points to keep adapter and test dependencies isolated from the main bundle.
- Adapter package exports (e.g., `createFluentFieldRegistry`, `createMuiFieldRegistry`) follow the same Stable/All consumers classification.
