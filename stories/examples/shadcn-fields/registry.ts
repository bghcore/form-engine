import { ComponentTypes, Dictionary } from "@formosaic/core";
import { createRadixFieldRegistry } from "@formosaic/radix";
import React from "react";

import ShadcnTextbox from "./Textbox";
import ShadcnNumber from "./Number";
import ShadcnDropdown from "./Dropdown";
import ShadcnToggle from "./Toggle";
import ShadcnCheckboxGroup from "./CheckboxGroup";
import ShadcnDateControl from "./DateControl";
import ShadcnReadOnly from "./ReadOnly";

/**
 * Creates a shadcn-style field registry by spreading the base Radix registry
 * and overriding selected fields with styled wrappers.
 */
export function createShadcnFieldRegistry(): Dictionary<React.JSX.Element> {
  return {
    ...createRadixFieldRegistry(),
    [ComponentTypes.Textbox]: React.createElement(ShadcnTextbox),
    [ComponentTypes.Number]: React.createElement(ShadcnNumber),
    [ComponentTypes.Dropdown]: React.createElement(ShadcnDropdown),
    [ComponentTypes.Toggle]: React.createElement(ShadcnToggle),
    [ComponentTypes.CheckboxGroup]: React.createElement(ShadcnCheckboxGroup),
    [ComponentTypes.DateControl]: React.createElement(ShadcnDateControl),
    [ComponentTypes.ReadOnly]: React.createElement(ShadcnReadOnly),
  };
}
