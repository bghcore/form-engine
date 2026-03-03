import { describe, it, expect } from "vitest";
import {
  createMinLengthValidation,
  createMaxLengthValidation,
  createNumericRangeValidation,
  createPatternValidation,
  createRequiredIfValidation,
  getValidation,
} from "../../helpers/ValidationRegistry";

describe("Extended Validators", () => {
  describe("createMinLengthValidation", () => {
    const validate = createMinLengthValidation(3);

    it("returns undefined for value meeting minimum", () => {
      expect(validate("abc")).toBeUndefined();
      expect(validate("abcdef")).toBeUndefined();
    });

    it("returns error for value below minimum", () => {
      expect(validate("ab")).toBe("Must be at least 3 characters");
    });

    it("returns undefined for empty/null value", () => {
      expect(validate("")).toBeUndefined();
      expect(validate(null)).toBeUndefined();
      expect(validate(undefined)).toBeUndefined();
    });

    it("returns undefined for non-string value", () => {
      expect(validate(42)).toBeUndefined();
    });
  });

  describe("createMaxLengthValidation", () => {
    const validate = createMaxLengthValidation(5);

    it("returns undefined for value within limit", () => {
      expect(validate("abc")).toBeUndefined();
      expect(validate("abcde")).toBeUndefined();
    });

    it("returns error for value exceeding limit", () => {
      expect(validate("abcdef")).toBe("Must be at most 5 characters");
    });

    it("returns undefined for empty/null value", () => {
      expect(validate("")).toBeUndefined();
      expect(validate(null)).toBeUndefined();
    });
  });

  describe("createNumericRangeValidation", () => {
    const validate = createNumericRangeValidation(1, 100);

    it("returns undefined for value in range", () => {
      expect(validate(50)).toBeUndefined();
      expect(validate(1)).toBeUndefined();
      expect(validate(100)).toBeUndefined();
      expect(validate("50")).toBeUndefined();
    });

    it("returns error for value out of range", () => {
      expect(validate(0)).toBe("Must be between 1 and 100");
      expect(validate(101)).toBe("Must be between 1 and 100");
      expect(validate(-5)).toBe("Must be between 1 and 100");
    });

    it("returns error for non-numeric string", () => {
      expect(validate("abc")).toBe("Must be a number");
    });

    it("returns undefined for null/empty value", () => {
      expect(validate(null)).toBeUndefined();
      expect(validate("")).toBeUndefined();
      expect(validate(undefined)).toBeUndefined();
    });
  });

  describe("createPatternValidation", () => {
    const validate = createPatternValidation(/^[A-Z]{3}$/, "Must be 3 uppercase letters");

    it("returns undefined when pattern matches", () => {
      expect(validate("ABC")).toBeUndefined();
      expect(validate("XYZ")).toBeUndefined();
    });

    it("returns error message when pattern does not match", () => {
      expect(validate("abc")).toBe("Must be 3 uppercase letters");
      expect(validate("AB")).toBe("Must be 3 uppercase letters");
      expect(validate("ABCD")).toBe("Must be 3 uppercase letters");
    });

    it("returns undefined for empty/null value", () => {
      expect(validate("")).toBeUndefined();
      expect(validate(null)).toBeUndefined();
    });
  });

  describe("createRequiredIfValidation", () => {
    const validate = createRequiredIfValidation("status", ["Active"]);

    it("returns error when condition is met and value is empty", () => {
      expect(validate("", { status: "Active" })).toBe("This field is required");
      expect(validate(null, { status: "Active" })).toBe("This field is required");
    });

    it("returns undefined when condition is met and value is provided", () => {
      expect(validate("something", { status: "Active" })).toBeUndefined();
    });

    it("returns undefined when condition is not met", () => {
      expect(validate("", { status: "Inactive" })).toBeUndefined();
      expect(validate(null, { status: "Closed" })).toBeUndefined();
    });

    it("returns undefined when entityData is not provided", () => {
      expect(validate("")).toBeUndefined();
    });

    it("supports multiple dependent values", () => {
      const validateMulti = createRequiredIfValidation("type", ["Bug", "Issue"]);
      expect(validateMulti("", { type: "Bug" })).toBe("This field is required");
      expect(validateMulti("", { type: "Issue" })).toBe("This field is required");
      expect(validateMulti("", { type: "Feature" })).toBeUndefined();
    });
  });

  describe("Default registry entries", () => {
    it("includes NoSpecialCharactersValidation", () => {
      const validate = getValidation("NoSpecialCharactersValidation");
      expect(validate).toBeDefined();
      expect(validate!("abc123")).toBeUndefined();
      expect(validate!("abc-def_ghi.jkl")).toBeUndefined();
      expect(validate!("abc@def")).toBe("Special characters are not allowed");
      expect(validate!("abc#$%")).toBe("Special characters are not allowed");
    });

    it("includes CurrencyValidation", () => {
      const validate = getValidation("CurrencyValidation");
      expect(validate).toBeDefined();
      expect(validate!("100")).toBeUndefined();
      expect(validate!("100.50")).toBeUndefined();
      expect(validate!("-50.25")).toBeUndefined();
      expect(validate!("100.123")).toBe("Invalid currency format");
      expect(validate!("abc")).toBe("Invalid currency format");
    });

    it("includes UniqueInArrayValidation", () => {
      const validate = getValidation("UniqueInArrayValidation");
      expect(validate).toBeDefined();
      expect(validate!(["a", "b", "c"])).toBeUndefined();
      expect(validate!(["a", "b", "a"])).toBe("Duplicate value: a");
      expect(validate!(null)).toBeUndefined();
      expect(validate!("not-array")).toBeUndefined();
    });
  });
});
