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
      className={`bw-form-loading ${inPanel ? "bw-form-loading--panel" : ""}`}
      data-field-type="FormLoading"
      role="status"
      aria-label="Loading form"
    >
      {[...Array(count)].map((_, i) => (
        <div key={`bw-loading-${i}`} className="bw-form-loading__field">
          {!hideTitleShimmer && (
            <div className="bw-skeleton bw-skeleton--label" style={{ width: "33%" }} />
          )}
          <div className="bw-skeleton bw-skeleton--input" style={{ height: `${height}px` }} />
        </div>
      ))}
    </div>
  );
};

export default FormLoading;
