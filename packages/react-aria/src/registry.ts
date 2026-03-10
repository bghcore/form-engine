import { ComponentTypes, Dictionary } from "@form-eng/core";
import Textbox from "./fields/Textbox";
import NumberField from "./fields/Number";
import Toggle from "./fields/Toggle";
import Dropdown from "./fields/Dropdown";
import MultiSelect from "./fields/MultiSelect";
import DateControl from "./fields/DateControl";
import Slider from "./fields/Slider";
import DynamicFragment from "./fields/DynamicFragment";
import SimpleDropdown from "./fields/SimpleDropdown";
import Textarea from "./fields/Textarea";
import RadioGroup from "./fields/RadioGroup";
import CheckboxGroup from "./fields/CheckboxGroup";
import ReadOnly from "./fields/readonly/ReadOnly";
import React from "react";

/** Creates the default React Aria Components field registry for use with InjectedFieldProvider */
export function createReactAriaFieldRegistry(): Dictionary<React.JSX.Element> {
  return {
    [ComponentTypes.Textbox]: React.createElement(Textbox),
    [ComponentTypes.Number]: React.createElement(NumberField),
    [ComponentTypes.Toggle]: React.createElement(Toggle),
    [ComponentTypes.Dropdown]: React.createElement(Dropdown),
    [ComponentTypes.MultiSelect]: React.createElement(MultiSelect),
    [ComponentTypes.DateControl]: React.createElement(DateControl),
    [ComponentTypes.Slider]: React.createElement(Slider),
    [ComponentTypes.Fragment]: React.createElement(DynamicFragment),
    [ComponentTypes.SimpleDropdown]: React.createElement(SimpleDropdown),
    [ComponentTypes.Textarea]: React.createElement(Textarea),
    [ComponentTypes.RadioGroup]: React.createElement(RadioGroup),
    [ComponentTypes.CheckboxGroup]: React.createElement(CheckboxGroup),
    [ComponentTypes.ReadOnly]: React.createElement(ReadOnly),
  };
}
