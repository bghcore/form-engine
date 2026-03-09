# Adapter Parity Matrix

Implementation status of all 37 field types across adapter packages.

## Legend

- **Y** -- Native UI library component
- **FB** -- HTML fallback (semantic HTML styled with library CSS variables)
- **---** -- Not implemented

## Matrix

| # | ComponentType | Type Key | fluent | mui | headless | antd | chakra | mantine | atlaskit | base-web | heroui |
|---|---|---|---|---|---|---|---|---|---|---|---|
| | **Tier 1 (Core)** | | | | | | | | | | |
| 1 | Textbox | `Textbox` | Y | Y | Y | Y | Y | Y | --- | --- | --- |
| 2 | Number | `Number` | Y | Y | Y | Y | FB | Y | --- | --- | --- |
| 3 | Toggle | `Toggle` | Y | Y | Y | Y | FB | Y | --- | --- | --- |
| 4 | Dropdown | `Dropdown` | Y | Y | Y | Y | Y | Y | --- | --- | --- |
| 5 | SimpleDropdown | `SimpleDropdown` | Y | Y | Y | Y | Y | Y | --- | --- | --- |
| 6 | Multiselect | `Multiselect` | Y | Y | Y | Y | FB | Y | --- | --- | --- |
| 7 | DateControl | `DateControl` | Y | Y | Y | Y | Y | Y | --- | --- | --- |
| 8 | Slider | `Slider` | Y | Y | Y | Y | FB | Y | --- | --- | --- |
| 9 | RadioGroup | `RadioGroup` | Y | Y | Y | Y | FB | Y | --- | --- | --- |
| 10 | CheckboxGroup | `CheckboxGroup` | Y | Y | Y | Y | FB | Y | --- | --- | --- |
| 11 | Textarea | `Textarea` | Y | Y | Y | Y | Y | Y | --- | --- | --- |
| 12 | DynamicFragment | `DynamicFragment` | Y | Y | Y | Y | Y | Y | --- | --- | --- |
| 13 | ReadOnly | `ReadOnly` | Y | Y | Y | Y | Y | Y | --- | --- | --- |
| | **Tier 2 (Extended)** | | | | | | | | | | |
| 14 | MultiSelectSearch | `MultiSelectSearch` | Y | Y | Y | --- | --- | --- | --- | --- | --- |
| 15 | PopOutEditor / Textarea | `Textarea`* | Y | Y | Y | --- | --- | --- | --- | --- | --- |
| 16 | DocumentLinks | `DocumentLinks` | Y | Y | Y | --- | --- | --- | --- | --- | --- |
| 17 | StatusDropdown | `StatusDropdown` | Y | Y | Y | --- | --- | --- | --- | --- | --- |
| 18 | Rating | `Rating` | Y | Y | Y | --- | --- | --- | --- | --- | --- |
| 19 | ColorPicker | `ColorPicker` | Y | Y | Y | --- | --- | --- | --- | --- | --- |
| 20 | Autocomplete | `Autocomplete` | Y | Y | Y | --- | --- | --- | --- | --- | --- |
| 21 | FileUpload | `FileUpload` | Y | Y | Y | --- | --- | --- | --- | --- | --- |
| 22 | DateRange | `DateRange` | Y | Y | Y | --- | --- | --- | --- | --- | --- |
| 23 | DateTime | `DateTime` | Y | Y | Y | --- | --- | --- | --- | --- | --- |
| 24 | PhoneInput | `PhoneInput` | Y | Y | Y | --- | --- | --- | --- | --- | --- |
| 25 | ChoiceSet | `ChoiceSet` | Y | Y | Y | --- | --- | --- | --- | --- | --- |
| 26 | FieldArray | `FieldArray` | Y | Y | Y | --- | --- | --- | --- | --- | --- |
| | **Tier 3 (Read-Only)** | | | | | | | | | | |
| 27 | ReadOnlyArray | `ReadOnlyArray` | Y | Y | Y | --- | --- | --- | --- | --- | --- |
| 28 | ReadOnlyDateTime | `ReadOnlyDateTime` | Y | Y | Y | --- | --- | --- | --- | --- | --- |
| 29 | ReadOnlyCumulativeNumber | `ReadOnlyCumulativeNumber` | Y | Y | Y | --- | --- | --- | --- | --- | --- |
| 30 | ReadOnlyRichText | `ReadOnlyRichText` | Y | Y | Y | --- | --- | --- | --- | --- | --- |
| 31 | ReadOnlyWithButton | `ReadOnlyWithButton` | Y | Y | Y | --- | --- | --- | --- | --- | --- |
| 32 | RichText | `RichText` | Y | Y | Y | --- | --- | --- | --- | --- | --- |

\* The `Textarea` type key maps to `PopOutEditor` in the fluent adapter (rich textarea with modal) and to `Textarea` in all other adapters.

**Note:** fluent, mui, and headless register 26 entries each (covering ChoiceSet and FieldArray which are handled at the form engine level). antd, chakra, and mantine register 13 entries each (Tier 1 only). atlaskit, base-web, and heroui are planned adapters targeting 13 Tier 1 entries.

## Chakra Fallback Details

The Chakra UI v3 adapter uses semantic HTML fallbacks for several field types due to TypeScript DTS compatibility issues with Ark UI's `Assign` type. Chakra v3's compound components (Switch, Slider, RadioGroup, CheckboxGroup, NumberInput) rely on Ark UI internally, and the `Assign` utility type causes declaration file generation failures when building with tsup.

### Affected Components

| Component | Chakra Component | Fallback Used | Styling |
|---|---|---|---|
| Number | `NumberInput` (Ark) | `<input type="number">` via Chakra `Input` | Chakra `Input` component |
| Toggle | `Switch` (Ark) | `<input type="checkbox" role="switch">` | Chakra CSS variables |
| Multiselect | `Select` (Ark) | `<select multiple>` | Chakra CSS variables |
| Slider | `Slider` (Ark) | `<input type="range">` | Chakra CSS variables |
| RadioGroup | `RadioGroup` (Ark) | `<fieldset>` + `<input type="radio">` | Chakra CSS variables |
| CheckboxGroup | `CheckboxGroup` (Ark) | `<fieldset>` + `<input type="checkbox">` | Chakra CSS variables |

### Non-Affected Components

| Component | Implementation | Notes |
|---|---|---|
| Textbox | Chakra `Input` | No Ark dependency |
| Dropdown | Chakra `NativeSelect` | No Ark dependency |
| SimpleDropdown | Chakra `NativeSelect` | No Ark dependency |
| DateControl | Chakra `Input` (`type="date"`) | No Ark dependency |
| Textarea | Chakra `Textarea` | No Ark dependency |
| DynamicFragment | `<input type="hidden">` | No UI component needed |
| ReadOnly | `ReadOnlyText` | Plain text display |

### Root Cause

Ark UI's `Assign<T, U>` type merges two types but produces a conditional type that TypeScript cannot resolve when generating `.d.ts` files through tsup/rollup-plugin-dts. This is a known upstream issue. The fallback components are fully functional and styled with Chakra's CSS custom properties for visual consistency.

## Tier 2 Gap Summary

The following Tier 2 field types are only implemented in fluent, mui, and headless adapters. Newer adapters (antd, chakra, mantine, and planned atlaskit, base-web, heroui) do not yet support these:

| Type | Description | Complexity |
|---|---|---|
| MultiSelectSearch | Searchable multi-select with async options | High -- requires combobox pattern |
| DocumentLinks | Dynamic link list with add/delete | Medium -- structured data UI |
| StatusDropdown | Dropdown with color-coded status indicators | Low -- styled dropdown variant |
| Rating | Star/numeric rating input | Low -- simple range input |
| ColorPicker | Color selection with preview | Medium -- requires color picker widget |
| Autocomplete | Typeahead search input | High -- requires combobox pattern |
| FileUpload | File selection with drag-and-drop | Medium -- file input + preview |
| DateRange | Start/end date pair picker | Medium -- dual date inputs |
| DateTime | Date + time picker | Medium -- date + time inputs |
| PhoneInput | Formatted phone number input | Low -- masked input |

Tier 3 read-only types (ReadOnlyArray, ReadOnlyDateTime, ReadOnlyCumulativeNumber, ReadOnlyRichText, ReadOnlyWithButton) are display-only and relatively low complexity to implement.
