import React from "react";
import { IFieldProps } from "@formosaic/core";

const ShadcnDateControl = (props: IFieldProps<{}>) => {
  const { fieldName, value, readOnly, error, required, setFieldValue } = props;

  if (readOnly) {
    if (!value) return <span style={{ color: "#6b7280", fontSize: "14px" }}>-</span>;
    return <span style={{ color: "#6b7280", fontSize: "14px" }}>{new Date(value as string).toLocaleDateString()}</span>;
  }

  const dateInputValue = value ? new Date(value as string).toISOString().split("T")[0] : "";

  return (
    <input
      type="date"
      value={dateInputValue}
      onChange={(e) => {
        const date = new Date(e.target.value);
        if (!isNaN(date.getTime())) setFieldValue(fieldName, date.toISOString());
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

export default ShadcnDateControl;
