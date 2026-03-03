import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getValidation,
  getValidationRegistry,
  registerValidations,
  ValidationFunction,
} from "../../helpers/ValidationRegistry";

describe("ValidationRegistry", () => {
  // NOTE: The registry is module-level mutable state. Tests that call
  // registerValidations() permanently modify it for subsequent tests.
  // We order tests so that "read-only" assertions come first and mutation
  // tests come last to avoid interference.

  describe("default validators are registered", () => {
    it.each([
      "EmailValidation",
      "PhoneNumberValidation",
      "YearValidation",
      "Max150KbValidation",
      "Max32KbValidation",
      "isValidUrl",
    ])("getValidation('%s') returns a function", (name) => {
      const fn = getValidation(name);
      expect(fn).toBeDefined();
      expect(typeof fn).toBe("function");
    });
  });

  describe("getValidation returns undefined for unknown name", () => {
    it("returns undefined for a name that was never registered", () => {
      expect(getValidation("NonExistentValidator")).toBeUndefined();
    });
  });

  describe("getValidationRegistry returns all registered validators", () => {
    it("contains every default validator", () => {
      const registry = getValidationRegistry();
      expect(registry).toHaveProperty("EmailValidation");
      expect(registry).toHaveProperty("PhoneNumberValidation");
      expect(registry).toHaveProperty("YearValidation");
      expect(registry).toHaveProperty("Max150KbValidation");
      expect(registry).toHaveProperty("Max32KbValidation");
      expect(registry).toHaveProperty("isValidUrl");
    });

    it("returns a copy (mutating it does not affect the internal registry)", () => {
      const registry = getValidationRegistry();
      registry["EmailValidation"] = (() => "hacked") as ValidationFunction;
      const fresh = getValidation("EmailValidation");
      // The original should still work correctly
      expect(fresh!("test@example.com")).toBeUndefined();
    });
  });

  describe("EmailValidation", () => {
    it("returns undefined for a valid email", () => {
      const fn = getValidation("EmailValidation")!;
      expect(fn("user@example.com")).toBeUndefined();
    });

    it("returns undefined for empty/null input", () => {
      const fn = getValidation("EmailValidation")!;
      expect(fn("")).toBeUndefined();
      expect(fn(null)).toBeUndefined();
      expect(fn(undefined)).toBeUndefined();
    });

    it("returns error string for invalid email", () => {
      const fn = getValidation("EmailValidation")!;
      expect(fn("not-an-email")).toBe("Invalid email address");
      expect(fn("missing@domain")).toBe("Invalid email address");
      expect(fn("@no-local.com")).toBe("Invalid email address");
    });
  });

  describe("PhoneNumberValidation", () => {
    it("returns undefined for valid phone numbers", () => {
      const fn = getValidation("PhoneNumberValidation")!;
      expect(fn("+1-555-1234")).toBeUndefined();
      expect(fn("(555) 123-4567")).toBeUndefined();
      expect(fn("5551234567")).toBeUndefined();
    });

    it("returns undefined for empty/null input", () => {
      const fn = getValidation("PhoneNumberValidation")!;
      expect(fn("")).toBeUndefined();
      expect(fn(null)).toBeUndefined();
    });

    it("returns error string for invalid phone numbers", () => {
      const fn = getValidation("PhoneNumberValidation")!;
      expect(fn("abc")).toBe("Invalid phone number");
      expect(fn("hello world")).toBe("Invalid phone number");
    });
  });

  describe("YearValidation", () => {
    it("returns undefined for valid years", () => {
      const fn = getValidation("YearValidation")!;
      expect(fn("2024")).toBeUndefined();
      expect(fn("1900")).toBeUndefined();
      expect(fn("2100")).toBeUndefined();
    });

    it("returns undefined for empty/null input", () => {
      const fn = getValidation("YearValidation")!;
      expect(fn("")).toBeUndefined();
      expect(fn(null)).toBeUndefined();
    });

    it("returns error string for invalid years", () => {
      const fn = getValidation("YearValidation")!;
      expect(fn("1899")).toBe("Invalid year");
      expect(fn("2101")).toBe("Invalid year");
      expect(fn("abcd")).toBe("Invalid year");
      expect(fn("0")).toBe("Invalid year");
    });
  });

  describe("Max150KbValidation", () => {
    it("returns undefined for content under 150KB", () => {
      const fn = getValidation("Max150KbValidation")!;
      expect(fn("short string")).toBeUndefined();
    });

    it("returns undefined for empty/null input", () => {
      const fn = getValidation("Max150KbValidation")!;
      expect(fn("")).toBeUndefined();
      expect(fn(null)).toBeUndefined();
    });

    it("returns error string for content exceeding 150KB", () => {
      const fn = getValidation("Max150KbValidation")!;
      // Create a string larger than 150KB (150,001 bytes)
      const largeString = "x".repeat(151_000);
      expect(fn(largeString)).toBe("Content exceeds maximum size of 150KB");
    });
  });

  describe("Max32KbValidation", () => {
    it("returns undefined for content under 32KB", () => {
      const fn = getValidation("Max32KbValidation")!;
      expect(fn("short")).toBeUndefined();
    });

    it("returns undefined for empty/null input", () => {
      const fn = getValidation("Max32KbValidation")!;
      expect(fn("")).toBeUndefined();
      expect(fn(null)).toBeUndefined();
    });

    it("returns error string for content exceeding 32KB", () => {
      const fn = getValidation("Max32KbValidation")!;
      const largeString = "x".repeat(33_000);
      expect(fn(largeString)).toBe("Content exceeds maximum size of 32KB");
    });
  });

  describe("isValidUrl", () => {
    it("returns undefined for valid URLs", () => {
      const fn = getValidation("isValidUrl")!;
      expect(fn("http://example.com")).toBeUndefined();
      expect(fn("https://example.com")).toBeUndefined();
      expect(fn("https://example.com/path?query=1")).toBeUndefined();
    });

    it("returns undefined for empty/null input", () => {
      const fn = getValidation("isValidUrl")!;
      expect(fn("")).toBeUndefined();
      expect(fn(null)).toBeUndefined();
    });

    it("returns error string for invalid URLs", () => {
      const fn = getValidation("isValidUrl")!;
      expect(fn("not-a-url")).toBe("Invalid URL");
      expect(fn("ftp://example.com")).toBe("Invalid URL");
      expect(fn("example.com")).toBe("Invalid URL");
    });
  });

  describe("registerValidations", () => {
    it("adds custom validators that can be retrieved", () => {
      const customFn: ValidationFunction = (value) =>
        value === "bad" ? "Custom error" : undefined;

      registerValidations({ CustomValidator: customFn });

      const retrieved = getValidation("CustomValidator");
      expect(retrieved).toBe(customFn);
      expect(retrieved!("bad")).toBe("Custom error");
      expect(retrieved!("good")).toBeUndefined();
    });

    it("can override a default validator", () => {
      const overrideFn: ValidationFunction = () => "Always invalid";

      registerValidations({ EmailValidation: overrideFn });

      const retrieved = getValidation("EmailValidation");
      expect(retrieved).toBe(overrideFn);
      expect(retrieved!("user@example.com")).toBe("Always invalid");
    });

    it("preserves previously registered validators when adding new ones", () => {
      registerValidations({ AnotherCustom: () => undefined });
      // CustomValidator was registered in a previous test — it should still exist
      expect(getValidation("CustomValidator")).toBeDefined();
      expect(getValidation("AnotherCustom")).toBeDefined();
    });

    it("shows custom validators in getValidationRegistry", () => {
      const registry = getValidationRegistry();
      expect(registry).toHaveProperty("CustomValidator");
      expect(registry).toHaveProperty("AnotherCustom");
    });
  });
});
