import { runAdapterContractTests, TIER_1_FIELDS } from "@formosaic/core/testing";
import { createAntdFieldRegistry } from "../registry";

runAdapterContractTests(createAntdFieldRegistry, {
  suiteName: "Ant Design",
  onlyTypes: [...TIER_1_FIELDS, "Rating", "Autocomplete", "DateTime", "DateRange", "PhoneInput", "FileUpload", "ColorPicker", "MultiSelectSearch", "StatusDropdown", "ReadOnlyArray", "ReadOnlyDateTime", "ReadOnlyRichText", "ReadOnlyWithButton"],
});
