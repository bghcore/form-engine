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
    <div className="ak-status-message" data-field-type="StatusMessage">
      {error ? (
        <span className="ak-status-error" id={id} role="alert">
          {error.message || "Error"}
        </span>
      ) : savePending ? (
        <span className="ak-status-warning" id={id} role="alert">
          {FormStrings.autoSavePending} ({errorCount} {FormStrings.remaining})
        </span>
      ) : saving ? (
        <span className="ak-status-saving" id={id} role="status">
          {FormStrings.saving}
        </span>
      ) : null}
    </div>
  );
};
