# AGENTS.md -- @bghcore/dynamic-forms-core

## Package Purpose

UI-library agnostic React library for rendering configuration-driven forms with a built-in business rules engine. This package has **zero UI library dependencies** -- it depends only on React and react-hook-form. It is NOT "framework agnostic" (it is built for React); it is "UI-library agnostic" meaning it does not depend on any specific component library (Fluent UI, MUI, Ant Design, etc.).

## Critical Constraints

- **No UI library imports allowed.** No `@fluentui/*`, no `@mui/*`, no CSS-in-JS libraries. Plain HTML only for any visual elements (see `HookFieldWrapper.tsx`).
- **`strict: true`** in tsconfig.
- **Use `React.JSX.Element`** not bare `JSX.Element` for return types.
- **Use `structuredClone`** for deep copies, not `JSON.parse(JSON.stringify(...))` or lodash.

## Architecture

```
BusinessRulesProvider (useReducer for rule state)
  -> InjectedHookFieldProvider (component registry)
    -> HookInlineForm (react-hook-form, auto-save, business rules init)
      -> HookInlineFormFields (ordered field list)
        -> HookRenderField (Controller + component injection lookup)
          -> HookFieldWrapper (label, error, status chrome -- plain HTML)
            -> React.cloneElement(injectedField, IHookFieldSharedProps)
```

## Key Files

| File | Purpose |
|------|---------|
| `src/helpers/BusinessRulesHelper.ts` | Core rule evaluation (~760 lines, largest file). Processes dependencies, combo rules, dropdown deps, order deps. Exports `ProcessAllBusinessRules`, `GetDefaultBusinessRules`, `normalizeFieldConfig`, etc. |
| `src/helpers/HookInlineFormHelper.ts` | Form initialization, validation execution, value functions, schema merging. Exports `InitOnCreateBusinessRules`, `InitOnEditBusinessRules`, `GetFieldsToRender`, etc. |
| `src/helpers/ValidationRegistry.ts` | Pluggable sync and async validation function registries. Register custom validators via `registerValidations()` / `registerAsyncValidations()`. Includes factory functions: `createMinLengthValidation`, `createMaxLengthValidation`, `createNumericRangeValidation`, `createPatternValidation`, `createRequiredIfValidation`. |
| `src/helpers/ValueFunctionRegistry.ts` | Pluggable value function registry. Register custom value functions via `registerValueFunctions()`. Built-in: `setDate`, `setDateIfNull`, `setLoggedInUser`, `inheritFromParent`. |
| `src/helpers/DependencyGraphValidator.ts` | Cycle detection for field dependencies and order dependencies using Kahn's algorithm. Exports `detectDependencyCycles`, `detectOrderDependencyCycles`, `validateDependencyGraph`. |
| `src/helpers/ConfigValidator.ts` | Dev-mode config validation. Checks missing dependency targets, unregistered components, unregistered validations, circular deps, missing dropdown options. Exports `validateFieldConfigs`. |
| `src/helpers/LocaleRegistry.ts` | i18n locale registry. Exports `registerLocale`, `getLocaleString`, `resetLocale`, `getCurrentLocale`. Defaults to English. |
| `src/helpers/WizardHelper.ts` | Pure functions for multi-step wizard logic. Exports `getVisibleSteps`, `getStepFields`, `getStepFieldOrder`, `validateStepFields`, `isStepValid`, `getStepIndex`. |
| `src/helpers/FieldHelper.ts` | Dropdown sorting utility. Exports `SortDropdownOptions`. |
| `src/components/HookInlineForm.tsx` | Main form component. Orchestrates react-hook-form, auto-save, expand/collapse, confirm modal. |
| `src/components/HookWizardForm.tsx` | Multi-step wizard form component. Uses render props for step content, navigation, and header. |
| `src/components/HookFieldArray.tsx` | Repeatable field group component. Wraps react-hook-form's `useFieldArray` with min/max/reorder support. |
| `src/components/HookRenderField.tsx` | Per-field rendering. Looks up component by string key from injection context. |
| `src/components/HookFieldWrapper.tsx` | Field chrome (label, error, status) using plain HTML -- no UI library. |
| `src/components/HookConfirmInputsModal.tsx` | Confirmation dialog using native `<dialog>` element. |
| `src/providers/BusinessRulesProvider.tsx` | React context provider owning business rules state via useReducer. |
| `src/providers/InjectedHookFieldProvider.tsx` | React context provider for component injection registry. |
| `src/reducers/BusinessRulesReducer.ts` | Reducer for business rules state mutations. |
| `src/types/IFieldConfig.ts` | Primary consumer-facing type. Defines field configuration shape including dependencies, combo rules, dropdown deps, validations, async validations, field arrays. |
| `src/types/IHookFieldSharedProps.ts` | Props contract that all injected field components receive via `React.cloneElement`. |
| `src/types/IWizardConfig.ts` | Wizard step/config types: `IWizardConfig`, `IWizardStep`, `IWizardStepCondition`. |
| `src/types/IFieldArrayConfig.ts` | Field array config type: `IFieldArrayConfig` with `itemFields`, `minItems`, `maxItems`, `defaultItem`, `reorderable`. |
| `src/types/ILocaleStrings.ts` | Localizable string interface: `ICoreLocaleStrings`. |
| `src/utils/index.ts` | Local utilities: `isEmpty`, `isNull`, `deepCopy` (structuredClone), `Dictionary<T>`, `IEntityData`, `SubEntityType`, dropdown helpers. |
| `src/constants.ts` | `ComponentTypes` enum (all component type string keys), `HookInlineFormConstants`, `FIELD_PARENT_PREFIX`. |
| `src/strings.ts` | Default English string literals (legacy, being replaced by `LocaleRegistry`). |

## Testing

- **348 tests** using Vitest
- Run: `npm test` (from monorepo root or `packages/core`)
- Test files are in `src/__tests__/`
- Coverage targets: helpers (BusinessRulesHelper, HookInlineFormHelper, ValidationRegistry, ValueFunctionRegistry, DependencyGraphValidator, ConfigValidator, LocaleRegistry, WizardHelper), reducers (BusinessRulesReducer), and extended validators
- All tests must pass before committing

## Known Issues

- `isReadonly` is **deprecated** -- use `readOnly` instead. `normalizeFieldConfig()` auto-migrates and emits a console warning.
- `CombineBusinessRules` mutates its first argument in place.
- No memoization on provider context values.

## Adding New Features

### Adding a New Business Rule Type

1. Define the rule effect in `IFieldConfig` (new property or extension of `dependencies`)
2. Add processing logic in `BusinessRulesHelper.ts` (inside `ProcessFieldBusinessRule` or as a new processor)
3. Update `GetDefaultBusinessRules` to initialize the new rule state
4. Add the rule state to `IBusinessRule` if it carries per-field state
5. If it needs reducer support, add an action to `IBusinessRuleActionKeys` and handle in `BusinessRulesReducer`
6. Write tests in `src/__tests__/helpers/`

### Adding a New Validation

```ts
import { registerValidations, createPatternValidation } from "@bghcore/dynamic-forms-core";

registerValidations({
  ZipCodeValidation: createPatternValidation(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  CustomCheck: (value, entityData) => {
    if (someCondition(value)) return "Error message";
    return undefined;
  },
});
```

### Adding a New Value Function

```ts
import { registerValueFunctions } from "@bghcore/dynamic-forms-core";

registerValueFunctions({
  setDefaultPriority: ({ parentEntity }) => parentEntity?.defaultPriority ?? "Medium",
});
```

### Adding a New Locale

```ts
import { registerLocale } from "@bghcore/dynamic-forms-core";

registerLocale({
  saving: "Guardando...",
  required: "Requerido",
  thisFieldIsRequired: "Este campo es obligatorio",
});
```
