import { IFieldProps } from "@form-eng/core";
import React from "react";
import { TextField } from "@mui/material";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface IPhoneInputConfig {
  format?: "us" | "international" | "raw";
}

function extractDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function formatPhone(digits: string, format: "us" | "international" | "raw"): string {
  if (format === "raw") return digits;

  if (format === "international") {
    // +X XXX XXX XXXX
    const d = digits.slice(0, 12);
    if (d.length === 0) return "";
    if (d.length <= 1) return `+${d}`;
    if (d.length <= 4) return `+${d[0]} ${d.slice(1)}`;
    if (d.length <= 7) return `+${d[0]} ${d.slice(1, 4)} ${d.slice(4)}`;
    return `+${d[0]} ${d.slice(1, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  }

  // US: (XXX) XXX-XXXX
  const d = digits.slice(0, 10);
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

const PhoneInput = (props: IFieldProps<IPhoneInputConfig>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, config, setFieldValue } = props;

  const format = config?.format ?? "us";

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={(value as string) ?? ""} />;
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = extractDigits(event.target.value);
    const formatted = formatPhone(digits, format);
    setFieldValue(fieldName, formatted);
  };

  return (
    <TextField
      type="tel"
      className={FieldClassName("fe-phone-input", error)}
      value={(value as string) ?? ""}
      onChange={onChange}
      error={!!error}
      required={required}
      inputProps={{
        "aria-invalid": !!error,
        "aria-required": required,
        "data-testid": GetFieldDataTestId(fieldName, programName, entityType, entityId),
      }}
      size="small"
      fullWidth
    />
  );
};

export default PhoneInput;
