import { IFieldProps } from "@form-eng/core";
import { Select } from "antd";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface ISimpleDropdownProps {
  dropdownOptions?: string[];
  placeHolder?: string;
}

const SimpleDropdown = (props: IFieldProps<ISimpleDropdownProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, config, error, required, placeholder, setFieldValue } = props;

  const simpleOptions = config?.dropdownOptions ?? [];

  const onChange = (val: string) => {
    setFieldValue(fieldName, val);
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={value as string} />;
  }

  const selectOptions = simpleOptions.map(option => ({
    value: option,
    label: option,
  }));

  return (
    <Select
      className={FieldClassName("fe-simple-dropdown", error)}
      value={(value as string) || undefined}
      onChange={onChange}
      placeholder={placeholder ?? config?.placeHolder}
      options={selectOptions}
      allowClear
      status={error ? "error" : undefined}
      style={{ width: "100%" }}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    />
  );
};

export default SimpleDropdown;
