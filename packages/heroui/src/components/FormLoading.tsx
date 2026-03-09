import { FormConstants } from "@form-eng/core";
import React from "react";

interface IFormLoadingProps {
  loadingShimmerCount?: number;
  loadingFieldShimmerHeight?: number;
  inPanel?: boolean;
  hideTitleShimmer?: boolean;
}

export const FormLoading = (props: IFormLoadingProps) => {
  const { loadingShimmerCount, loadingFieldShimmerHeight, inPanel, hideTitleShimmer } = props;
  const count = loadingShimmerCount || FormConstants.loadingShimmerCount;
  const height = loadingFieldShimmerHeight || FormConstants.loadingFieldShimmerHeight;

  return (
    <div
      className={`fe-form-loading ${inPanel ? "fe-form-loading--panel" : ""}`}
      role="status"
      aria-label="Loading form"
    >
      {[...Array(count)].map((_, i) => (
        <div key={`fe-loading-${i}`} style={{ marginBottom: 16 }}>
          {!hideTitleShimmer && (
            <div className="fe-skeleton fe-skeleton--label" style={{ width: "33%", marginBottom: 8, height: 14, background: "#e0e0e0", borderRadius: 4 }} />
          )}
          <div className="fe-skeleton fe-skeleton--input" style={{ width: "100%", height: `${height}px`, background: "#e0e0e0", borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
};

export default FormLoading;
