import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getValueFunction,
  registerValueFunctions,
  executeValueFunction,
  ValueFunction,
} from "../../helpers/ValueFunctionRegistry";

describe("ValueFunctionRegistry", () => {
  describe("default value functions are registered", () => {
    it.each([
      "setDate",
      "setDateIfNull",
      "setLoggedInUser",
      "inheritFromParent",
    ])("getValueFunction('%s') returns a function", (name) => {
      const fn = getValueFunction(name);
      expect(fn).toBeDefined();
      expect(typeof fn).toBe("function");
    });
  });

  describe("getValueFunction returns undefined for unknown name", () => {
    it("returns undefined for a name that was never registered", () => {
      expect(getValueFunction("nonExistentFunction")).toBeUndefined();
    });
  });

  describe("setDate", () => {
    it("returns a Date object", () => {
      const fn = getValueFunction("setDate")!;
      const before = new Date();
      const result = fn({ fieldName: "createdDate" });
      const after = new Date();

      expect(result).toBeInstanceOf(Date);
      expect((result as Date).getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect((result as Date).getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("setDateIfNull", () => {
    it("returns the existing value when fieldValue is present (truthy)", () => {
      const fn = getValueFunction("setDateIfNull")!;
      const existing = new Date(2020, 0, 1);
      const result = fn({ fieldName: "modifiedDate", fieldValue: existing });
      expect(result).toBe(existing);
    });

    it("returns the existing string value when fieldValue is a non-empty string", () => {
      const fn = getValueFunction("setDateIfNull")!;
      const result = fn({ fieldName: "modifiedDate", fieldValue: "2020-01-01" });
      expect(result).toBe("2020-01-01");
    });

    it("returns a new Date when fieldValue is null", () => {
      const fn = getValueFunction("setDateIfNull")!;
      const before = new Date();
      const result = fn({ fieldName: "modifiedDate", fieldValue: null });
      const after = new Date();

      expect(result).toBeInstanceOf(Date);
      expect((result as Date).getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect((result as Date).getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("returns a new Date when fieldValue is undefined", () => {
      const fn = getValueFunction("setDateIfNull")!;
      const result = fn({ fieldName: "modifiedDate", fieldValue: undefined });
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe("setLoggedInUser", () => {
    it("returns {id: userId} when currentUserId is provided", () => {
      const fn = getValueFunction("setLoggedInUser")!;
      const result = fn({ fieldName: "owner", currentUserId: "user-123" });
      expect(result).toEqual({ id: "user-123" });
    });

    it("returns undefined when currentUserId is not provided", () => {
      const fn = getValueFunction("setLoggedInUser")!;
      const result = fn({ fieldName: "owner" });
      expect(result).toBeUndefined();
    });

    it("returns undefined when currentUserId is empty string", () => {
      const fn = getValueFunction("setLoggedInUser")!;
      const result = fn({ fieldName: "owner", currentUserId: "" });
      // Empty string is falsy, so should return undefined
      expect(result).toBeUndefined();
    });
  });

  describe("inheritFromParent", () => {
    it("returns the parent entity value for the given field name", () => {
      const fn = getValueFunction("inheritFromParent")!;
      const parentEntity = { region: "East", country: "US" };
      const result = fn({ fieldName: "region", parentEntity });
      expect(result).toBe("East");
    });

    it("returns undefined when parentEntity is not provided", () => {
      const fn = getValueFunction("inheritFromParent")!;
      const result = fn({ fieldName: "region" });
      expect(result).toBeUndefined();
    });

    it("returns undefined when the field does not exist on the parent", () => {
      const fn = getValueFunction("inheritFromParent")!;
      const parentEntity = { country: "US" };
      const result = fn({ fieldName: "nonExistent", parentEntity });
      expect(result).toBeUndefined();
    });
  });

  describe("registerValueFunctions", () => {
    it("adds custom value functions that can be retrieved", () => {
      const customFn: ValueFunction = ({ fieldValue }) =>
        fieldValue ? `processed-${fieldValue}` : "default";

      registerValueFunctions({ customProcessor: customFn });

      const retrieved = getValueFunction("customProcessor");
      expect(retrieved).toBe(customFn);
      expect(retrieved!({ fieldName: "test", fieldValue: "input" })).toBe("processed-input");
      expect(retrieved!({ fieldName: "test" })).toBe("default");
    });

    it("can override a default value function", () => {
      const overrideFn: ValueFunction = () => "overridden";

      registerValueFunctions({ setDate: overrideFn });

      const retrieved = getValueFunction("setDate");
      expect(retrieved).toBe(overrideFn);
      expect(retrieved!({ fieldName: "test" })).toBe("overridden");
    });

    it("preserves previously registered functions when adding new ones", () => {
      registerValueFunctions({ anotherCustom: () => "another" });
      // customProcessor registered in previous test should still exist
      expect(getValueFunction("customProcessor")).toBeDefined();
      expect(getValueFunction("anotherCustom")).toBeDefined();
    });
  });

  describe("executeValueFunction", () => {
    it("calls the right function with the correct arguments", () => {
      const spyFn = vi.fn(({ fieldName, fieldValue, parentEntity, currentUserId }) => {
        return `${fieldName}-${fieldValue}-${currentUserId}`;
      });

      registerValueFunctions({ spyFunction: spyFn });

      const result = executeValueFunction(
        "myField",
        "spyFunction",
        "myValue",
        { parentKey: "parentVal" },
        "user-42"
      );

      expect(spyFn).toHaveBeenCalledTimes(1);
      expect(spyFn).toHaveBeenCalledWith({
        fieldName: "myField",
        fieldValue: "myValue",
        parentEntity: { parentKey: "parentVal" },
        currentUserId: "user-42",
      });
      expect(result).toBe("myField-myValue-user-42");
    });

    it("returns undefined for an unknown value function name", () => {
      const result = executeValueFunction("field", "unknownFunction");
      expect(result).toBeUndefined();
    });

    it("passes undefined for optional parameters when not provided", () => {
      const spyFn = vi.fn(() => "result");
      registerValueFunctions({ optionalParamsFn: spyFn });

      executeValueFunction("field", "optionalParamsFn");

      expect(spyFn).toHaveBeenCalledWith({
        fieldName: "field",
        fieldValue: undefined,
        parentEntity: undefined,
        currentUserId: undefined,
      });
    });
  });
});
