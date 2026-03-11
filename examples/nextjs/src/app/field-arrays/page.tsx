"use client";

import { Container, Typography, Paper, Alert } from "@mui/material";
import { FormEngine } from "@form-eng/core";
import FieldRegistrar from "@/components/FieldRegistrar";

const fieldConfigs = {
  teamName: {
    type: "Textbox",
    label: "Team Name",
    required: true,
  },
  teamLead: {
    type: "Textbox",
    label: "Team Lead",
    required: true,
  },
  department: {
    type: "Dropdown",
    label: "Department",
    options: [
      { value: "engineering", label: "Engineering" },
      { value: "design", label: "Design" },
      { value: "product", label: "Product" },
    ],
  },
};

const defaultValues = {
  teamName: "",
  teamLead: "",
  department: "",
};

export default function FieldArraysForm() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Field Arrays</Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        Field arrays enable repeating sections like team members, addresses, or line items.
        This example shows a team form — the field array component is available via FieldArray.
      </Alert>
      <Paper sx={{ p: 3 }}>
        <FieldRegistrar>
          <FormEngine
            configName="fieldArrayForm"
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
