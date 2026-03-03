# Dynamic React Business Forms

A React library for rendering complex, configuration-driven forms with a built-in business rules engine. Define your forms as JSON configurations -- field definitions, dependency rules, dropdown options, ordering -- and the library handles rendering, validation, auto-save, and field interactions automatically.

## Packages

| Package | Description | Size |
|---------|-------------|------|
| [`@bghcore/dynamic-forms-core`](./packages/core) | Business rules engine, form orchestration, validation, i18n, wizard, field arrays. UI-library agnostic (React + react-hook-form only, no UI library dependency). | ~88 KB ESM |
| [`@bghcore/dynamic-forms-fluent`](./packages/fluent) | Fluent UI v9 field components (19 field types). | ~40 KB ESM |
| [`@bghcore/dynamic-forms-mui`](./packages/mui) | Material UI (MUI) field components (19 field types). | ~39 KB ESM |

## Quick Start

```bash
# With Fluent UI
npm install @bghcore/dynamic-forms-core @bghcore/dynamic-forms-fluent

# Or with MUI
npm install @bghcore/dynamic-forms-core @bghcore/dynamic-forms-mui @mui/material @emotion/react @emotion/styled
```

```tsx
import {
  BusinessRulesProvider,
  InjectedHookFieldProvider,
  UseInjectedHookFieldContext,
  HookInlineForm,
} from "@bghcore/dynamic-forms-core";
import { createFluentFieldRegistry } from "@bghcore/dynamic-forms-fluent";
// Or: import { createMuiFieldRegistry } from "@bghcore/dynamic-forms-mui";
import { useEffect } from "react";

// Register field components (swap adapters by changing one import)
function FieldRegistrar({ children }: { children: React.ReactNode }) {
  const { setInjectedFields } = UseInjectedHookFieldContext();
  useEffect(() => {
    setInjectedFields(createFluentFieldRegistry());
  }, []);
  return <>{children}</>;
}

function App() {
  const fieldConfigs = {
    name: { component: "Textbox", label: "Name", required: true },
    status: {
      component: "Dropdown",
      label: "Status",
      dropdownOptions: [
        { key: "Active", text: "Active" },
        { key: "Inactive", text: "Inactive" },
      ],
    },
    notes: { component: "Textarea", label: "Notes" },
  };

  const defaultValues = { name: "", status: "Active", notes: "" };

  return (
    <BusinessRulesProvider>
      <InjectedHookFieldProvider>
        <FieldRegistrar>
          <HookInlineForm
            configName="myForm"
            programName="myApp"
            fieldConfigs={fieldConfigs}
            defaultValues={defaultValues}
            saveData={async (data) => {
              console.log("Saving:", data);
              return data;
            }}
          />
        </FieldRegistrar>
      </InjectedHookFieldProvider>
    </BusinessRulesProvider>
  );
}
```

## How It Works

### Configuration-Driven Forms

Every form is defined by a dictionary of `IFieldConfig` objects. Each config specifies:

- **`component`** -- Which field type to render (`"Textbox"`, `"Dropdown"`, `"Toggle"`, etc.)
- **`label`** -- Display label
- **`required`** / **`hidden`** / **`readOnly`** -- Default field states
- **`dependencies`** -- Business rules that change other fields based on this field's value
- **`dependencyRules`** -- AND-condition rules across multiple fields
- **`dropdownDependencies`** -- Dropdown options that change based on other fields
- **`orderDependencies`** -- Dynamic field ordering rules
- **`validations`** -- Sync validation function names from the registry
- **`asyncValidations`** -- Async validation function names (server-side checks)
- **`value`** + **`isValueFunction`** -- Computed values on create/change
- **`fieldArray`** -- Repeating section configuration (min/max items, item fields)

### Business Rules Engine

Rules are **declarative** -- defined as data, not imperative code. When a field value changes, the engine:

1. Reverts previously applied rules on dependent fields
2. Re-evaluates which rules match the new value
3. Applies new rules (required, hidden, readOnly, component swap, validations, etc.)
4. Processes combo (AND) rules across multiple fields
5. Updates dropdown options based on dependency rules
6. Reorders fields if order dependencies are defined

The engine includes **circular dependency detection** via Kahn's algorithm and **config validation** for dev-mode diagnostics.

```tsx
const fieldConfigs = {
  type: {
    component: "Dropdown",
    label: "Type",
    dropdownOptions: [
      { key: "bug", text: "Bug" },
      { key: "feature", text: "Feature" },
    ],
    // When type="bug", make severity required and visible
    dependencies: {
      bug: {
        severity: { required: true, hidden: false },
      },
      feature: {
        severity: { hidden: true },
      },
    },
  },
  severity: {
    component: "Dropdown",
    label: "Severity",
    hidden: true, // hidden by default, shown by business rule
    dropdownOptions: [
      { key: "low", text: "Low" },
      { key: "high", text: "High" },
    ],
  },
};
```

### Multi-Step Wizard

Split forms into wizard steps with conditional visibility and validation:

```tsx
import { HookWizardForm } from "@bghcore/dynamic-forms-core";

const wizardConfig = {
  steps: [
    { id: "basics", title: "Basic Info", fields: ["name", "type"] },
    { id: "details", title: "Details", fields: ["severity", "description"],
      visibleWhen: { fieldName: "type", values: ["bug"] } },
    { id: "review", title: "Review", fields: ["notes"] },
  ],
  validateOnStepChange: true,
};

<HookWizardForm
  wizardConfig={wizardConfig}
  entityData={formValues}
  fieldRules={businessRules}
  errors={formErrors}
  renderStepContent={(fields) => <MyFieldRenderer fields={fields} />}
  renderStepNavigation={({ goNext, goPrev, canGoNext, canGoPrev }) => (
    <div>
      <button onClick={goPrev} disabled={!canGoPrev}>Back</button>
      <button onClick={goNext} disabled={!canGoNext}>Next</button>
    </div>
  )}
/>
```

### Field Arrays (Repeating Sections)

Add "add another" patterns for addresses, line items, etc.:

```tsx
import { HookFieldArray } from "@bghcore/dynamic-forms-core";

<HookFieldArray
  fieldName="contacts"
  config={{
    itemFields: {
      name: { component: "Textbox", label: "Name", required: true },
      email: { component: "Textbox", label: "Email", validations: ["EmailValidation"] },
    },
    minItems: 1,
    maxItems: 5,
    defaultItem: { name: "", email: "" },
  }}
  renderItem={(fieldNames, index, remove) => (
    <div key={index}>
      {/* fieldNames = ["contacts.0.name", "contacts.0.email"] */}
      <MyFieldRenderer fields={fieldNames} />
      <button onClick={remove}>Remove</button>
    </div>
  )}
  renderAddButton={(append, canAdd) => (
    <button onClick={append} disabled={!canAdd}>Add Contact</button>
  )}
/>
```

### Component Injection

The library uses a component injection system for field rendering. Core provides the orchestration, and UI packages provide the field implementations:

```tsx
// Use built-in Fluent UI fields
import { createFluentFieldRegistry } from "@bghcore/dynamic-forms-fluent";
setInjectedFields(createFluentFieldRegistry());

// Or use MUI fields (swap with one line)
import { createMuiFieldRegistry } from "@bghcore/dynamic-forms-mui";
setInjectedFields(createMuiFieldRegistry());

// Or mix in custom fields
setInjectedFields({
  ...createFluentFieldRegistry(),
  MyCustomField: <MyCustomField />,
});
```

### Pluggable Validation

15 built-in validators plus support for custom sync and async validators:

```tsx
import {
  registerValidations,
  registerAsyncValidations,
  createMinLengthValidation,
  createPatternValidation,
} from "@bghcore/dynamic-forms-core";

// Use built-in factory validators
registerValidations({
  MinLength5: createMinLengthValidation(5),
  AlphaOnly: createPatternValidation(/^[a-zA-Z]+$/, "Letters only"),
});

// Add async validators (e.g., server-side uniqueness check)
registerAsyncValidations({
  CheckUniqueEmail: async (value, entityData, signal) => {
    const response = await fetch(`/api/check-email?email=${value}`, { signal });
    const { exists } = await response.json();
    return exists ? "Email already in use" : undefined;
  },
});
```

Built-in validators: `EmailValidation`, `PhoneNumberValidation`, `YearValidation`, `Max150KbValidation`, `Max32KbValidation`, `isValidUrl`, `NoSpecialCharactersValidation`, `CurrencyValidation`, `UniqueInArrayValidation` + factory functions: `createMinLengthValidation`, `createMaxLengthValidation`, `createNumericRangeValidation`, `createPatternValidation`, `createRequiredIfValidation`

### i18n / Localization

All user-facing strings are localizable:

```tsx
import { registerLocale } from "@bghcore/dynamic-forms-core";

registerLocale({
  required: "Obligatoire",
  save: "Sauvegarder",
  cancel: "Annuler",
  saving: "Sauvegarde en cours...",
  invalidEmail: "Adresse e-mail invalide",
  // Partial registration -- unspecified keys fall back to English
});
```

### Config Validation (Dev Mode)

Catch configuration errors early:

```tsx
import { validateFieldConfigs } from "@bghcore/dynamic-forms-core";

const errors = validateFieldConfigs(fieldConfigs, new Set(["Textbox", "Dropdown"]));
// Returns: missing dependency targets, unregistered components,
// unregistered validators, circular dependencies, missing dropdown options
```

## Available Field Types

All 19 field types are available in both the Fluent UI and MUI adapters:

### Editable Fields

| Component Key | Description |
|---------------|-------------|
| `Textbox` | Single-line text input |
| `Number` | Numeric input with validation |
| `Toggle` | Boolean toggle switch |
| `Dropdown` | Single-select dropdown |
| `Multiselect` | Multi-select dropdown |
| `DateControl` | Date picker with clear button |
| `Slider` | Numeric slider |
| `SimpleDropdown` | Dropdown from string array in meta |
| `MultiSelectSearch` | Searchable multi-select |
| `Textarea` | Multiline text with expand-to-modal |
| `DocumentLinks` | URL link CRUD |
| `StatusDropdown` | Dropdown with color status indicator |
| `DynamicFragment` | Hidden field (form state only) |
| `FieldArray` | Repeating section (add/remove items) |

### Read-Only Fields

| Component Key | Description |
|---------------|-------------|
| `ReadOnly` | Plain text display |
| `ReadOnlyArray` | Array of strings |
| `ReadOnlyDateTime` | Formatted date/time |
| `ReadOnlyCumulativeNumber` | Computed sum of other fields |
| `ReadOnlyRichText` | Rendered HTML |
| `ReadOnlyWithButton` | Text with action button |

## Architecture

```
<BusinessRulesProvider>          -- Owns rule state via useReducer (memoized)
  <InjectedHookFieldProvider>    -- Component injection registry (memoized)
    <HookInlineForm>             -- Form state (react-hook-form), auto-save, business rules
      <HookInlineFormFields>     -- Renders ordered field list
        <HookRenderField>        -- Per-field: Controller + component lookup (React.memo)
          <HookFieldWrapper>     -- Label, error, saving status (React.memo)
            <InjectedField />    -- Your UI component via cloneElement
```

## Building a Custom UI Adapter

See [docs/creating-an-adapter.md](./docs/creating-an-adapter.md) for a complete guide. The short version:

1. Create field components that accept `IHookFieldSharedProps<T>`
2. Build a registry mapping `ComponentTypes` to your field elements
3. Pass the registry via `setInjectedFields()`

## Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build all packages
npm run build

# Build individual packages
npm run build:core
npm run build:fluent
npm run build:mui

# Run tests
npm run test
npm run test:watch
npm run test:coverage

# Clean build output
npm run clean
```

## Project Structure

```
packages/
  core/     -- @bghcore/dynamic-forms-core (React + react-hook-form only)
  fluent/   -- @bghcore/dynamic-forms-fluent (Fluent UI v9 adapter)
  mui/      -- @bghcore/dynamic-forms-mui (Material UI adapter)
docs/
  FINDINGS.md              -- Codebase analysis and strategic plan
  creating-an-adapter.md   -- Guide for building custom UI adapters
```

## License

MIT
