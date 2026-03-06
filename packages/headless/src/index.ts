// Field components
export { default as Textbox } from "./fields/Textbox";
export { default as Number } from "./fields/Number";
export { default as Toggle } from "./fields/Toggle";
export { default as Dropdown } from "./fields/Dropdown";
export { default as MultiSelect } from "./fields/MultiSelect";
export { default as DateControl } from "./fields/DateControl";
export { default as Slider } from "./fields/Slider";
export { default as DynamicFragment } from "./fields/DynamicFragment";
export { default as SimpleDropdown } from "./fields/SimpleDropdown";
export { default as MultiSelectSearch } from "./fields/MultiSelectSearch";
export { default as Textarea } from "./fields/Textarea";
export { default as DocumentLinks } from "./fields/DocumentLinks";
export { default as StatusDropdown } from "./fields/StatusDropdown";

// Read-only fields
export { default as ReadOnly } from "./fields/readonly/ReadOnly";
export { default as ReadOnlyArray } from "./fields/readonly/ReadOnlyArray";
export { default as ReadOnlyDateTime } from "./fields/readonly/ReadOnlyDateTime";
export { default as ReadOnlyCumulativeNumber } from "./fields/readonly/ReadOnlyCumulativeNumber";
export { default as ReadOnlyRichText } from "./fields/readonly/ReadOnlyRichText";
export { default as ReadOnlyWithButton } from "./fields/readonly/ReadOnlyWithButton";

// Supporting components
export { ReadOnlyText } from "./components/ReadOnlyText";
export type { IReadOnlyFieldProps } from "./components/ReadOnlyText";
export { StatusMessage } from "./components/StatusMessage";
export { FormLoading } from "./components/FormLoading";

// Document link types
export type { IDocumentLink } from "./fields/DocumentLinks";

// Registry
export { createHeadlessFieldRegistry } from "./registry";

// Helpers
export { GetFieldDataTestId, getFieldState, formatDateTime, DocumentLinksStrings } from "./helpers";

// ----- Deprecated aliases (old Hook-prefixed names) -----

/** @deprecated Use Textbox instead */
export { default as HookTextbox } from "./fields/Textbox";
/** @deprecated Use Number instead */
export { default as HookNumber } from "./fields/Number";
/** @deprecated Use Toggle instead */
export { default as HookToggle } from "./fields/Toggle";
/** @deprecated Use Dropdown instead */
export { default as HookDropdown } from "./fields/Dropdown";
/** @deprecated Use MultiSelect instead */
export { default as HookMultiSelect } from "./fields/MultiSelect";
/** @deprecated Use DateControl instead */
export { default as HookDateControl } from "./fields/DateControl";
/** @deprecated Use Slider instead */
export { default as HookSlider } from "./fields/Slider";
/** @deprecated Use DynamicFragment instead */
export { default as HookDynamicFragment } from "./fields/DynamicFragment";
/** @deprecated Use SimpleDropdown instead */
export { default as HookSimpleDropdown } from "./fields/SimpleDropdown";
/** @deprecated Use MultiSelectSearch instead */
export { default as HookMultiSelectSearch } from "./fields/MultiSelectSearch";
/** @deprecated Use Textarea instead */
export { default as HookTextarea } from "./fields/Textarea";
/** @deprecated Use DocumentLinks instead */
export { default as HookDocumentLinks } from "./fields/DocumentLinks";
/** @deprecated Use StatusDropdown instead */
export { default as HookStatusDropdown } from "./fields/StatusDropdown";
/** @deprecated Use ReadOnly instead */
export { default as HookReadOnly } from "./fields/readonly/ReadOnly";
/** @deprecated Use ReadOnlyArray instead */
export { default as HookReadOnlyArray } from "./fields/readonly/ReadOnlyArray";
/** @deprecated Use ReadOnlyDateTime instead */
export { default as HookReadOnlyDateTime } from "./fields/readonly/ReadOnlyDateTime";
/** @deprecated Use ReadOnlyCumulativeNumber instead */
export { default as HookReadOnlyCumulativeNumber } from "./fields/readonly/ReadOnlyCumulativeNumber";
/** @deprecated Use ReadOnlyRichText instead */
export { default as HookReadOnlyRichText } from "./fields/readonly/ReadOnlyRichText";
/** @deprecated Use ReadOnlyWithButton instead */
export { default as HookReadOnlyWithButton } from "./fields/readonly/ReadOnlyWithButton";
/** @deprecated Use FormLoading instead */
export { HookFormLoading } from "./components/FormLoading";
