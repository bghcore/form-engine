"use client";

import { Container, Typography, Paper, Alert } from "@mui/material";
import { FormEngine } from "@form-eng/core";
import FieldRegistrar from "@/components/FieldRegistrar";

const fieldConfigs = {
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
  stepsToReproduce: {
    type: "Textarea",
    label: "Steps to Reproduce",
    hidden: true,
    rules: [
      { when: { field: "type", operator: "equals", value: "bug" }, then: { hidden: false, required: true } },
    ],
  },
  description: {
    type: "Textbox",
    label: "Description",
    required: true,
    rules: [
      { when: { field: "type", operator: "equals", value: "bug" }, then: { type: "Textarea" } },
      { when: { field: "type", operator: "equals", value: "feature" }, then: { type: "Textarea" } },
    ],
  },
  priority: {
    type: "Dropdown",
    label: "Priority",
    options: [
      { value: "high", label: "High" },
      { value: "medium", label: "Medium" },
      { value: "low", label: "Low" },
    ],
  },
  assignee: {
    type: "Textbox",
    label: "Assignee",
  },
};

const defaultValues = {
  type: "",
  severity: "",
  stepsToReproduce: "",
  description: "",
  priority: "",
  assignee: "",
};

export default function BusinessRulesForm() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Business Rules</Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        Try changing &quot;Issue Type&quot; — watch how Severity, Steps to Reproduce,
        and Description react. Bug shows all fields, Feature hides severity/steps,
        Question switches Description to a single-line input.
      </Alert>
      <Paper sx={{ p: 3 }}>
        <FieldRegistrar>
          <FormEngine
            configName="businessRulesForm"
            programName="example"
            fieldConfigs={fieldConfigs}
            defaultValues={defaultValues}
            isManualSave={true}
            saveData={async (data) => {
              alert("Saved!\n\n" + JSON.stringify(data, null, 2));
              return data;
            }}
          />
        </FieldRegistrar>
      </Paper>
    </Container>
  );
}
