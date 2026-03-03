# Field Configuration Reference

This is the complete reference for `IFieldConfig`, the primary consumer-facing type used to define forms as JSON configuration. Each form is defined as a `Dictionary<IFieldConfig>` (i.e., `Record<string, IFieldConfig>`) where the key is the field name and the value is its configuration.

At runtime, field configs are processed into `IBusinessRule` objects by the business rules engine.

---

## Complete Property Reference

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `component` | `string` | `undefined` | UI component type key (e.g., `"Textbox"`, `"Dropdown"`, `"Toggle"`). Must match a registered component in `InjectedHookFieldProvider`. |
| `required` | `boolean` | `false` | Whether the field is required for form submission. Can be overridden by dependency rules. |
| `hidden` | `boolean` | `false` | Whether the field is hidden (not rendered). Can be toggled by dependency rules. Hidden fields skip validation. |
| `readOnly` | `boolean` | `false` | Whether the field is read-only (rendered but not editable). Preferred over `isReadonly`. |
| `isReadonly` | `boolean` | `false` | **Deprecated.** Use `readOnly` instead. Maps to `readOnly` during normalization. Emits a console warning in dev mode. |
| `disabled` | `boolean` | `false` | Whether the field is disabled at the layout level. Affects the read-only calculation. |
| `label` | `string` | `undefined` | Display label for the field. Used in `HookFieldWrapper` and filter matching. |
| `defaultValue` | `string \| number \| boolean` | `undefined` | Default value applied when the field is visible and its current value is null. |
| `value` | `string \| number \| boolean \| Date` | `undefined` | Static value, or a value function name when `isValueFunction` is `true`. |
| `isValueFunction` | `boolean` | `false` | If `true`, the `value` property is treated as a value function name from the `ValueFunctionRegistry`. |
| `computedValue` | `string` | `undefined` | Expression string evaluated reactively on dependency changes. Uses `$values.fieldName` for references (see [Expression Engine Reference](./expression-syntax.md)). |
| `onlyOnCreate` | `boolean` | `false` | If `true`, the field's value function runs only during create (not edit). |
| `onlyOnCreateValue` | `string \| number \| boolean \| Date` | `undefined` | Static value to set during create when `onlyOnCreate` is `true` and `isValueFunction` is `false`. |
| `confirmInput` | `boolean` | `false` | Whether changing fields that depend on this one triggers a confirmation modal before save. |
| `hideOnCreate` | `boolean` | `false` | If `true`, the field is not rendered when the form is in create mode. |
| `skipLayoutReadOnly` | `boolean` | `false` | If `true`, the field ignores the layout-level disabled/readOnly override. |
| `dependencies` | `Dictionary<Dictionary<IFieldConfig>>` | `undefined` | Declarative dependency rules keyed by trigger field value. See [Dependencies](#dependencies) section. |
| `dependencyRules` | `IDependencyAndRules` | `undefined` | AND-condition (combo) dependency rules requiring multiple fields to match before applying config changes. |
| `dropdownDependencies` | `Dictionary<Dictionary<string[]>>` | `undefined` | Dropdown filtering dependencies keyed by trigger field value. See [Dropdown Dependencies](#dropdown-dependencies) section. |
| `orderDependencies` | `OrderDependencyMap` | `undefined` | Order dependency rules that dynamically reorder fields based on another field's value. |
| `validations` | `string[]` | `undefined` | Sync validation function names from the `ValidationRegistry`. |
| `asyncValidations` | `string[]` | `undefined` | Async validation function names from the async `ValidationRegistry`. |
| `asyncValidationDebounceMs` | `number` | `undefined` | Debounce delay in milliseconds for async validations. |
| `crossFieldValidations` | `string[]` | `undefined` | Cross-field validation names. Validators receive all form values. |
| `dropdownOptions` | `IDropdownOption[]` | `undefined` | Static dropdown options for Dropdown, StatusDropdown, and Multiselect components. |
| `deprecatedDropdownOptions` | `IDeprecatedOption[]` | `undefined` | Deprecated dropdown option mappings for backward compatibility with old values. |
| `meta` | `Dictionary<string \| boolean \| number \| string[] \| object>` | `undefined` | Arbitrary metadata passed through to the field component (e.g., icons, sort settings). |
| `fieldArray` | `IFieldArrayConfig` | `undefined` | Configuration for repeating field array (sub-form) behavior. |

---

## Property Groups

### Basic Properties

These are the most commonly used properties for defining a field.

| Property | Type | Description |
|----------|------|-------------|
| `component` | `string` | The component type key. Must match a registered component. See [Built-in Component Types](#built-in-component-types). |
| `required` | `boolean` | Marks the field as required. The required indicator appears in the field wrapper. |
| `hidden` | `boolean` | Hides the field entirely. Hidden fields are excluded from validation. |
| `readOnly` | `boolean` | Renders the field but prevents editing. |
| `disabled` | `boolean` | Layout-level disable flag. |
| `label` | `string` | The field's display label. |

```typescript
const fieldConfigs = {
  title: {
    component: "Textbox",
    required: true,
    label: "Project Title",
  },
  status: {
    component: "Dropdown",
    required: true,
    label: "Status",
    dropdownOptions: [
      { key: "Active", text: "Active" },
      { key: "Inactive", text: "Inactive" },
    ],
  },
  notes: {
    component: "Textarea",
    label: "Notes",
    readOnly: false,
  },
};
```

---

### Dependencies

Dependencies are the core mechanism for declarative business rules. When this field's value matches a dependency key, the specified config overrides are applied to the target fields.

**Structure:** `Dictionary<Dictionary<IFieldConfig>>`

```
dependencies: {
  [thisFieldValue: string]: {
    [targetFieldName: string]: IFieldConfig  // Config overrides to apply
  }
}
```

**Example: Simple value-based rules**

```typescript
// On the "status" field config:
dependencies: {
  "Active": {                    // When "status" value is "Active"
    "endDate": {                 // Apply these changes to "endDate"
      hidden: true,              // Hide the endDate field
    },
    "assignee": {
      required: true,            // Make assignee required
    },
  },
  "Inactive": {                  // When "status" value is "Inactive"
    "endDate": {
      hidden: false,             // Show the endDate field
      required: true,            // Make it required
    },
    "assignee": {
      required: false,           // Assignee is no longer required
      readOnly: true,            // Make it read-only
    },
  },
}
```

**Example: Component type swap**

```typescript
dependencies: {
  "Custom": {
    "reason": {
      component: "Textarea",     // Swap from Textbox to Textarea
    },
  },
  "Standard": {
    "reason": {
      component: "Dropdown",     // Swap to Dropdown
      dropdownOptions: [
        { key: "budgetCut", text: "Budget Cut" },
        { key: "completed", text: "Completed" },
      ],
    },
  },
}
```

**How value matching works:**

- Values are compared using string comparison: `String(fieldValue) === ruleKey`
- `null` and `undefined` field values match the empty string key `""`
- Boolean values are stringified: `true` matches `"true"`, `false` matches `"false"`

---

### Combo (AND) Dependency Rules

`dependencyRules` requires ALL referenced fields to have specific values before the rule is applied. This is placed on the **target** field (the field that changes), not on the trigger fields.

**Structure: `IDependencyAndRules`**

```typescript
interface IDependencyAndRules {
  /** Config overrides to apply when all rules are met. */
  updatedConfig: Dictionary<IFieldConfig>;
  /** Dictionary of field names to arrays of acceptable values (all must match). */
  rules: Dictionary<string[]>;
}
```

**Example:**

```typescript
// On the "specialApproval" field config:
dependencyRules: {
  rules: {
    "status": ["Active"],           // status must be "Active"
    "priority": ["High", "Critical"], // AND priority must be "High" or "Critical"
  },
  updatedConfig: {
    "specialApproval": {            // Apply to self (or other fields)
      hidden: false,
      required: true,
    },
  },
}
```

When all conditions are met, the `updatedConfig` is applied. When any condition fails, the field reverts to its default config state.

---

### Dropdown Dependencies

`dropdownDependencies` filters the available dropdown options for dependent fields based on this field's value.

**Structure:** `Dictionary<Dictionary<string[]>>`

```
dropdownDependencies: {
  [thisFieldValue: string]: {
    [targetDropdownField: string]: string[]  // Allowed option keys
  }
}
```

**Example:**

```typescript
// On the "category" field config:
dropdownDependencies: {
  "Engineering": {
    "subCategory": ["frontend", "backend", "devops", "qa"],
  },
  "Design": {
    "subCategory": ["ux", "ui", "graphic", "motion"],
  },
  "Marketing": {
    "subCategory": ["content", "seo", "social", "email"],
  },
}
```

When the "category" field value is "Engineering", the "subCategory" dropdown only shows options with keys "frontend", "backend", "devops", and "qa". Options are sorted alphabetically by default unless `meta.disableAlphabeticSort` is set to `true` on the target field.

---

### Order Dependencies

`orderDependencies` dynamically reorders fields based on a field's value. The field that has `orderDependencies` becomes the "pivotal root field" for ordering.

**Structure: `OrderDependencyMap`**

```typescript
interface OrderDependencyMap {
  [key: string]: string[] | OrderDependencyMap;  // Recursive: value-based or nested
}
```

**Example: Simple reordering**

```typescript
// On the "formType" field config:
orderDependencies: {
  "Simple": ["formType", "title", "description", "status"],
  "Advanced": ["formType", "title", "priority", "assignee", "description", "startDate", "endDate", "status"],
}
```

**Example: Nested (cascading) reordering**

```typescript
orderDependencies: {
  "TypeA": {
    "subType": {                  // Further branch on "subType" field value
      "Sub1": ["field1", "field2", "field3"],
      "Sub2": ["field1", "field3", "field2"],
    },
  },
  "TypeB": ["field3", "field1", "field2"],
}
```

---

### Validation

| Property | Type | Description |
|----------|------|-------------|
| `validations` | `string[]` | Sync validation function names from the `ValidationRegistry`. |
| `asyncValidations` | `string[]` | Async validation function names (return `Promise`). |
| `asyncValidationDebounceMs` | `number` | Debounce delay in ms for async validations (prevents rapid API calls). |
| `crossFieldValidations` | `string[]` | Cross-field validation names. Validators receive all form values, not just this field's value. |

```typescript
{
  email: {
    component: "Textbox",
    label: "Email",
    validations: ["isValidEmail"],
    asyncValidations: ["checkEmailUnique"],
    asyncValidationDebounceMs: 500,
  },
  endDate: {
    component: "DateControl",
    label: "End Date",
    crossFieldValidations: ["endDateAfterStartDate"],
  },
}
```

Validation functions are registered via the pluggable `ValidationRegistry`:

```typescript
import { registerValidations, registerAsyncValidations, registerCrossFieldValidations } from "@bghcore/dynamic-forms-core";

registerValidations({
  isValidEmail: (value) => {
    if (!value) return undefined; // valid
    return /^[^@]+@[^@]+$/.test(String(value)) ? undefined : "Invalid email";
  },
});

registerAsyncValidations({
  checkEmailUnique: async (value) => {
    const exists = await api.checkEmail(value);
    return exists ? "Email already in use" : undefined;
  },
});

registerCrossFieldValidations({
  endDateAfterStartDate: (value, allValues) => {
    if (allValues.startDate && value && value <= allValues.startDate) {
      return "End date must be after start date";
    }
    return undefined;
  },
});
```

The library also provides factory functions for common validations:

| Factory | Description |
|---------|-------------|
| `createMinLengthValidation(name, min)` | Minimum character length |
| `createMaxLengthValidation(name, max)` | Maximum character length |
| `createNumericRangeValidation(name, min, max)` | Number must be within range |
| `createPatternValidation(name, regex, message)` | Regex pattern match |
| `createRequiredIfValidation(name, dependentField, dependentValue)` | Required when another field has a specific value |

---

### Values

| Property | Type | Description |
|----------|------|-------------|
| `defaultValue` | `string \| number \| boolean` | Applied when the field is visible and its current value is null. |
| `value` | `string \| number \| boolean \| Date` | Static value or value function name (when `isValueFunction` is true). |
| `isValueFunction` | `boolean` | Treats `value` as a function name from the `ValueFunctionRegistry`. |
| `computedValue` | `string` | Expression string evaluated reactively. See [Expression Engine Reference](./expression-syntax.md). |
| `onlyOnCreate` | `boolean` | Value function/value runs only during create mode. |
| `onlyOnCreateValue` | `string \| number \| boolean \| Date` | Static value to set on create when `onlyOnCreate` is true and `isValueFunction` is false. |

**Example: Computed value**

```typescript
{
  total: {
    component: "Number",
    label: "Total",
    readOnly: true,
    computedValue: "$values.quantity * $values.unitPrice",
  },
}
```

**Example: Value function**

```typescript
{
  createdBy: {
    component: "ReadOnly",
    label: "Created By",
    isValueFunction: true,
    value: "getCurrentUser",
    onlyOnCreate: true,
  },
}
```

---

### Dropdown Options

**`IDropdownOption` shape:**

| Property | Type | Description |
|----------|------|-------------|
| `key` | `string \| number` | Unique option identifier (the value stored in form data). |
| `text` | `string` | Display text shown to the user. |
| `disabled` | `boolean` | If true, the option is shown but not selectable. |
| `hidden` | `boolean` | If true, the option is not shown. |
| `selected` | `boolean` | If true, the option is pre-selected. |
| `title` | `string` | Tooltip text for the option. |
| `data` | `unknown` | Arbitrary data attached to the option (e.g., icon config). |

```typescript
{
  priority: {
    component: "Dropdown",
    label: "Priority",
    dropdownOptions: [
      { key: "Low", text: "Low" },
      { key: "Medium", text: "Medium" },
      { key: "High", text: "High" },
      { key: "Critical", text: "Critical" },
    ],
  },
}
```

**`IDeprecatedOption` shape:**

Used for backward compatibility when dropdown option values change over time.

| Property | Type | Description |
|----------|------|-------------|
| `oldVal` | `string` | The old/deprecated option value. |
| `newVal` | `string` | The new replacement option value, if applicable. |
| `isDeleted` | `boolean` | Whether this option has been completely removed (vs. renamed). |

```typescript
{
  status: {
    component: "Dropdown",
    label: "Status",
    dropdownOptions: [
      { key: "Active", text: "Active" },
      { key: "OnHold", text: "On Hold" },
    ],
    deprecatedDropdownOptions: [
      { oldVal: "InProgress", newVal: "Active" },
      { oldVal: "Cancelled", isDeleted: true },
    ],
  },
}
```

If a field's current value matches `oldVal`, the deprecated option is shown as disabled with an info indicator, allowing the user to see and change the legacy value.

---

### Rendering Metadata

| Property | Type | Description |
|----------|------|-------------|
| `meta` | `Dictionary<string \| boolean \| number \| string[] \| object>` | Arbitrary metadata passed to the field component. |
| `hideOnCreate` | `boolean` | Field is not rendered in create mode. |
| `skipLayoutReadOnly` | `boolean` | Field ignores layout-level disabled/readOnly. |
| `confirmInput` | `boolean` | Triggers a confirmation modal when dependents change. |

The `meta` property is a flexible bag for component-specific configuration:

```typescript
{
  description: {
    component: "PopOutEditor",
    label: "Description",
    meta: {
      maxSize: 150,              // Passed to component for size limit
      disableAlphabeticSort: true, // Used by dropdown processing
      data: [                    // Icon config for StatusDropdown
        { icon: "CircleFill", iconTitle: "Active" },
        { icon: "CircleRing", iconTitle: "Inactive" },
      ],
    },
  },
}
```

---

### Field Arrays

The `fieldArray` property configures repeating sub-form behavior using `IFieldArrayConfig`.

| Property | Type | Description |
|----------|------|-------------|
| `itemFields` | `Record<string, {...}>` | Field configs for each item. Keys are field names within an item. |
| `minItems` | `number` | Minimum number of items allowed. |
| `maxItems` | `number` | Maximum number of items allowed. |
| `defaultItem` | `Record<string, unknown>` | Default values for new items. |
| `reorderable` | `boolean` | Whether items can be reordered by the user. |

Each entry in `itemFields` supports:

| Property | Type |
|----------|------|
| `component` | `string` |
| `required` | `boolean` |
| `label` | `string` |
| `validations` | `string[]` |
| `dropdownOptions` | `Array<{ key: string \| number; text: string }>` |

```typescript
{
  contacts: {
    component: "FieldArray",
    label: "Contacts",
    fieldArray: {
      itemFields: {
        name: { component: "Textbox", label: "Name", required: true },
        email: { component: "Textbox", label: "Email", validations: ["isValidEmail"] },
        role: {
          component: "Dropdown",
          label: "Role",
          dropdownOptions: [
            { key: "primary", text: "Primary" },
            { key: "secondary", text: "Secondary" },
          ],
        },
      },
      minItems: 1,
      maxItems: 5,
      defaultItem: { name: "", email: "", role: "primary" },
      reorderable: true,
    },
  },
}
```

---

### Deprecated Properties

| Property | Replacement | Notes |
|----------|-------------|-------|
| `isReadonly` | `readOnly` | Automatically mapped during normalization. Emits a console warning in dev mode when `__DEV__` is not `false`. |

---

## Built-in Component Types

These are the component type keys available from the `ComponentTypes` constant:

| Key | Constant | Description |
|-----|----------|-------------|
| `"Textbox"` | `ComponentTypes.Textbox` | Single-line text input |
| `"Dropdown"` | `ComponentTypes.Dropdown` | Single-select dropdown |
| `"Toggle"` | `ComponentTypes.Toggle` | Boolean toggle switch |
| `"Number"` | `ComponentTypes.Number` | Numeric input |
| `"Multiselect"` | `ComponentTypes.MultiSelect` | Multi-select dropdown |
| `"DateControl"` | `ComponentTypes.DateControl` | Date picker |
| `"Slider"` | `ComponentTypes.Slider` | Range slider |
| `"DynamicFragment"` | `ComponentTypes.Fragment` | Hidden fragment (no UI, auto-hidden) |
| `"SimpleDropdown"` | `ComponentTypes.SimpleDropdown` | Simplified dropdown |
| `"MultiSelectSearch"` | `ComponentTypes.MultiSelectSearch` | Multi-select with search |
| `"PopOutEditor"` | `ComponentTypes.PopOutEditor` | Expandable rich text editor |
| `"RichText"` | `ComponentTypes.RichText` | Rich text editor |
| `"Textarea"` | `ComponentTypes.Textarea` | Multi-line text input |
| `"DocumentLinks"` | `ComponentTypes.DocumentLinks` | URL link CRUD |
| `"StatusDropdown"` | `ComponentTypes.StatusDropdown` | Dropdown with color indicators |
| `"ReadOnly"` | `ComponentTypes.ReadOnly` | Read-only text display |
| `"ReadOnlyArray"` | `ComponentTypes.ReadOnlyArray` | Read-only array display |
| `"ReadOnlyDateTime"` | `ComponentTypes.ReadOnlyDateTime` | Read-only date/time display |
| `"ReadOnlyCumulativeNumber"` | `ComponentTypes.ReadOnlyCumulativeNumber` | Read-only cumulative number |
| `"ReadOnlyRichText"` | `ComponentTypes.ReadOnlyRichText` | Read-only rich text |
| `"ReadOnlyWithButton"` | `ComponentTypes.ReadOnlyWithButton` | Read-only with action button |
| `"ChoiceSet"` | `ComponentTypes.ChoiceSet` | Choice set / radio group |
| `"FieldArray"` | `ComponentTypes.FieldArray` | Repeating field array |

---

## Runtime Rule State (IBusinessRule)

After processing, each `IFieldConfig` becomes an `IBusinessRule` at runtime. Components read the rule state to determine behavior.

| Property | Type | Description |
|----------|------|-------------|
| `component` | `string` | UI component type to render (may be swapped by rules). |
| `required` | `boolean` | Whether the field is required. |
| `hidden` | `boolean` | Whether the field is hidden. Hidden fields skip validation. |
| `readOnly` | `boolean` | Whether the field is read-only. |
| `validations` | `string[]` | Active sync validation function names. |
| `asyncValidations` | `string[]` | Active async validation function names. |
| `valueFunction` | `string` | Value function name to execute on dependency trigger. |
| `confirmInput` | `boolean` | Whether changes trigger a confirmation modal. |
| `dropdownOptions` | `IDropdownOption[]` | Currently available dropdown options (may be filtered by rules). |
| `onlyOnCreate` | `boolean` | Whether the value function only runs on create. |
| `onlyOnCreateValue` | `string \| number \| boolean \| Date` | Static value to set on create. |
| `defaultValue` | `string \| number \| boolean \| Date` | Default value when field value is null. |
| `dependentFields` | `string[]` | Fields that this field's value changes affect (forward dependencies). |
| `dependsOnFields` | `string[]` | Fields whose values affect this field (reverse dependencies). |
| `orderDependentFields` | `string[]` | Fields referenced in this field's order dependencies. |
| `pivotalRootField` | `string` | The root field that controls field ordering for this field's group. |
| `comboDependentFields` | `string[]` | Fields that depend on this field for AND conditions. |
| `comboDependsOnFields` | `string[]` | Fields that this field's AND condition depends on. |
| `dependentDropdownFields` | `string[]` | Fields whose dropdown options are filtered by this field's value. |
| `dependsOnDropdownFields` | `string[]` | Fields that filter this field's dropdown options. |
| `computedValue` | `string` | Computed value expression from field config. |

---

## IHookFieldSharedProps

This is the props contract injected into every field component via `React.cloneElement`. All injected field components receive these props.

| Property | Type | Description |
|----------|------|-------------|
| `fieldName` | `string` | The field's name/key in the form. |
| `entityId` | `string` | The entity ID of the form record. |
| `entityType` | `string` | The entity type name. |
| `programName` | `string` | The program/context name. |
| `parentEntityId` | `string` | Parent entity ID (for nested forms). |
| `parentEntityType` | `string` | Parent entity type (for nested forms). |
| `readOnly` | `boolean` | Whether the field is read-only. |
| `required` | `boolean` | Whether the field is required. |
| `error` | `FieldError` | react-hook-form error object for this field. |
| `errorCount` | `number` | Number of validation errors. |
| `saving` | `boolean` | Whether the form is currently saving. |
| `savePending` | `boolean` | Whether a save is pending. |
| `value` | `unknown` | Current field value. |
| `meta` | `T` | Arbitrary metadata from the field config. |
| `dropdownOptions` | `IDropdownOption[]` | Available dropdown options. |
| `validations` | `string[]` | Active validation function names. |
| `label` | `string` | The field's display label. |
| `component` | `string` | The component type key. |
| `setFieldValue` | `(fieldName, fieldValue, skipSave?, timeout?) => void` | Function to programmatically set another field's value. |
