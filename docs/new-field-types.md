# New Field Types: RadioGroup, CheckboxGroup, Rating, ColorPicker, Autocomplete

This document covers the five new field types added in v1.1.0. All types follow the standard `IFieldProps<T>` pattern and are available in all three adapters: `@form-eng/fluent`, `@form-eng/mui`, and `@form-eng/headless`.

## RadioGroup

Single-selection from a list of options rendered as radio buttons.

- **ComponentType key:** `"RadioGroup"` (`ComponentTypes.RadioGroup`)
- **Value type:** `string`
- **Options:** `IOption[]` via `options` prop

### Usage

```typescript
const config: IFormConfig = {
  version: 2,
  fields: {
    size: {
      type: "RadioGroup",
      label: "Size",
      required: true,
      options: [
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
      ],
    },
  },
};
```

### Adapter notes

| Adapter  | Component used |
|----------|---------------|
| Fluent   | `Radio` + `RadioGroup` from `@fluentui/react-components` |
| MUI      | `Radio` + `RadioGroup` + `FormControl` + `FormControlLabel` from `@mui/material` |
| Headless | Native `<input type="radio">` elements, `data-field-type="RadioGroup"` |

---

## CheckboxGroup

Multi-selection from a list of options rendered as checkboxes.

- **ComponentType key:** `"CheckboxGroup"` (`ComponentTypes.CheckboxGroup`)
- **Value type:** `string[]`
- **Options:** `IOption[]` via `options` prop

### Usage

```typescript
const config: IFormConfig = {
  version: 2,
  fields: {
    frameworks: {
      type: "CheckboxGroup",
      label: "Frameworks",
      options: [
        { value: "react", label: "React" },
        { value: "vue", label: "Vue" },
        { value: "angular", label: "Angular" },
      ],
    },
  },
};
```

### Rules integration

Because the value is `string[]`, use `contains` / `notContains` operators in rules:

```typescript
rules: [
  {
    when: { field: "frameworks", operator: "contains", value: "angular" },
    then: { hidden: true },
  },
],
```

### Adapter notes

| Adapter  | Component used |
|----------|---------------|
| Fluent   | `Checkbox` from `@fluentui/react-components` |
| MUI      | `Checkbox` + `FormControlLabel` + `FormGroup` from `@mui/material` |
| Headless | Native `<input type="checkbox">` elements, `data-field-type="CheckboxGroup"` |

---

## Rating

Numeric star rating input.

- **ComponentType key:** `"Rating"` (`ComponentTypes.Rating`)
- **Value type:** `number`
- **Config options:**
  - `config.max?: number` — Maximum number of stars (default: `5`)
  - `config.allowHalf?: boolean` — Allow half-star ratings (default: `false`; MUI only for now)

### Usage

```typescript
const config: IFormConfig = {
  version: 2,
  fields: {
    productRating: {
      type: "Rating",
      label: "Product Rating",
      required: true,
      config: {
        max: 5,
        allowHalf: false,
      },
    },
  },
};
```

### Adapter notes

| Adapter  | Component used |
|----------|---------------|
| Fluent   | Custom star button implementation (Fluent Rating component is v9.x preview only) |
| MUI      | `Rating` from `@mui/material` — supports `allowHalf` via `precision: 0.5` |
| Headless | Radio-based star implementation with `aria-label`, `data-field-type="Rating"` |

---

## ColorPicker

Hex color selection using the browser's native color picker.

- **ComponentType key:** `"ColorPicker"` (`ComponentTypes.ColorPicker`)
- **Value type:** `string` (hex format, e.g. `"#ff0000"`)

The selected hex value is displayed as text next to the color swatch for all adapters.

### Usage

```typescript
const config: IFormConfig = {
  version: 2,
  fields: {
    brandColor: {
      type: "ColorPicker",
      label: "Brand Color",
      defaultValue: "#3b82f6",
    },
  },
};
```

### Adapter notes

| Adapter  | Component used |
|----------|---------------|
| Fluent   | Native `<input type="color">` with hex value display |
| MUI      | Native `<input type="color">` with hex value display |
| Headless | Native `<input type="color">` with hex value display, `data-field-type="ColorPicker"` |

All adapters use the same native `<input type="color">` — browser rendering varies by OS and browser.

---

## Autocomplete

Searchable single-selection input with type-ahead filtering.

- **ComponentType key:** `"Autocomplete"` (`ComponentTypes.Autocomplete`)
- **Value type:** `string` (option value key)
- **Options:** `IOption[]` via `options` prop

### Usage

```typescript
const config: IFormConfig = {
  version: 2,
  fields: {
    country: {
      type: "Autocomplete",
      label: "Country",
      required: true,
      options: [
        { value: "us", label: "United States" },
        { value: "ca", label: "Canada" },
        { value: "gb", label: "United Kingdom" },
      ],
    },
  },
};
```

### Adapter notes

| Adapter  | Component used |
|----------|---------------|
| Fluent   | `Combobox` from `@fluentui/react-components` with `freeform` enabled |
| MUI      | `Autocomplete` from `@mui/material` |
| Headless | `<input>` with `<datalist>` for native browser suggestions, `data-field-type="Autocomplete"` |

The headless adapter uses `<datalist>` which provides basic browser-native autocomplete. For richer filtering behavior, use the Fluent or MUI adapters.

---

## Read-only rendering

All five field types render a plain `ReadOnlyText` component when `readOnly: true` is set, displaying:

| Field type     | Read-only display |
|----------------|-------------------|
| RadioGroup     | The matching option label |
| CheckboxGroup  | Comma-separated selected labels |
| Rating         | The numeric value as a string |
| ColorPicker    | The hex color string |
| Autocomplete   | The matching option label |

---

## Rules engine integration

All new types work with the existing rules engine. Example: show a `CheckboxGroup` only when a `Toggle` is on:

```typescript
fields: {
  enableExtras: { type: "Toggle", label: "Enable extras" },
  extras: {
    type: "CheckboxGroup",
    label: "Choose extras",
    options: [
      { value: "a", label: "Extra A" },
      { value: "b", label: "Extra B" },
    ],
    rules: [
      {
        when: { field: "enableExtras", operator: "equals", value: false },
        then: { hidden: true },
      },
    ],
  },
},
```

---

# New Field Types: FileUpload, DateRange, DateTime, PhoneInput

This document covers the four new field types added in v1.2.0 (Phase 2). All types follow the standard `IFieldProps<T>` pattern and are available in all three adapters: `@form-eng/fluent`, `@form-eng/mui`, and `@form-eng/headless`.

## FileUpload

Native file picker supporting single or multiple file selection with built-in size validation.

- **ComponentType key:** `"FileUpload"` (`ComponentTypes.FileUpload`)
- **Value type:** `File | File[] | null`
- **Config options:**
  - `config.multiple?: boolean` — Allow selecting multiple files (default: `false`)
  - `config.accept?: string` — MIME type filter (e.g. `"image/*"`, `".pdf"`, `"image/*,.pdf"`)
  - `config.maxSizeMb?: number` — Maximum file size in megabytes (default: `10`)

### Usage

```typescript
const config: IFormConfig = {
  version: 2,
  fields: {
    resume: {
      type: "FileUpload",
      label: "Resume",
      required: true,
      config: {
        accept: ".pdf,.doc,.docx",
        maxSizeMb: 5,
      },
    },
    photos: {
      type: "FileUpload",
      label: "Photos",
      config: {
        multiple: true,
        accept: "image/*",
        maxSizeMb: 10,
      },
    },
  },
};
```

### Validation

File size is validated inline when a file is selected. If a file exceeds `maxSizeMb`, an error message is shown and the value is cleared. The built-in size check runs before `setFieldValue` is called, so react-hook-form never receives an oversized file.

### Adapter notes

| Adapter  | Component used |
|----------|---------------|
| Fluent   | Native `<input type="file">` triggered via Fluent `Button` |
| MUI      | Native `<input type="file">` triggered via MUI `Button` |
| Headless | Native `<input type="file">` triggered via `<button>`, `data-field-type="FileUpload"` |

---

## DateRange

Two side-by-side date inputs (From / To) with built-in start ≤ end validation.

- **ComponentType key:** `"DateRange"` (`ComponentTypes.DateRange`)
- **Value type:** `{ start: string; end: string } | null` (ISO date strings, e.g. `"2024-06-15"`)
- **Config options:**
  - `config.minDate?: string` — Minimum selectable date (ISO date string)
  - `config.maxDate?: string` — Maximum selectable date (ISO date string)

### Usage

```typescript
const config: IFormConfig = {
  version: 2,
  fields: {
    leaveWindow: {
      type: "DateRange",
      label: "Leave Period",
      required: true,
      config: {
        minDate: "2024-01-01",
        maxDate: "2024-12-31",
      },
    },
  },
};
```

### Validation

An inline error is shown when start > end. The `min`/`max` HTML attributes on each input are dynamically constrained so that:
- The "From" input's `max` is the current end date (or `config.maxDate`)
- The "To" input's `min` is the current start date (or `config.minDate`)

### Read-only rendering

Displays as `"YYYY-MM-DD – YYYY-MM-DD"` (or just the non-empty date if only one is set).

### Adapter notes

| Adapter  | Component used |
|----------|---------------|
| Fluent   | Two native `<input type="date">` with Fluent `Label` |
| MUI      | Two native `<input type="date">` with MUI `FormLabel` |
| Headless | Two native `<input type="date">` with `<label>`, `data-field-type="DateRange"` |

---

## DateTime

Single combined date+time input.

- **ComponentType key:** `"DateTime"` (`ComponentTypes.DateTime`)
- **Value type:** `string | null` (datetime-local format, e.g. `"2024-06-15T14:30"`)
- **Config options:**
  - `config.minDateTime?: string` — Minimum datetime (datetime-local string)
  - `config.maxDateTime?: string` — Maximum datetime (datetime-local string)

### Usage

```typescript
const config: IFormConfig = {
  version: 2,
  fields: {
    appointmentTime: {
      type: "DateTime",
      label: "Appointment",
      required: true,
      config: {
        minDateTime: "2024-01-01T09:00",
        maxDateTime: "2024-12-31T17:00",
      },
    },
  },
};
```

### Read-only rendering

The stored datetime string is passed through `formatDateTime()` for display (locale-aware date+time format). Falls back to the raw string if formatting fails.

### Adapter notes

| Adapter  | Component used |
|----------|---------------|
| Fluent   | Native `<input type="datetime-local">` |
| MUI      | Native `<input type="datetime-local">` |
| Headless | Native `<input type="datetime-local">`, `data-field-type="DateTime"` |

All adapters use native `<input type="datetime-local">` for simplicity and broad browser support.

---

## PhoneInput

Telephone input with lightweight inline number formatting. No external mask library required.

- **ComponentType key:** `"PhoneInput"` (`ComponentTypes.PhoneInput`)
- **Value type:** `string`
- **Config options:**
  - `config.format?: "us" | "international" | "raw"` — Number format (default: `"us"`)

### Formats

| Format          | Example output      | Description |
|-----------------|---------------------|-------------|
| `"us"` (default)| `(555) 123-4567`    | US: `(XXX) XXX-XXXX`, max 10 digits |
| `"international"` | `+1 555 123 4567` | Intl: `+X XXX XXX XXXX`, max 12 digits |
| `"raw"`         | `5551234567`        | Digits only, no formatting |

### Usage

```typescript
const config: IFormConfig = {
  version: 2,
  fields: {
    mobile: {
      type: "PhoneInput",
      label: "Mobile Number",
      required: true,
      config: { format: "us" },
    },
    international: {
      type: "PhoneInput",
      label: "International Phone",
      config: { format: "international" },
    },
  },
};
```

### How formatting works

As the user types, non-digit characters are stripped and the remaining digits are re-formatted on every keystroke. The formatted string is stored as the field value (no separate "raw digits" state).

### Adapter notes

| Adapter  | Component used |
|----------|---------------|
| Fluent   | Fluent `Input` with `type="tel"` and `onChange` masking |
| MUI      | MUI `TextField` with `type="tel"` and `onChange` masking |
| Headless | Native `<input type="tel">`, `data-field-type="PhoneInput"` |

---

## Read-only rendering (Phase 2)

| Field type  | Read-only display |
|-------------|-------------------|
| FileUpload  | File name(s), comma-separated |
| DateRange   | `"YYYY-MM-DD – YYYY-MM-DD"` |
| DateTime    | Formatted via `formatDateTime()` |
| PhoneInput  | The stored formatted string |
