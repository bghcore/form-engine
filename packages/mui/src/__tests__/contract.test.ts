import { runAdapterContractTests, ALL_FIELD_TYPES } from "@formosaic/core/testing";
import { createMuiFieldRegistry } from "../registry";

// Exclude types not in registry + types requiring useFormContext
const EXCLUDED = [
  "PopOutEditor",
  "RichText",
  "ChoiceSet",
  "FieldArray",
  "Multiselect",           // requires useFormContext
  "MultiSelectSearch",     // requires useFormContext
  "DocumentLinks",         // requires useFormContext
  "ReadOnlyCumulativeNumber", // requires useFormContext
  "StatusDropdown",        // requires useFormContext
];

runAdapterContractTests(createMuiFieldRegistry, {
  suiteName: "Material UI",
  onlyTypes: ALL_FIELD_TYPES.filter(t => !EXCLUDED.includes(t)),
});
