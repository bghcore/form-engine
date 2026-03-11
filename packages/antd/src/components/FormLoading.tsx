import { FormConstants } from "@formosaic/core";
import { Skeleton } from "antd";
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
      className={`fe-form-loading ${inPanel ? "fe-form-loading--panel" : ""}`}
      role="status"
      aria-label="Loading form"
    >
      {[...Array(count)].map((_, i) => (
        <div key={`fe-loading-${i}`} style={{ marginBottom: 16 }}>
          {!hideTitleShimmer && (
            <Skeleton.Input active size="small" style={{ width: "33%", marginBottom: 8 }} />
          )}
          <Skeleton.Input active style={{ width: "100%" }} />
        </div>
      ))}
    </div>
  );
};

export default FormLoading;
