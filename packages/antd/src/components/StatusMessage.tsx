import { FormStrings } from "@formosaic/core";
import React from "react";
import { FieldError } from "react-hook-form";
import { Typography } from "antd";

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
        <Typography.Text type="danger" id={id} role="alert">
          {error.message || "Error"}
        </Typography.Text>
      ) : savePending ? (
        <Typography.Text type="warning" id={id} role="alert">
          {FormStrings.autoSavePending} ({errorCount} {FormStrings.remaining})
        </Typography.Text>
      ) : saving ? (
        <Typography.Text type="secondary" id={id} role="status">
          {FormStrings.saving}
        </Typography.Text>
      ) : null}
    </div>
  );
};
