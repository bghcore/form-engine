import { Dictionary } from "@formosaic/core";
import type { IFieldConfig } from "@formosaic/core";

export const basicFormConfig: Dictionary<IFieldConfig> = {
  name: { type: "Textbox", label: "Full Name", required: true },
  email: { type: "Textbox", label: "Email", required: true, validate: [{ name: "EmailValidation" }] },
  phone: { type: "Textbox", label: "Phone", validate: [{ name: "PhoneNumberValidation" }] },
  department: {
    type: "Dropdown",
    label: "Department",
    required: true,
    options: [
      { value: "engineering", label: "Engineering" },
      { value: "design", label: "Design" },
      { value: "marketing", label: "Marketing" },
    ],
  },
  newsletter: { type: "Toggle", label: "Subscribe to Newsletter" },
};

export const basicDefaults = { name: "", email: "", phone: "", department: "", newsletter: false };
