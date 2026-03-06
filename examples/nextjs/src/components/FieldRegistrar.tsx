"use client";

import { useEffect } from "react";
import { UseInjectedHookFieldContext } from "@form-engine/core";
import { createMuiFieldRegistry } from "@form-engine/mui";

export default function FieldRegistrar({ children }: { children: React.ReactNode }) {
  const { setInjectedFields } = UseInjectedHookFieldContext();
  useEffect(() => {
    setInjectedFields(createMuiFieldRegistry());
  }, [setInjectedFields]);
  return <>{children}</>;
}
