import { FormStrings } from "@form-eng/core";
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
        <span className="fe-status-error" id={id} role="alert">
          {error.message || "Error"}
        </span>
      ) : savePending ? (
        <span className="fe-status-warning" id={id} role="alert">
          {FormStrings.autoSavePending} ({errorCount} {FormStrings.remaining})
        </span>
      ) : saving ? (
        <span className="fe-status-saving" id={id} role="status">
          {FormStrings.saving}
        </span>
      ) : null}
    </div>
  );
};
