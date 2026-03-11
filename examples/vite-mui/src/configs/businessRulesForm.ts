import { Dictionary } from "@formosaic/core";
import type { IFieldConfig } from "@formosaic/core";

export const businessRulesConfig: Dictionary<IFieldConfig> = {
  type: {
    type: "Dropdown",
    label: "Issue Type",
    required: true,
    options: [
      { value: "bug", label: "Bug Report" },
      { value: "feature", label: "Feature Request" },
      { value: "question", label: "Question" },
    ],
  },
  severity: {
    type: "Dropdown",
    label: "Severity",
    hidden: true,
    options: [
      { value: "critical", label: "Critical" },
      { value: "major", label: "Major" },
      { value: "minor", label: "Minor" },
    ],
    rules: [
      { when: { field: "type", operator: "equals", value: "bug" }, then: { hidden: false, required: true } },
    ],
  },
  steps: {
    type: "Textarea",
    label: "Steps to Reproduce",
    hidden: true,
    rules: [
      { when: { field: "type", operator: "equals", value: "bug" }, then: { hidden: false, required: true } },
    ],
  },
  description: { type: "Textbox", label: "Description", required: true },
  priority: {
    type: "Dropdown",
    label: "Priority",
    options: [
      { value: "high", label: "High" },
      { value: "medium", label: "Medium" },
      { value: "low", label: "Low" },
    ],
  },
};

export const businessRulesDefaults = { type: "", severity: "", steps: "", description: "", priority: "" };
