import { runAdapterContractTests, TIER_1_FIELDS } from "@form-eng/core/testing";
import { createAntdFieldRegistry } from "../registry";

runAdapterContractTests(createAntdFieldRegistry, {
  suiteName: "Ant Design",
  onlyTypes: [...TIER_1_FIELDS],
});
