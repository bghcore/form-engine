# @bghcore/dynamic-forms-core

Framework-agnostic business rules engine and form orchestration for configuration-driven React forms. Define forms as JSON -- field definitions, dependency rules, dropdown options, ordering -- and the library handles rendering, validation, auto-save, and field interactions automatically.

## Install

```bash
npm install @bghcore/dynamic-forms-core
```

Peer dependencies: `react` (18 or 19), `react-hook-form` (v7)

## Quick Start

```tsx
import {
  BusinessRulesProvider,
  InjectedHookFieldProvider,
  HookInlineForm,
} from "@bghcore/dynamic-forms-core";

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
};

function App() {
  return (
    <BusinessRulesProvider>
      <InjectedHookFieldProvider>
        <HookInlineForm
          configName="myForm"
          programName="myApp"
          fieldConfigs={fieldConfigs}
          defaultValues={{ name: "", status: "Active" }}
          saveData={async (data) => {
            console.log("Saving:", data);
            return data;
          }}
        />
      </InjectedHookFieldProvider>
    </BusinessRulesProvider>
  );
}
```

You'll also need a UI adapter to provide field components. See [`@bghcore/dynamic-forms-fluent`](https://www.npmjs.com/package/@bghcore/dynamic-forms-fluent) for a ready-made Fluent UI v9 implementation, or build your own.

## Business Rules Engine

Rules are **declarative** -- defined as data in `IFieldConfig.dependencies`, not imperative code.

When a field value changes, the engine:

1. Reverts previously applied rules on dependent fields
2. Re-evaluates which rules match the new value
3. Applies new rules (required, hidden, readOnly, component swap, validations, etc.)
4. Processes combo (AND) rules across multiple fields
5. Updates dropdown options based on dependency rules
6. Reorders fields if order dependencies are defined

```tsx
const fieldConfigs = {
  type: {
    component: "Dropdown",
    label: "Type",
    dropdownOptions: [
      { key: "bug", text: "Bug" },
      { key: "feature", text: "Feature" },
    ],
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
    hidden: true,
    dropdownOptions: [
      { key: "low", text: "Low" },
      { key: "high", text: "High" },
    ],
  },
};
```

## Component Injection

Fields are registered as a `Dictionary<JSX.Element>` via `InjectedHookFieldProvider`. The core library looks up components by string key and passes standardized `IHookFieldSharedProps` via `React.cloneElement`.

```tsx
import { UseInjectedHookFieldContext } from "@bghcore/dynamic-forms-core";

const { setInjectedFields } = UseInjectedHookFieldContext();

setInjectedFields({
  Textbox: <MyTextbox />,
  Dropdown: <MyDropdown />,
  Toggle: <MyToggle />,
});
```

Custom fields receive `IHookFieldSharedProps<T>`:

```tsx
interface IHookFieldSharedProps<T> {
  fieldName?: string;
  value?: unknown;
  readOnly?: boolean;
  required?: boolean;
  error?: FieldError;
  dropdownOptions?: IDropdownOption[];
  setFieldValue?: (fieldName: string, value: unknown, skipSave?: boolean, timeout?: number) => void;
  meta?: T;
  // ... and more
}
```

## Pluggable Validation & Value Functions

Register custom validators and computed value functions:

```tsx
import { registerValidations, registerValueFunctions } from "@bghcore/dynamic-forms-core";

registerValidations({
  maxLength100: (value) => {
    if (typeof value === "string" && value.length > 100) {
      return "Must be 100 characters or less";
    }
    return undefined;
  },
});

registerValueFunctions({
  setCurrentTimestamp: () => new Date().toISOString(),
});
```

Reference them by name in field configs:

```tsx
const fieldConfigs = {
  description: {
    component: "Textarea",
    label: "Description",
    validations: ["maxLength100"],
  },
  createdAt: {
    component: "ReadOnly",
    label: "Created",
    value: "setCurrentTimestamp",
    isValueFunction: true,
    onlyOnCreate: true,
  },
};
```

## Architecture

```
<BusinessRulesProvider>          -- Owns rule state via useReducer
  <InjectedHookFieldProvider>    -- Component injection registry
    <HookInlineForm>             -- Form state (react-hook-form), auto-save, business rules
      <HookInlineFormFields>     -- Renders ordered field list
        <HookRenderField>        -- Per-field: Controller + component lookup
          <HookFieldWrapper>     -- Label, error, saving status
            <InjectedField />    -- Your UI component via cloneElement
```

## Render Props

`HookInlineForm` accepts render props for customization:

```tsx
<HookInlineForm
  renderExpandButton={({ isExpanded, onToggle }) => (
    <button onClick={onToggle}>{isExpanded ? "Show Less" : "Show More"}</button>
  )}
  renderFilterInput={({ onChange }) => (
    <input placeholder="Search..." onChange={(e) => onChange(e.target.value)} />
  )}
  renderDialog={({ isOpen, onSave, onCancel, children }) => (
    <MyDialog open={isOpen} onConfirm={onSave} onDismiss={onCancel}>
      {children}
    </MyDialog>
  )}
  onSaveError={(error) => toast.error(error)}
/>
```

## Building a Custom UI Adapter

To create fields for a different UI library (Material UI, Ant Design, etc.):

1. Create field components that accept `IHookFieldSharedProps<T>`
2. Build a registry mapping component keys to your field elements
3. Pass the registry via `setInjectedFields()`

```tsx
import { IHookFieldSharedProps, ComponentTypes } from "@bghcore/dynamic-forms-core";

const MaterialTextbox = (props: IHookFieldSharedProps<{}>) => {
  const { fieldName, value, readOnly, error, setFieldValue } = props;
  return (
    <TextField
      value={value as string}
      disabled={readOnly}
      error={!!error}
      helperText={error?.message}
      onChange={(e) => setFieldValue(fieldName, e.target.value, false, 3000)}
    />
  );
};

setInjectedFields({
  [ComponentTypes.Textbox]: <MaterialTextbox />,
});
```

## License

MIT
