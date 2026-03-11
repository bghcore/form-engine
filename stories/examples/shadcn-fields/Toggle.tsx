import React from "react";
import { IFieldProps } from "@formosaic/core";
import * as Switch from "@radix-ui/react-switch";

const ShadcnToggle = (props: IFieldProps<{}>) => {
  const { fieldName, value, readOnly, label, setFieldValue } = props;

  if (readOnly) {
    return <span style={{ color: "#6b7280", fontSize: "14px" }}>{value ? "Yes" : "No"}</span>;
  }

  return (
    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
      <Switch.Root
        checked={!!value}
        onCheckedChange={(checked) => setFieldValue(fieldName, checked)}
        style={{
          width: "36px",
          height: "20px",
          backgroundColor: value ? "#18181b" : "#e5e7eb",
          borderRadius: "9999px",
          position: "relative",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        <Switch.Thumb
          style={{
            display: "block",
            width: "16px",
            height: "16px",
            backgroundColor: "white",
            borderRadius: "9999px",
            transition: "transform 100ms",
            transform: value ? "translateX(18px)" : "translateX(2px)",
          }}
        />
      </Switch.Root>
      {label && <span style={{ fontSize: "14px" }}>{label}</span>}
    </label>
  );
};

export default ShadcnToggle;
