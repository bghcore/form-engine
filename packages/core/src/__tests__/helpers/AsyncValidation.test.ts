import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  registerAsyncValidations,
  getAsyncValidation,
  getAsyncValidationRegistry,
  AsyncValidationFunction,
} from "../../helpers/ValidationRegistry";
import { CheckAsyncFieldValidationRules } from "../../helpers/HookInlineFormHelper";

describe("Async Validation", () => {
  describe("registerAsyncValidations", () => {
    it("registers async validators", () => {
      const asyncFn: AsyncValidationFunction = async (value) =>
        value === "bad" ? "Async error" : undefined;

      registerAsyncValidations({ AsyncCustomValidator: asyncFn });

      const retrieved = getAsyncValidation("AsyncCustomValidator");
      expect(retrieved).toBeDefined();
      expect(retrieved).toBe(asyncFn);
    });
  });

  describe("getAsyncValidation", () => {
    it("returns registered function", async () => {
      const asyncFn: AsyncValidationFunction = async (value) =>
        value === "invalid" ? "Invalid value" : undefined;

      registerAsyncValidations({ AsyncGetTest: asyncFn });

      const retrieved = getAsyncValidation("AsyncGetTest");
      expect(retrieved).toBeDefined();
      expect(await retrieved!("invalid")).toBe("Invalid value");
      expect(await retrieved!("valid")).toBeUndefined();
    });

    it("returns undefined for unknown", () => {
      const result = getAsyncValidation("NonExistentAsyncValidator");
      expect(result).toBeUndefined();
    });
  });

  describe("getAsyncValidationRegistry", () => {
    it("returns all registered async validators", () => {
      const asyncFn1: AsyncValidationFunction = async () => undefined;
      const asyncFn2: AsyncValidationFunction = async () => undefined;

      registerAsyncValidations({
        AsyncRegistryTest1: asyncFn1,
        AsyncRegistryTest2: asyncFn2,
      });

      const registry = getAsyncValidationRegistry();
      expect(registry).toHaveProperty("AsyncRegistryTest1");
      expect(registry).toHaveProperty("AsyncRegistryTest2");
    });

    it("returns a copy (mutating it does not affect the internal registry)", () => {
      const asyncFn: AsyncValidationFunction = async () => "original";
      registerAsyncValidations({ AsyncCopyTest: asyncFn });

      const registry = getAsyncValidationRegistry();
      registry["AsyncCopyTest"] = (async () => "hacked") as AsyncValidationFunction;

      const fresh = getAsyncValidation("AsyncCopyTest");
      expect(fresh).toBe(asyncFn);
    });
  });

  describe("CheckAsyncFieldValidationRules", () => {
    it("runs async validators in sequence", async () => {
      const callOrder: string[] = [];

      const asyncFn1: AsyncValidationFunction = async () => {
        callOrder.push("first");
        return undefined;
      };
      const asyncFn2: AsyncValidationFunction = async () => {
        callOrder.push("second");
        return undefined;
      };

      registerAsyncValidations({
        AsyncSequence1: asyncFn1,
        AsyncSequence2: asyncFn2,
      });

      await CheckAsyncFieldValidationRules(
        "test",
        { field1: "test" },
        ["AsyncSequence1", "AsyncSequence2"]
      );

      expect(callOrder).toEqual(["first", "second"]);
    });

    it("returns first error found", async () => {
      const asyncFn1: AsyncValidationFunction = async () => "First error";
      const asyncFn2: AsyncValidationFunction = async () => "Second error";

      registerAsyncValidations({
        AsyncFirstError1: asyncFn1,
        AsyncFirstError2: asyncFn2,
      });

      const result = await CheckAsyncFieldValidationRules(
        "test",
        { field1: "test" },
        ["AsyncFirstError1", "AsyncFirstError2"]
      );

      expect(result).toBe("First error");
    });

    it("respects AbortSignal cancellation", async () => {
      const controller = new AbortController();
      const asyncFn: AsyncValidationFunction = async () => "Should not reach";

      registerAsyncValidations({ AsyncAbortTest: asyncFn });

      // Abort before calling
      controller.abort();

      const result = await CheckAsyncFieldValidationRules(
        "test",
        { field1: "test" },
        ["AsyncAbortTest"],
        controller.signal
      );

      expect(result).toBeUndefined();
    });

    it("respects AbortSignal cancellation between validators", async () => {
      const controller = new AbortController();
      const callOrder: string[] = [];

      const asyncFn1: AsyncValidationFunction = async () => {
        callOrder.push("first");
        controller.abort(); // Abort after first validator runs
        return undefined;
      };
      const asyncFn2: AsyncValidationFunction = async () => {
        callOrder.push("second");
        return "Error from second";
      };

      registerAsyncValidations({
        AsyncAbortBetween1: asyncFn1,
        AsyncAbortBetween2: asyncFn2,
      });

      const result = await CheckAsyncFieldValidationRules(
        "test",
        { field1: "test" },
        ["AsyncAbortBetween1", "AsyncAbortBetween2"],
        controller.signal
      );

      expect(result).toBeUndefined();
      expect(callOrder).toEqual(["first"]);
    });

    it("returns undefined when all pass", async () => {
      const asyncFn1: AsyncValidationFunction = async () => undefined;
      const asyncFn2: AsyncValidationFunction = async () => undefined;

      registerAsyncValidations({
        AsyncAllPass1: asyncFn1,
        AsyncAllPass2: asyncFn2,
      });

      const result = await CheckAsyncFieldValidationRules(
        "test",
        { field1: "test" },
        ["AsyncAllPass1", "AsyncAllPass2"]
      );

      expect(result).toBeUndefined();
    });

    it("skips unknown validator names", async () => {
      const asyncFn: AsyncValidationFunction = async () => undefined;

      registerAsyncValidations({ AsyncSkipUnknown: asyncFn });

      const result = await CheckAsyncFieldValidationRules(
        "test",
        { field1: "test" },
        ["NonExistentValidator", "AsyncSkipUnknown"]
      );

      expect(result).toBeUndefined();
    });

    it("passes value, entityData, and signal to the validator", async () => {
      const spyFn = vi.fn<AsyncValidationFunction>().mockResolvedValue(undefined);
      registerAsyncValidations({ AsyncSpyTest: spyFn });

      const entityData = { field1: "test" };
      const controller = new AbortController();

      await CheckAsyncFieldValidationRules(
        "myValue",
        entityData,
        ["AsyncSpyTest"],
        controller.signal
      );

      expect(spyFn).toHaveBeenCalledWith("myValue", entityData, controller.signal);
    });
  });
});
