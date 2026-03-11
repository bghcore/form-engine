# shadcn/ui Integration Guide

## Why There Is No @formosaic/shadcn Package

shadcn/ui is a **distribution model**, not an npm library. You copy components into your project and own them locally. There is no `shadcn-ui` package to `peerDepend` on, no version to pin, and no import to externalize.

This means a traditional adapter package would have nothing to depend on. Instead, shadcn projects should use one of the approaches below.

## Integration Approaches

### Approach A: Use @formosaic/radix directly (Recommended)

shadcn/ui components are built on Radix UI primitives. The `@formosaic/radix` adapter uses the same Radix primitives, making it the natural base for shadcn projects.

```bash
npm install @formosaic/core @formosaic/radix
```

```tsx
import { FormEngine, RulesEngineProvider, InjectedFieldProvider } from "@formosaic/core";
import { createRadixFieldRegistry } from "@formosaic/radix";

const fields = createRadixFieldRegistry();

function App() {
  return (
    <RulesEngineProvider>
      <InjectedFieldProvider fields={fields}>
        <FormEngine config={formConfig} entityData={data} />
      </InjectedFieldProvider>
    </RulesEngineProvider>
  );
}
```

Style the unstyled Radix primitives using Tailwind and the `data-field-type` / `data-field-state` attributes:

```css
/* Target specific field types */
[data-field-type="Toggle"] { @apply flex items-center gap-2; }
[data-field-type="Dropdown"] { @apply relative; }

/* Target field states */
[data-field-state="error"] { @apply border-red-500; }
[data-field-state="required"] { @apply border-blue-500; }

/* Target Radix data-state attributes */
[data-state="checked"] { @apply bg-primary; }
[data-state="unchecked"] { @apply bg-muted; }
```

### Approach B: Local Wrappers

Wrap your existing shadcn/ui components with the `IFieldProps` interface. This gives you full control over appearance while Formosaic handles state, validation, and rules.

#### Example: Textbox wrapper

```tsx
// components/form-fields/ShadcnTextbox.tsx
import { IFieldProps } from "@formosaic/core";
import { Input } from "@/components/ui/input";
import React from "react";

const ShadcnTextbox = (props: IFieldProps<{ placeHolder?: string }>) => {
  const { fieldName, value, readOnly, error, required, placeholder, config, setFieldValue } = props;

  if (readOnly) {
    return <span className="text-sm text-muted-foreground">{(value as string) || "-"}</span>;
  }

  return (
    <Input
      value={(value as string) ?? ""}
      onChange={(e) => setFieldValue(fieldName, e.target.value, false, 3000)}
      placeholder={placeholder ?? config?.placeHolder}
      aria-invalid={!!error}
      aria-required={required}
      className={error ? "border-destructive" : ""}
    />
  );
};

export default ShadcnTextbox;
```

#### Example: Toggle wrapper

```tsx
// components/form-fields/ShadcnToggle.tsx
import { IFieldProps } from "@formosaic/core";
import { Switch } from "@/components/ui/switch";
import React from "react";

const ShadcnToggle = (props: IFieldProps<{}>) => {
  const { fieldName, value, readOnly, label, setFieldValue } = props;

  if (readOnly) {
    return <span className="text-sm text-muted-foreground">{value ? "Yes" : "No"}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={!!value}
        onCheckedChange={(checked) => setFieldValue(fieldName, checked)}
      />
      <span className="text-sm">{label}</span>
    </div>
  );
};

export default ShadcnToggle;
```

#### Example: Dropdown wrapper

```tsx
// components/form-fields/ShadcnDropdown.tsx
import { IFieldProps } from "@formosaic/core";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import React from "react";

interface IDropdownProps {
  placeHolder?: string;
}

const ShadcnDropdown = (props: IFieldProps<IDropdownProps>) => {
  const { fieldName, value, readOnly, error, required, options, placeholder, config, setFieldValue } = props;

  if (readOnly) {
    return <span className="text-sm text-muted-foreground">{(value as string) || "-"}</span>;
  }

  return (
    <Select
      value={(value as string) || undefined}
      onValueChange={(val) => setFieldValue(fieldName, val)}
    >
      <SelectTrigger
        className={error ? "border-destructive" : ""}
        aria-invalid={!!error}
        aria-required={required}
      >
        <SelectValue placeholder={placeholder ?? config?.placeHolder ?? "Select..."} />
      </SelectTrigger>
      <SelectContent>
        {options?.map((option) => (
          <SelectItem key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ShadcnDropdown;
```

#### Example: Slider wrapper

```tsx
// components/form-fields/ShadcnSlider.tsx
import { IFieldProps } from "@formosaic/core";
import { Slider } from "@/components/ui/slider";
import React from "react";

interface ISliderProps {
  min?: number;
  max?: number;
  step?: number;
}

const ShadcnSlider = (props: IFieldProps<ISliderProps>) => {
  const { fieldName, value, readOnly, config, setFieldValue } = props;

  if (readOnly) {
    return <span className="text-sm text-muted-foreground">{String(value)}</span>;
  }

  return (
    <Slider
      value={[(value as number) ?? 0]}
      onValueChange={([num]) => setFieldValue(fieldName, num)}
      min={config?.min}
      max={config?.max}
      step={config?.step}
    />
  );
};

export default ShadcnSlider;
```

### Approach C: Hybrid (Radix base + selective overrides)

Start with the Radix registry and override specific fields with your shadcn wrappers:

```tsx
import { ComponentTypes } from "@formosaic/core";
import { createRadixFieldRegistry } from "@formosaic/radix";
import ShadcnTextbox from "./form-fields/ShadcnTextbox";
import ShadcnDropdown from "./form-fields/ShadcnDropdown";
import ShadcnToggle from "./form-fields/ShadcnToggle";
import React from "react";

function createShadcnFieldRegistry() {
  return {
    ...createRadixFieldRegistry(),
    // Override specific fields with shadcn wrappers
    [ComponentTypes.Textbox]: React.createElement(ShadcnTextbox),
    [ComponentTypes.Dropdown]: React.createElement(ShadcnDropdown),
    [ComponentTypes.Toggle]: React.createElement(ShadcnToggle),
  };
}
```

This gives you shadcn styling for the fields you care about most, with Radix primitives as fallback for the rest.

## Field Contract for Local Wrappers

When writing local wrappers, ensure they satisfy the `IFieldProps<T>` contract:

1. **readOnly mode**: Return a non-editable display (text span, not a disabled input)
2. **error handling**: Reflect `error` via `aria-invalid` and visual styling
3. **required indicator**: Reflect `required` via `aria-required`
4. **value serialization**: Call `setFieldValue(fieldName, value)` with the correct type:
   - Textbox/Textarea: `string`
   - Number/Slider: `number`
   - Toggle: `boolean`
   - Dropdown/SimpleDropdown/RadioGroup: `string`
   - MultiSelect/CheckboxGroup: `string[]`
   - DateControl: ISO string or `null`
5. **debounce**: Pass `timeout` parameter to `setFieldValue` for text inputs (e.g., `3000` for Textbox)

## Tailwind Styling with Data Attributes

All Formosaic fields emit `data-field-type` and `data-field-state` attributes. Use these for global styling:

```css
/* tailwind.css or global styles */
@layer components {
  [data-field-type="Textbox"] input {
    @apply h-10 rounded-md border border-input bg-background px-3 py-2 text-sm;
  }

  [data-field-state="error"] {
    @apply border-destructive;
  }

  [data-field-state="readonly"] {
    @apply opacity-60 cursor-not-allowed;
  }
}
```
