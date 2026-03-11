import React from "react";
import { IFieldProps } from "@formosaic/core";
import * as Checkbox from "@radix-ui/react-checkbox";

const ShadcnCheckboxGroup = (props: IFieldProps<{}>) => {
  const { fieldName, value, readOnly, options, setFieldValue } = props;
  const selected = Array.isArray(value) ? (value as string[]) : [];

  if (readOnly) {
    const labels = options
      ?.filter((o) => selected.includes(String(o.value)))
      .map((o) => o.label)
      .join(", ");
    return <span style={{ color: "#6b7280", fontSize: "14px" }}>{labels || "-"}</span>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {options?.map((option) => (
        <label
          key={String(option.value)}
          style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}
        >
          <Checkbox.Root
            checked={selected.includes(String(option.value))}
            onCheckedChange={(checked) => {
              const next = checked
                ? [...selected, String(option.value)]
                : selected.filter((v) => v !== String(option.value));
              setFieldValue(fieldName, next);
            }}
            disabled={option.disabled}
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              backgroundColor: selected.includes(String(option.value)) ? "#18181b" : "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Checkbox.Indicator>
              <span style={{ color: "white", fontSize: "10px" }}>&#10003;</span>
            </Checkbox.Indicator>
          </Checkbox.Root>
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default ShadcnCheckboxGroup;
