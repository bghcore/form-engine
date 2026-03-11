import React from "react";
import { IFieldProps } from "@form-eng/core";

const ShadcnNumber = (props: IFieldProps<{}>) => {
  const { fieldName, value, readOnly, error, required, setFieldValue } = props;

  if (readOnly) {
    return <span style={{ color: "#6b7280", fontSize: "14px" }}>{String(value ?? "-")}</span>;
  }

  return (
    <input
      type="number"
      value={value != null ? String(value) : ""}
      onChange={(e) => {
        const num = Number(e.target.value);
        if (!isNaN(num)) setFieldValue(fieldName, num, false, 1500);
      }}
      aria-invalid={!!error}
      aria-required={required}
      style={{
        width: "100%",
        padding: "8px 12px",
        borderRadius: "6px",
        border: `1px solid ${error ? "#ef4444" : "#d1d5db"}`,
        fontSize: "14px",
        lineHeight: "20px",
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
};

export default ShadcnNumber;
