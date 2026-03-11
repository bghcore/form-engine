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
        <span id={id} role="alert" style={{ color: "var(--chakra-colors-red-500, #E53E3E)" }}>
          {error.message || "Error"}
        </span>
      ) : savePending ? (
        <span id={id} role="alert" style={{ color: "var(--chakra-colors-orange-500, #DD6B20)" }}>
          {FormStrings.autoSavePending} ({errorCount} {FormStrings.remaining})
        </span>
      ) : saving ? (
        <span id={id} role="status" style={{ color: "var(--chakra-colors-gray-500, #718096)" }}>
          {FormStrings.saving}
        </span>
      ) : null}
    </div>
  );
};
