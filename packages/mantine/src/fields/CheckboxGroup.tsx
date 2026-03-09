import { IFieldProps } from "@form-eng/core";
import { Checkbox, Group } from "@mantine/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

const CheckboxGroup = (props: IFieldProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, options, setFieldValue } = props;

  const selected = Array.isArray(value) ? (value as string[]) : [];

  const onChange = (val: string[]) => {
    setFieldValue(fieldName, val);
  };

  if (readOnly) {
    const labels = options
      ?.filter(o => selected.includes(String(o.value)))
      .map(o => o.label)
      .join(", ");
    return <ReadOnlyText fieldName={fieldName} value={labels ?? ""} />;
  }

  return (
    <Checkbox.Group
      className="fe-checkbox-group"
      value={selected}
      onChange={onChange}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    >
      <Group mt="xs">
        {options?.map(option => (
          <Checkbox
            key={String(option.value)}
            value={String(option.value)}
            label={option.label}
            disabled={option.disabled}
          />
        ))}
      </Group>
    </Checkbox.Group>
  );
};

export default CheckboxGroup;
