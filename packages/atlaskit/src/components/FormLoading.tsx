import { FormConstants } from "@form-eng/core";
import React from "react";

interface IFormLoadingProps {
  loadingShimmerCount?: number;
  loadingFieldShimmerHeight?: number;
  inPanel?: boolean;
  hideTitleShimmer?: boolean;
}

export const FormLoading = (props: IFormLoadingProps) => {
  const { loadingShimmerCount, inPanel, hideTitleShimmer } = props;
  const count = loadingShimmerCount || FormConstants.loadingShimmerCount;

  return (
    <div
      className={`ak-form-loading ${inPanel ? "ak-form-loading--panel" : ""}`}
      role="status"
      aria-label="Loading form"
    >
      {[...Array(count)].map((_, i) => (
        <div key={`ak-loading-${i}`} style={{ marginBottom: 16 }}>
          {!hideTitleShimmer && (
            <div
              style={{
                width: "33%",
                height: 12,
                marginBottom: 8,
                backgroundColor: "var(--ds-skeleton, #F1F2F4)",
                borderRadius: 3,
              }}
            />
          )}
          <div
            style={{
              width: "100%",
              height: 36,
              backgroundColor: "var(--ds-skeleton, #F1F2F4)",
              borderRadius: 3,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default FormLoading;
