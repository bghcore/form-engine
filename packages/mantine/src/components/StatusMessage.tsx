import { FormStrings } from "@formosaic/core";
import React from "react";
import { FieldError } from "react-hook-form";

interface IStatusMessageProps {
  id?: string;
  readonly error?: FieldError;
  readonly errorCount?: number;
  readonly savePending?: boolean;
  readonly saving?: boolean;
}

export const StatusMessage: React.FunctionComponent<IStatusMessageProps> = (props) => {
  const { id, error, errorCount, savePending, saving } = props;
  return (
    <div className="fe-status-message">
      {error ? (
        <span id={id} role="alert" style={{ color: "var(--mantine-color-red-6, #fa5252)" }}>
          {error.message || "Error"}
        </span>
      ) : savePending ? (
        <span id={id} role="alert" style={{ color: "var(--mantine-color-orange-6, #fd7e14)" }}>
          {FormStrings.autoSavePending} ({errorCount} {FormStrings.remaining})
        </span>
      ) : saving ? (
        <span id={id} role="status" style={{ color: "var(--mantine-color-gray-6, #868e96)" }}>
          {FormStrings.saving}
        </span>
      ) : null}
    </div>
  );
};
