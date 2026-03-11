import React from "react";
import { IFieldProps } from "@form-eng/core";

const ShadcnReadOnly = (props: IFieldProps<{}>) => {
  const { value } = props;
  return (
    <span style={{ color: "#6b7280", fontSize: "14px" }}>
      {value != null && value !== "" ? String(value) : "-"}
    </span>
  );
};

export default ShadcnReadOnly;
