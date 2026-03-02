# @bghcore/dynamic-forms-fluent

Fluent UI v9 field components for [`@bghcore/dynamic-forms-core`](https://www.npmjs.com/package/@bghcore/dynamic-forms-core). Provides 13 editable and 6 read-only field types that plug into the core form engine.

## Install

```bash
npm install @bghcore/dynamic-forms-core @bghcore/dynamic-forms-fluent
```

Peer dependencies: `react`, `react-dom`, `react-hook-form`, `@fluentui/react-components`, `@bghcore/dynamic-forms-core`

## Quick Start

```tsx
import {
  BusinessRulesProvider,
  InjectedHookFieldProvider,
  UseInjectedHookFieldContext,
  HookInlineForm,
} from "@bghcore/dynamic-forms-core";
import { createFluentFieldRegistry } from "@bghcore/dynamic-forms-fluent";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { useEffect } from "react";

function FieldRegistrar({ children }: { children: React.ReactNode }) {
  const { setInjectedFields } = UseInjectedHookFieldContext();
  useEffect(() => {
    setInjectedFields(createFluentFieldRegistry());
  }, []);
  return <>{children}</>;
}

function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      <BusinessRulesProvider>
        <InjectedHookFieldProvider>
          <FieldRegistrar>
            <HookInlineForm
              configName="myForm"
              programName="myApp"
              fieldConfigs={{
                name: { component: "Textbox", label: "Name", required: true },
                status: {
                  component: "Dropdown",
                  label: "Status",
                  dropdownOptions: [
                    { key: "Active", text: "Active" },
                    { key: "Inactive", text: "Inactive" },
                  ],
                },
              }}
              defaultValues={{ name: "", status: "Active" }}
              saveData={async (data) => data}
            />
          </FieldRegistrar>
        </InjectedHookFieldProvider>
      </BusinessRulesProvider>
    </FluentProvider>
  );
}
```

## Available Fields

### Editable Fields

| Component Key | Component | Description |
|---------------|-----------|-------------|
| `Textbox` | `HookTextbox` | Single-line text input |
| `Number` | `HookNumber` | Numeric input with validation |
| `Toggle` | `HookToggle` | Boolean toggle switch |
| `Dropdown` | `HookDropdown` | Single-select dropdown |
| `Multiselect` | `HookMultiSelect` | Multi-select dropdown |
| `DateControl` | `HookDateControl` | Date picker with clear button |
| `Slider` | `HookSlider` | Numeric slider |
| `SimpleDropdown` | `HookSimpleDropdown` | Dropdown from string array in meta |
| `MultiSelectSearch` | `HookMultiSelectSearch` | Searchable multi-select (ComboBox) |
| `Textarea` | `HookPopOutEditor` | Multiline text with expand-to-modal |
| `DocumentLinks` | `HookDocumentLinks` | URL link CRUD |
| `StatusDropdown` | `HookStatusDropdown` | Dropdown with color status indicator |
| `DynamicFragment` | `HookFragment` | Hidden field (form state only) |

### Read-Only Fields

| Component Key | Component | Description |
|---------------|-----------|-------------|
| `ReadOnly` | `HookReadOnly` | Plain text display |
| `ReadOnlyArray` | `HookReadOnlyArray` | Array of strings |
| `ReadOnlyDateTime` | `HookReadOnlyDateTime` | Formatted date/time |
| `ReadOnlyCumulativeNumber` | `HookReadOnlyCumulativeNumber` | Computed sum of other fields |
| `ReadOnlyRichText` | `HookReadOnlyRichText` | Rendered HTML |
| `ReadOnlyWithButton` | `HookReadOnlyWithButton` | Text with action button |

## Registry Setup

`createFluentFieldRegistry()` returns a `Dictionary<JSX.Element>` mapping all component keys to their Fluent UI implementations. You can extend or override individual fields:

```tsx
import { createFluentFieldRegistry } from "@bghcore/dynamic-forms-fluent";

const fields = {
  ...createFluentFieldRegistry(),
  Textbox: <MyCustomTextbox />, // override built-in
  RichEditor: <MyRichEditor />, // add new type
};

setInjectedFields(fields);
```

## Supporting Components

The package also exports supporting components:

- **`ReadOnlyText`** -- Read-only text display
- **`StatusMessage`** -- Error/warning/saving status messages
- **`HookFormLoading`** -- Shimmer loading placeholder

## License

MIT
