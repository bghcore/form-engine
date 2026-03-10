import React from "react";
import { IFieldProps } from "@form-eng/core";
import * as Select from "@radix-ui/react-select";

interface IDropdownProps {
  placeHolder?: string;
}

const ShadcnDropdown = (props: IFieldProps<IDropdownProps>) => {
  const { fieldName, value, readOnly, error, required, options, placeholder, config, setFieldValue } = props;

  if (readOnly) {
    const label = options?.find((o) => String(o.value) === value)?.label ?? (value as string) ?? "-";
    return <span style={{ color: "#6b7280", fontSize: "14px" }}>{label || "-"}</span>;
  }

  return (
    <Select.Root
      value={(value as string) || undefined}
      onValueChange={(val) => setFieldValue(fieldName, val)}
    >
      <Select.Trigger
        aria-invalid={!!error}
        aria-required={required}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "8px 12px",
          borderRadius: "6px",
          border: `1px solid ${error ? "#ef4444" : "#d1d5db"}`,
          fontSize: "14px",
          backgroundColor: "white",
          cursor: "pointer",
        }}
      >
        <Select.Value placeholder={placeholder ?? config?.placeHolder ?? "Select..."} />
        <Select.Icon style={{ marginLeft: "8px" }}>&#9660;</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          style={{
            backgroundColor: "white",
            borderRadius: "6px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <Select.Viewport style={{ padding: "4px" }}>
            {options?.map((option) => (
              <Select.Item
                key={String(option.value)}
                value={String(option.value)}
                disabled={option.disabled}
                style={{
                  padding: "6px 8px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default ShadcnDropdown;
