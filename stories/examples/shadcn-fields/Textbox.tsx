import React from "react";
import { IFieldProps } from "@form-eng/core";

const ShadcnTextbox = (props: IFieldProps<{}>) => {
  const { fieldName, value, readOnly, error, required, placeholder, setFieldValue } = props;

  if (readOnly) {
    return <span style={{ color: "#6b7280", fontSize: "14px" }}>{(value as string) || "-"}</span>;
  }

  return (
    <input
      type="text"
      value={(value as string) ?? ""}
      onChange={(e) => setFieldValue(fieldName, e.target.value, false, 3000)}
      placeholder={placeholder}
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

export default ShadcnTextbox;
