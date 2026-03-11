/**
 * Testing utilities subpath export.
 *
 * Import as: import { ... } from "@formosaic/core/testing"
 *
 * Provides contract test infrastructure for adapter packages to validate
 * their field registries conform to the adapter contract.
 *
 * NOTE: This module imports from vitest and @testing-library/react.
 * It should only be imported in test files where these dependencies are available.
 */

/// <reference types="vitest" />

export {
  runAdapterContractTests,
  TIER_1_FIELDS,
  ALL_FIELD_TYPES,
  VALUE_BY_TYPE,
} from "./testing/index";
export type { IContractTestOptions } from "./testing/index";
