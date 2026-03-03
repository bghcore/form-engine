# Field Types Reference

This document provides a comprehensive reference for every component type supported by `dynamic-react-business-forms`. Component types are defined in `packages/core/src/constants.ts` as the `ComponentTypes` object, and each maps to a string key used in `IFieldConfig.component`.

There are **22 total component keys**: 13 editable, 6 read-only, and 3 structural/abstract types (Fragment, FieldArray, ChoiceSet).

---

## Quick Reference Table

### Editable Field Types

| Component Key | Description | Value Type | Fluent UI Component | MUI Component | ReadOnly Mode? | Uses `dropdownOptions`? |
|---|---|---|---|---|---|---|
| `"Textbox"` | Single-line text input | `string` | `Input` | `TextField` | Yes | No |
| `"Dropdown"` | Single-select dropdown | `string` | `Dropdown` + `Option` | `Select` + `MenuItem` | Yes | Yes |
| `"Toggle"` | Boolean on/off switch | `boolean` | `Switch` | `Switch` + `FormControlLabel` | Yes | No |
| `"Number"` | Numeric input | `number` | `Input` (type="number") | `TextField` (type="number") | Yes | No |
| `"Multiselect"` | Multi-select dropdown | `string[]` | `Dropdown` (multiselect) + `Option` | `Select` (multiple) + `MenuItem` + `Chip` | Yes | Yes |
| `"DateControl"` | Date picker with clear button | `string` (ISO 8601) | `Input` (type="date") + `Button` | `TextField` (type="date") + `IconButton` | Yes | No |
| `"Slider"` | Range slider input | `number` | `Slider` | `Slider` | Yes | No |
| `"DynamicFragment"` | Hidden field (no visible UI) | `string` | `<input type="hidden">` | `<input type="hidden">` | No | No |
| `"SimpleDropdown"` | Dropdown from simple string array in meta | `string` | `Dropdown` + `Option` | `Select` + `MenuItem` | Yes | No (uses `meta.dropdownOptions`) |
| `"MultiSelectSearch"` | Searchable multi-select with free-form | `string[]` | `Combobox` (multiselect, freeform) + `Option` | `Autocomplete` (multiple, freeSolo) + `TextField` + `Chip` | Yes | Yes |
| `"Textarea"` | Multi-line text with expand-to-modal | `string` | `Textarea` + `Dialog` | `TextField` (multiline) + `Dialog` | Yes | No |
| `"DocumentLinks"` | CRUD list of URL links | `IDocumentLink[]` | Custom `DocumentLinks` component | Custom `DocumentLinks` with MUI `List`, `ListItem`, `Dialog` | Yes | No |
| `"StatusDropdown"` | Dropdown with color-coded status indicators | `string` | `Dropdown` + `StatusColor` | `Select` + `StatusDot` | Yes | Yes |

### Read-Only Field Types

| Component Key | Description | Value Type | Fluent UI Component | MUI Component |
|---|---|---|---|---|
| `"ReadOnly"` | Static text display | `string` | `ReadOnlyText` | `ReadOnlyText` |
| `"ReadOnlyArray"` | List of static text values | `string[]` | `ReadOnlyText` (mapped) | `ReadOnlyText` (mapped) |
| `"ReadOnlyDateTime"` | Formatted date/time display | `string` (ISO 8601) | `<span>` with `formatDateTime()` | `<span>` with `formatDateTime()` |
| `"ReadOnlyCumulativeNumber"` | Sum of other numeric fields | `number` (computed) | `ReadOnlyText` | `ReadOnlyText` |
| `"ReadOnlyRichText"` | HTML content display | `string` (HTML) | `<div>` with `dangerouslySetInnerHTML` | `<div>` with `dangerouslySetInnerHTML` |
| `"ReadOnlyWithButton"` | Static text with action button | `string` | `ReadOnlyText` + `Button` | `ReadOnlyText` + `Button` |

### Structural / Abstract Types

| Component Key | Description | Notes |
|---|---|---|
| `"DynamicFragment"` | Hidden field | Renders as `<input type="hidden">`. No label/wrapper chrome. Used for tracking values that participate in business rules but have no visible UI. |
| `"FieldArray"` | Repeating field group | Configured via `IFieldConfig.fieldArray`. See [FieldArray](#fieldarray) section. |
| `"ChoiceSet"` | Custom choice component | No built-in implementation. Consumers must register their own component. See [ChoiceSet](#choiceset) section. |

---

## Per-Field Detailed Reference

### Textbox

**Component key:** `"Textbox"`

**Description:** Renders a single-line text input. In read-only mode, displays the value as static text with optional ellipsification.

**Value type:** `string`

**Fluent UI:** `Input` from `@fluentui/react-components`
**MUI:** `TextField` from `@mui/material`

**Supports readOnly mode:** Yes -- renders `ReadOnlyText` with optional ellipsis truncation.

**Uses dropdownOptions:** No

**Meta properties:**
| Property | Type | Description |
|---|---|---|
| `ellipsifyTextCharacters` | `number` | Max characters before text is truncated with ellipsis (read-only mode only) |
| `placeHolder` | `string` | Placeholder text for the input |
| `multiline` | `boolean` | Reserved property (not used in current implementation; use `Textarea` instead) |

**Example config:**
```json
{
  "title": {
    "component": "Textbox",
    "label": "Title",
    "required": true,
    "validations": ["Max150KbValidation"],
    "meta": {
      "ellipsifyTextCharacters": 100
    }
  }
}
```

---

### Dropdown

**Component key:** `"Dropdown"`

**Description:** Renders a single-select dropdown populated from `dropdownOptions`. Automatically shows the selected option's display text. Supports auto-selecting when only one option exists.

**Value type:** `string` (the option key)

**Fluent UI:** `Dropdown` + `Option` from `@fluentui/react-components`
**MUI:** `FormControl` + `Select` + `MenuItem` from `@mui/material`

**Supports readOnly mode:** Yes -- renders `ReadOnlyText`.

**Uses dropdownOptions:** Yes

**Meta properties:**
| Property | Type | Description |
|---|---|---|
| `placeHolder` | `string` | Placeholder text when no value is selected |
| `setDefaultKeyIfOnlyOneOption` | `boolean` | If `true` and there is exactly one option, auto-selects it |

**Example config:**
```json
{
  "status": {
    "component": "Dropdown",
    "label": "Status",
    "required": true,
    "dropdownOptions": [
      { "key": "active", "text": "Active" },
      { "key": "inactive", "text": "Inactive" },
      { "key": "archived", "text": "Archived" }
    ],
    "meta": {
      "setDefaultKeyIfOnlyOneOption": true
    }
  }
}
```

---

### Toggle

**Component key:** `"Toggle"`

**Description:** Renders a boolean on/off switch. In read-only mode, displays "Yes" or "No" text.

**Value type:** `boolean`

**Fluent UI:** `Switch` from `@fluentui/react-components`
**MUI:** `Switch` + `FormControlLabel` from `@mui/material`

**Supports readOnly mode:** Yes -- renders `ReadOnlyText` with `convertBooleanToYesOrNoText()` (displays "Yes", "No", or "-").

**Uses dropdownOptions:** No

**Meta properties:** None

**Note:** Toggle fields skip the `required` validation -- setting `required: true` on a Toggle has no effect because `false` is a valid boolean value.

**Example config:**
```json
{
  "isPublished": {
    "component": "Toggle",
    "label": "Published",
    "defaultValue": false
  }
}
```

---

### Number

**Component key:** `"Number"`

**Description:** Renders a numeric input field. Validates that input is a valid number before setting the value. Uses a 1500ms auto-save debounce.

**Value type:** `number`

**Fluent UI:** `Input` (type="number") from `@fluentui/react-components`
**MUI:** `TextField` (type="number") from `@mui/material`

**Supports readOnly mode:** Yes -- renders `ReadOnlyText` with the number converted to string.

**Uses dropdownOptions:** No

**Meta properties:** None

**Example config:**
```json
{
  "quantity": {
    "component": "Number",
    "label": "Quantity",
    "required": true,
    "validations": ["CurrencyValidation"]
  }
}
```

---

### Multiselect

**Component key:** `"Multiselect"`

**Description:** Renders a multi-select dropdown. Users can select multiple options from the list. Selected values are displayed as a comma-separated string.

**Value type:** `string[]` (array of option keys)

**Fluent UI:** `Dropdown` (multiselect) + `Option` from `@fluentui/react-components`
**MUI:** `FormControl` + `Select` (multiple) + `MenuItem` + `Chip` from `@mui/material`

**Supports readOnly mode:** Yes -- Fluent renders a read-only multiselect dropdown; MUI renders `Chip` components.

**Uses dropdownOptions:** Yes

**Meta properties:** None

**Example config:**
```json
{
  "tags": {
    "component": "Multiselect",
    "label": "Tags",
    "dropdownOptions": [
      { "key": "frontend", "text": "Frontend" },
      { "key": "backend", "text": "Backend" },
      { "key": "devops", "text": "DevOps" }
    ]
  }
}
```

---

### DateControl

**Component key:** `"DateControl"`

**Description:** Renders a date picker input with a clear button. Stores dates as ISO 8601 strings. In read-only mode, displays the date formatted via `formatDateTime()`.

**Value type:** `string` (ISO 8601 date string, e.g. `"2025-06-15T00:00:00.000Z"`)

**Fluent UI:** `Input` (type="date") + `Button` (clear) from `@fluentui/react-components`; clear icon uses `DismissRegular` from `@fluentui/react-icons`
**MUI:** `TextField` (type="date") + `IconButton` (clear) from `@mui/material`

**Supports readOnly mode:** Yes -- displays formatted date or "-" if null.

**Uses dropdownOptions:** No

**Meta properties:** None

**Example config:**
```json
{
  "startDate": {
    "component": "DateControl",
    "label": "Start Date",
    "required": true
  }
}
```

---

### Slider

**Component key:** `"Slider"`

**Description:** Renders a range slider for numeric input. Configurable min, max, and step values via `meta`.

**Value type:** `number`

**Fluent UI:** `Slider` from `@fluentui/react-components`
**MUI:** `Slider` from `@mui/material` (with `valueLabelDisplay="auto"`)

**Supports readOnly mode:** Yes -- renders `ReadOnlyText` with the number as string.

**Uses dropdownOptions:** No

**Meta properties:**
| Property | Type | Description |
|---|---|---|
| `min` | `number` | Minimum slider value |
| `max` | `number` | Maximum slider value |
| `step` | `number` | Step increment between values |

**Example config:**
```json
{
  "confidence": {
    "component": "Slider",
    "label": "Confidence Level",
    "meta": {
      "min": 0,
      "max": 100,
      "step": 5
    }
  }
}
```

---

### DynamicFragment

**Component key:** `"DynamicFragment"`

**Description:** A hidden field that renders as `<input type="hidden">`. Used for tracking values that participate in business rules (as dependency triggers or targets) but should not be displayed to the user. Unlike other fields, Fragment fields are rendered without the `HookFieldWrapper` chrome (no label, no error display).

**Value type:** `string`

**Fluent UI:** Plain `<input type="hidden">`
**MUI:** Plain `<input type="hidden">`

**Supports readOnly mode:** No -- always renders as a hidden input.

**Uses dropdownOptions:** No

**Meta properties:** None

**Example config:**
```json
{
  "internalType": {
    "component": "DynamicFragment",
    "hidden": false,
    "dependencies": {
      "TypeA": {
        "specialField": { "hidden": false, "required": true }
      },
      "TypeB": {
        "specialField": { "hidden": true }
      }
    }
  }
}
```

---

### SimpleDropdown

**Component key:** `"SimpleDropdown"`

**Description:** A simplified dropdown variant where options are provided as a flat string array in `meta.dropdownOptions` instead of the standard `IDropdownOption[]` structure. The option key and display text are the same value.

**Value type:** `string`

**Fluent UI:** `Dropdown` + `Option` from `@fluentui/react-components`
**MUI:** `FormControl` + `Select` + `MenuItem` from `@mui/material`

**Supports readOnly mode:** Yes -- renders `ReadOnlyText`.

**Uses dropdownOptions (standard):** No -- uses `meta.dropdownOptions` (a `string[]`) instead.

**Meta properties:**
| Property | Type | Description |
|---|---|---|
| `dropdownOptions` | `string[]` | Array of string values to use as both keys and display text |
| `placeHolder` | `string` | Placeholder text |

**Example config:**
```json
{
  "priority": {
    "component": "SimpleDropdown",
    "label": "Priority",
    "meta": {
      "dropdownOptions": ["Low", "Medium", "High", "Critical"]
    }
  }
}
```

---

### MultiSelectSearch

**Component key:** `"MultiSelectSearch"`

**Description:** A searchable multi-select with free-form text entry. Users can type to filter options and select multiple values. Supports adding values that are not in the predefined options list.

**Value type:** `string[]`

**Fluent UI:** `Combobox` (multiselect, freeform) + `Option` from `@fluentui/react-components`
**MUI:** `Autocomplete` (multiple, freeSolo) + `TextField` + `Chip` from `@mui/material`

**Supports readOnly mode:** Yes -- Fluent renders a read-only multiselect dropdown; MUI renders `Chip` components.

**Uses dropdownOptions:** Yes

**Meta properties:** None

**Example config:**
```json
{
  "skills": {
    "component": "MultiSelectSearch",
    "label": "Skills",
    "dropdownOptions": [
      { "key": "react", "text": "React" },
      { "key": "typescript", "text": "TypeScript" },
      { "key": "node", "text": "Node.js" }
    ]
  }
}
```

---

### Textarea (PopOutEditor)

**Component key:** `"Textarea"`

**Description:** A multi-line text area with an expand-to-modal feature. Inline editing uses a compact textarea, while clicking the expand button opens a full-width dialog for longer content editing. The dialog includes unsaved changes detection and confirmation.

**Value type:** `string`

**Fluent UI:** `Textarea` + `Dialog` + `DialogSurface` + `DialogBody` + `DialogTitle` + `DialogContent` + `DialogActions` + `Button` from `@fluentui/react-components`; icons from `@fluentui/react-icons`
**MUI:** `TextField` (multiline) + `Dialog` + `DialogTitle` + `DialogContent` + `DialogActions` + `Button` + `IconButton` from `@mui/material`

**Supports readOnly mode:** Yes -- renders `ReadOnlyText` with optional ellipsis truncation.

**Uses dropdownOptions:** No

**Meta properties:**
| Property | Type | Description |
|---|---|---|
| `numberOfRows` | `number` | Number of visible rows in the inline textarea (default: 4) |
| `ellipsifyTextCharacters` | `number` | Max characters before truncation in read-only mode |
| `additionalInfo` | `string` | Additional information text |
| `maxLimit` | `number` | Maximum character/content limit |
| `autoAdjustHeight` | `boolean` | Reserved property for auto-height adjustment |
| `saveCallback` | `() => void` | Custom save callback invoked on dialog save |
| `renderExtraModalFooter` | `() => React.ReactNode` | Custom footer content rendered in the modal dialog |

**Example config:**
```json
{
  "description": {
    "component": "Textarea",
    "label": "Description",
    "validations": ["Max150KbValidation"],
    "meta": {
      "numberOfRows": 6,
      "ellipsifyTextCharacters": 200
    }
  }
}
```

---

### DocumentLinks

**Component key:** `"DocumentLinks"`

**Description:** A CRUD component for managing a list of URL links. Each link has a title and URL. Supports add, edit, and delete operations with inline editing forms. URLs are validated against the URL regex pattern.

**Value type:** `IDocumentLink[]` where `IDocumentLink = { title: string; url: string }`

**Fluent UI:** Custom `DocumentLinks` component built with Fluent UI primitives
**MUI:** Custom `DocumentLinks` component built with `List`, `ListItem`, `ListItemText`, `TextField`, `Button`, `IconButton`, `Dialog`, `Tooltip` from `@mui/material`

**Supports readOnly mode:** Yes -- renders links as clickable anchor tags without edit/delete controls.

**Uses dropdownOptions:** No

**Meta properties:** None

**Example config:**
```json
{
  "references": {
    "component": "DocumentLinks",
    "label": "Reference Links"
  }
}
```

---

### StatusDropdown

**Component key:** `"StatusDropdown"`

**Description:** A dropdown with color-coded status indicators. Each option displays a colored dot/circle next to the status text. Colors are configured via `meta.statusColors`, which maps option keys to CSS color strings.

**Value type:** `string` (the option key)

**Fluent UI:** `Dropdown` + `Option` + custom `StatusColor` component from `@fluentui/react-components`
**MUI:** `FormControl` + `Select` + `MenuItem` + custom `StatusDot` inline component from `@mui/material`

**Supports readOnly mode:** Yes -- renders the status color indicator plus `ReadOnlyText`.

**Uses dropdownOptions:** Yes

**Meta properties:**
| Property | Type | Description |
|---|---|---|
| `placeHolder` | `string` | Placeholder text |
| `statusColors` | `Dictionary<string>` | Maps option keys to CSS color strings (e.g., `{ "active": "#0078D4", "inactive": "#A19F9D" }`) |

**Example config:**
```json
{
  "workflowStatus": {
    "component": "StatusDropdown",
    "label": "Workflow Status",
    "dropdownOptions": [
      { "key": "draft", "text": "Draft" },
      { "key": "review", "text": "In Review" },
      { "key": "approved", "text": "Approved" },
      { "key": "rejected", "text": "Rejected" }
    ],
    "meta": {
      "statusColors": {
        "draft": "#8A8886",
        "review": "#0078D4",
        "approved": "#107C10",
        "rejected": "#A4262C"
      }
    }
  }
}
```

---

### ReadOnly

**Component key:** `"ReadOnly"`

**Description:** Displays a static text value. Always read-only. Used for fields that should never be editable.

**Value type:** `string`

**Fluent UI / MUI:** `ReadOnlyText` component (shared helper)

**Meta properties:** Inherits `IReadOnlyFieldProps` -- any additional props from the `ReadOnlyText` component.

**Example config:**
```json
{
  "createdBy": {
    "component": "ReadOnly",
    "label": "Created By"
  }
}
```

---

### ReadOnlyArray

**Component key:** `"ReadOnlyArray"`

**Description:** Displays a list of string values as separate read-only text lines. Each array element is rendered as its own `ReadOnlyText` component.

**Value type:** `string[]`

**Fluent UI / MUI:** `ReadOnlyText` mapped over the array

**Meta properties:** Inherits `IReadOnlyFieldProps`.

**Example config:**
```json
{
  "assignees": {
    "component": "ReadOnlyArray",
    "label": "Assigned To"
  }
}
```

---

### ReadOnlyDateTime

**Component key:** `"ReadOnlyDateTime"`

**Description:** Displays a formatted date/time value. Formats the ISO date string using `formatDateTime()`. Can optionally hide the timestamp portion.

**Value type:** `string` (ISO 8601 date string)

**Fluent UI / MUI:** `<span>` with `formatDateTime()` utility; displays "-" when value is null.

**Meta properties:**
| Property | Type | Description |
|---|---|---|
| `isListView` | `boolean` | Reserved for list view formatting |
| `hidetimeStamp` | `boolean` | If `true`, only the date portion is displayed (no time) |

**Example config:**
```json
{
  "lastModified": {
    "component": "ReadOnlyDateTime",
    "label": "Last Modified",
    "meta": {
      "hidetimeStamp": false
    }
  }
}
```

---

### ReadOnlyCumulativeNumber

**Component key:** `"ReadOnlyCumulativeNumber"`

**Description:** Displays the sum of multiple other numeric fields on the form. Automatically recalculates whenever any of the dependency fields change. Useful for displaying running totals.

**Value type:** `number` (computed from other fields)

**Fluent UI / MUI:** `ReadOnlyText` with the computed sum as string

**Meta properties:**
| Property | Type | Description |
|---|---|---|
| `dependencyFields` | `string[]` | Array of field names whose numeric values should be summed |

**Example config:**
```json
{
  "totalHours": {
    "component": "ReadOnlyCumulativeNumber",
    "label": "Total Hours",
    "meta": {
      "dependencyFields": ["mondayHours", "tuesdayHours", "wednesdayHours", "thursdayHours", "fridayHours"]
    }
  }
}
```

---

### ReadOnlyRichText

**Component key:** `"ReadOnlyRichText"`

**Description:** Renders HTML content using `dangerouslySetInnerHTML`. Used for displaying formatted rich text content that was authored elsewhere (e.g., via a rich text editor in another system).

**Value type:** `string` (raw HTML)

**Fluent UI / MUI:** `<div>` with `dangerouslySetInnerHTML`

**Meta properties:** None

**Security note:** This component renders raw HTML. Ensure the source content is trusted or sanitized before use.

**Example config:**
```json
{
  "richDescription": {
    "component": "ReadOnlyRichText",
    "label": "Description"
  }
}
```

---

### ReadOnlyWithButton

**Component key:** `"ReadOnlyWithButton"`

**Description:** Displays a read-only text value alongside an action button. Useful for "View Details", "Open Link", or similar patterns where a read-only value has an associated action.

**Value type:** `string`

**Fluent UI:** `ReadOnlyText` + `Button` from `@fluentui/react-components`
**MUI:** `ReadOnlyText` + `Button` (variant="outlined", size="small") from `@mui/material`

**Meta properties:**
| Property | Type | Description |
|---|---|---|
| `containerClassName` | `string` | CSS class name for the outer container |
| `buttonText` | `string` | Text displayed on the action button |
| `onButtonClick` | `() => void` | Click handler for the action button |

**Example config:**
```json
{
  "externalId": {
    "component": "ReadOnlyWithButton",
    "label": "External ID",
    "meta": {
      "buttonText": "View in Portal",
      "onButtonClick": "handleViewInPortal"
    }
  }
}
```

---

### FieldArray

**Component key:** `"FieldArray"`

**Description:** A repeating field group that allows users to add, remove, and optionally reorder rows of structured data. Each row contains its own set of sub-fields defined by the `fieldArray.itemFields` configuration. This is a structural type -- the actual sub-field rendering depends on the component types specified in `itemFields`.

**Value type:** `Array<Record<string, unknown>>` (array of objects, each matching the `itemFields` schema)

**Configuration:** Uses `IFieldConfig.fieldArray` instead of `meta`:

```typescript
interface IFieldArrayConfig {
  itemFields: Record<string, {
    component?: string;
    required?: boolean;
    label?: string;
    validations?: string[];
    dropdownOptions?: Array<{ key: string | number; text: string }>;
  }>;
  minItems?: number;
  maxItems?: number;
  defaultItem?: Record<string, unknown>;
  reorderable?: boolean;
}
```

| Property | Type | Description |
|---|---|---|
| `itemFields` | `Record<string, {...}>` | Sub-field definitions for each array item |
| `minItems` | `number` | Minimum number of items allowed |
| `maxItems` | `number` | Maximum number of items allowed |
| `defaultItem` | `Record<string, unknown>` | Default values for newly added items |
| `reorderable` | `boolean` | Whether items can be drag-reordered |

**Example config:**
```json
{
  "contacts": {
    "component": "FieldArray",
    "label": "Contacts",
    "fieldArray": {
      "itemFields": {
        "name": { "component": "Textbox", "label": "Name", "required": true },
        "email": { "component": "Textbox", "label": "Email", "validations": ["EmailValidation"] },
        "role": {
          "component": "Dropdown",
          "label": "Role",
          "dropdownOptions": [
            { "key": "primary", "text": "Primary" },
            { "key": "secondary", "text": "Secondary" }
          ]
        }
      },
      "minItems": 1,
      "maxItems": 10,
      "defaultItem": { "name": "", "email": "", "role": "primary" },
      "reorderable": true
    }
  }
}
```

---

### ChoiceSet

**Component key:** `"ChoiceSet"`

**Description:** An abstract component type with **no built-in implementation** in either the Fluent or MUI packages. Consumers must register their own component for this key via the `InjectedHookFieldProvider`. This is intended for custom choice/selection UI patterns that do not fit the standard Dropdown or MultiSelect models (e.g., radio button groups, card selectors, image pickers).

**Value type:** Determined by the consumer's implementation.

**How to register:**
```tsx
import { createFluentFieldRegistry } from "@bghcore/dynamic-forms-fluent";
import MyCustomChoiceSet from "./MyCustomChoiceSet";

const registry = createFluentFieldRegistry();

// Add the custom ChoiceSet implementation
registry["ChoiceSet"] = <MyCustomChoiceSet />;

// Use in the provider
<InjectedHookFieldProvider injectedFields={registry}>
  ...
</InjectedHookFieldProvider>
```

**Example config:**
```json
{
  "severity": {
    "component": "ChoiceSet",
    "label": "Severity Level",
    "dropdownOptions": [
      { "key": "low", "text": "Low" },
      { "key": "medium", "text": "Medium" },
      { "key": "high", "text": "High" }
    ]
  }
}
```

---

## IDropdownOption Interface

All dropdown-based components (`Dropdown`, `Multiselect`, `MultiSelectSearch`, `StatusDropdown`) use the `IDropdownOption` interface for their options:

```typescript
interface IDropdownOption {
  key: string | number;   // Unique identifier, used as the stored value
  text: string;           // Display text shown to the user
  disabled?: boolean;     // If true, option is visible but not selectable
  hidden?: boolean;       // If true, option is not rendered
  selected?: boolean;     // Pre-selected state
  title?: string;         // Tooltip text on hover
  data?: unknown;         // Arbitrary data attached to the option
}
```

**Defined in:** `packages/core/src/types/IDropdownOption.ts`

---

## IHookFieldSharedProps Interface

All field components receive their props via `IHookFieldSharedProps<T>`, which is passed through `React.cloneElement()` by `HookRenderField`:

```typescript
interface IHookFieldSharedProps<T> {
  fieldName?: string;              // The field's key name
  entityId?: string;               // ID of the entity being edited
  entityType?: string;             // Type of the entity
  programName?: string;            // Program context identifier
  parentEntityId?: string;         // Parent entity ID (for child entities)
  parentEntityType?: string;       // Parent entity type
  readOnly?: boolean;              // Whether the field should be non-editable
  required?: boolean;              // Whether the field is required
  error?: FieldError;              // react-hook-form validation error
  errorCount?: number;             // Total number of errors on the form
  saving?: boolean;                // Whether the field's value is currently being saved
  savePending?: boolean;           // Whether a save is pending (dirty + has errors)
  value?: unknown;                 // Current field value from react-hook-form
  meta?: T;                        // Type-safe metadata (varies per component type)
  dropdownOptions?: IDropdownOption[];  // Options for dropdown-based fields
  validations?: string[];          // Validation function names
  label?: string;                  // Field label text
  component?: string;              // Component type key
  setFieldValue?: (fieldName: string, fieldValue: unknown, skipSave?: boolean, timeout?: number) => void;
}
```

**Defined in:** `packages/core/src/types/IHookFieldSharedProps.ts`

---

## Component Registry Mapping

Both the Fluent and MUI packages provide a factory function that creates the default field registry. The registries map `ComponentTypes` keys to pre-created React elements:

**Fluent:** `createFluentFieldRegistry()` in `packages/fluent/src/registry.ts`
**MUI:** `createMuiFieldRegistry()` in `packages/mui/src/registry.ts`

Both registries map the same 18 component keys (all except `ChoiceSet` and `FieldArray`). The `RichText` component type has no separate registration -- `Textarea` is registered for the `"Textarea"` key, and `"RichText"` must be registered manually if needed.

Note that the `ComponentTypes.Textarea` key (`"Textarea"`) maps to the `HookPopOutEditor` component in both packages.
