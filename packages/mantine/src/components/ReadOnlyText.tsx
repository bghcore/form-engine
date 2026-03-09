import React from "react";

export interface IReadOnlyFieldProps {
  readonly value?: string;
  readonly fieldName?: string;
  readonly labelClassName?: string;
  readonly valueClassName?: string;
  readonly showControlOnSide?: boolean;
  readonly containerClassName?: string;
  readonly ellipsifyTextCharacters?: number;
}

export const ReadOnlyText: React.FunctionComponent<IReadOnlyFieldProps> = (props) => {
  const { value, fieldName, ellipsifyTextCharacters } = props;
  const cutoff = (ellipsifyTextCharacters || 0) - 3;

  const displayValue = value
    ? ellipsifyTextCharacters && value.length > ellipsifyTextCharacters
      ? `${value.substring(0, cutoff)}...`
      : value
    : "-";

  return (
    <span
      id={`${fieldName}-read-only`}
      className="fe-read-only-text"
      title={value}
    >
      {displayValue}
    </span>
  );
};

export default ReadOnlyText;
