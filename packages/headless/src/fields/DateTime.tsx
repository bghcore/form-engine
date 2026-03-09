import { IFieldProps } from "@form-eng/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState, formatDateTime } from "../helpers";

interface IDateTimeConfig {
  minDateTime?: string;
  maxDateTime?: string;
}

function formatDateTimeValue(value: unknown): string {
  if (!value) return "";
  try {
    return formatDateTime(value as string);
  } catch {
    return String(value);
  }
}

const DateTime = (props: IFieldProps<IDateTimeConfig>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, config, setFieldValue } = props;

  const minDateTime = config?.minDateTime;
  const maxDateTime = config?.maxDateTime;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={formatDateTimeValue(value)} />;
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, event.target.value || null);
  };

  return (
    <input
      type="datetime-local"
      className="df-date-time"
      data-field-type="DateTime"
      data-field-state={getFieldState({ error, required, readOnly })}
      value={(value as string) ?? ""}
      min={minDateTime}
      max={maxDateTime}
      onChange={onChange}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    />
  );
};

export default DateTime;
