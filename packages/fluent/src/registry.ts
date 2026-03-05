import { ComponentTypes, Dictionary } from "@bghcore/dynamic-forms-core";
import HookTextbox from "./fields/Textbox";
import HookNumber from "./fields/Number";
import HookToggle from "./fields/Toggle";
import HookDropdown from "./fields/Dropdown";
import HookMultiSelect from "./fields/MultiSelect";
import HookDateControl from "./fields/DateControl";
import HookSlider from "./fields/Slider";
import HookFragment from "./fields/DynamicFragment";
import HookSimpleDropdown from "./fields/SimpleDropdown";
import HookMultiSelectSearch from "./fields/MultiSelectSearch";
import HookPopOutEditor from "./fields/PopOutEditor";
import HookDocumentLinks from "./fields/DocumentLinks";
import HookStatusDropdown from "./fields/StatusDropdown";
import HookReadOnly from "./fields/readonly/ReadOnly";
import HookReadOnlyArray from "./fields/readonly/ReadOnlyArray";
import HookReadOnlyDateTime from "./fields/readonly/ReadOnlyDateTime";
import HookReadOnlyCumulativeNumber from "./fields/readonly/ReadOnlyCumulativeNumber";
import HookReadOnlyRichText from "./fields/readonly/ReadOnlyRichText";
import HookReadOnlyWithButton from "./fields/readonly/ReadOnlyWithButton";
import React from "react";

/** Creates the default Fluent UI v9 field registry for use with InjectedFieldProvider */
export function createFluentFieldRegistry(): Dictionary<React.JSX.Element> {
  return {
    [ComponentTypes.Textbox]: React.createElement(HookTextbox),
    [ComponentTypes.Number]: React.createElement(HookNumber),
    [ComponentTypes.Toggle]: React.createElement(HookToggle),
    [ComponentTypes.Dropdown]: React.createElement(HookDropdown),
    [ComponentTypes.MultiSelect]: React.createElement(HookMultiSelect),
    [ComponentTypes.DateControl]: React.createElement(HookDateControl),
    [ComponentTypes.Slider]: React.createElement(HookSlider),
    [ComponentTypes.Fragment]: React.createElement(HookFragment),
    [ComponentTypes.SimpleDropdown]: React.createElement(HookSimpleDropdown),
    [ComponentTypes.MultiSelectSearch]: React.createElement(HookMultiSelectSearch),
    [ComponentTypes.Textarea]: React.createElement(HookPopOutEditor),
    [ComponentTypes.DocumentLinks]: React.createElement(HookDocumentLinks),
    [ComponentTypes.StatusDropdown]: React.createElement(HookStatusDropdown),
    [ComponentTypes.ReadOnly]: React.createElement(HookReadOnly),
    [ComponentTypes.ReadOnlyArray]: React.createElement(HookReadOnlyArray),
    [ComponentTypes.ReadOnlyDateTime]: React.createElement(HookReadOnlyDateTime),
    [ComponentTypes.ReadOnlyCumulativeNumber]: React.createElement(HookReadOnlyCumulativeNumber),
    [ComponentTypes.ReadOnlyRichText]: React.createElement(HookReadOnlyRichText),
    [ComponentTypes.ReadOnlyWithButton]: React.createElement(HookReadOnlyWithButton),
  };
}
