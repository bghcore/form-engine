"use client";

import { Container, Typography, Paper, Box } from "@mui/material";
import { FormEngine } from "@formosaic/core";
import FieldRegistrar from "@/components/FieldRegistrar";

const fieldConfigs = {
  name: {
    type: "Textbox",
    label: "Full Name",
    required: true,
  },
  email: {
    type: "Textbox",
    label: "Email Address",
    required: true,
    validate: [{ name: "EmailValidation" }],
  },
  department: {
    type: "Dropdown",
    label: "Department",
    required: true,
    options: [
      { value: "engineering", label: "Engineering" },
      { value: "design", label: "Design" },
      { value: "marketing", label: "Marketing" },
      { value: "sales", label: "Sales" },
    ],
  },
  newsletter: {
    type: "Toggle",
    label: "Subscribe to Newsletter",
  },
  notes: {
    type: "Textarea",
    label: "Additional Notes",
  },
};

const defaultValues = {
  name: "",
  email: "",
  department: "",
  newsletter: false,
  notes: "",
};

export default function BasicForm() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Basic Form</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Simple form with text inputs, a dropdown, toggle, and textarea.
        Name and email are required. Email uses built-in EmailValidation.
      </Typography>
      <Paper sx={{ p: 3 }}>
        <FieldRegistrar>
          <FormEngine
            configName="basicForm"
            programName="example"
            fieldConfigs={fieldConfigs}
            defaultValues={defaultValues}
            isManualSave={true}
            saveData={async (data) => {
              alert("Form saved!\n\n" + JSON.stringify(data, null, 2));
              return data;
            }}
          />
        </FieldRegistrar>
      </Paper>
    </Container>
  );
}
