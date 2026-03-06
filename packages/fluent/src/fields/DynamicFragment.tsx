import { IFieldProps } from "@form-engine/core";
import React from "react";

const Fragment = (props: IFieldProps<{}>) => {
  const { value } = props;
  return <input type="hidden" value={value as string} />;
};

export default Fragment;
