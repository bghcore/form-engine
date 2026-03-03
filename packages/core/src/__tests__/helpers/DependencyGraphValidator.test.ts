import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  detectDependencyCycles,
  detectOrderDependencyCycles,
  validateDependencyGraph,
} from "../../helpers/DependencyGraphValidator";
import { Dictionary } from "../../utils";
import { IBusinessRule } from "../../types/IBusinessRule";
import { OrderDependencyMap } from "../../types/IOrderDependencies";

describe("DependencyGraphValidator", () => {
  describe("detectDependencyCycles", () => {
    it("returns empty array for acyclic dependency graph", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        fieldA: {
          dependentFields: ["fieldB"],
          dependsOnFields: [],
          comboDependentFields: [],
          comboDependsOnFields: [],
        },
        fieldB: {
          dependentFields: ["fieldC"],
          dependsOnFields: ["fieldA"],
          comboDependentFields: [],
          comboDependsOnFields: [],
        },
        fieldC: {
          dependentFields: [],
          dependsOnFields: ["fieldB"],
          comboDependentFields: [],
          comboDependsOnFields: [],
        },
      };

      const errors = detectDependencyCycles(fieldRules);
      expect(errors).toHaveLength(0);
    });

    it("detects a simple two-node cycle", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        fieldA: {
          dependentFields: ["fieldB"],
          dependsOnFields: ["fieldB"],
          comboDependentFields: [],
          comboDependsOnFields: [],
        },
        fieldB: {
          dependentFields: ["fieldA"],
          dependsOnFields: ["fieldA"],
          comboDependentFields: [],
          comboDependsOnFields: [],
        },
      };

      const errors = detectDependencyCycles(fieldRules);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].type).toBe("dependency");
      expect(errors[0].fields).toContain("fieldA");
      expect(errors[0].fields).toContain("fieldB");
    });

    it("detects a three-node cycle", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        fieldA: {
          dependentFields: ["fieldB"],
          dependsOnFields: ["fieldC"],
          comboDependentFields: [],
          comboDependsOnFields: [],
        },
        fieldB: {
          dependentFields: ["fieldC"],
          dependsOnFields: ["fieldA"],
          comboDependentFields: [],
          comboDependsOnFields: [],
        },
        fieldC: {
          dependentFields: ["fieldA"],
          dependsOnFields: ["fieldB"],
          comboDependentFields: [],
          comboDependsOnFields: [],
        },
      };

      const errors = detectDependencyCycles(fieldRules);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].fields).toHaveLength(3);
    });

    it("returns empty array for fields with no dependencies", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        fieldA: {
          dependentFields: [],
          dependsOnFields: [],
          comboDependentFields: [],
          comboDependsOnFields: [],
        },
        fieldB: {
          dependentFields: [],
          dependsOnFields: [],
          comboDependentFields: [],
          comboDependsOnFields: [],
        },
      };

      const errors = detectDependencyCycles(fieldRules);
      expect(errors).toHaveLength(0);
    });

    it("ignores dependent fields that don't exist in the rules", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        fieldA: {
          dependentFields: ["nonExistent"],
          dependsOnFields: [],
          comboDependentFields: [],
          comboDependsOnFields: [],
        },
      };

      const errors = detectDependencyCycles(fieldRules);
      expect(errors).toHaveLength(0);
    });

    it("detects combo dependency cycles", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        fieldA: {
          dependentFields: [],
          dependsOnFields: [],
          comboDependentFields: ["fieldB"],
          comboDependsOnFields: ["fieldB"],
        },
        fieldB: {
          dependentFields: [],
          dependsOnFields: [],
          comboDependentFields: ["fieldA"],
          comboDependsOnFields: ["fieldA"],
        },
      };

      const errors = detectDependencyCycles(fieldRules);
      expect(errors.length).toBeGreaterThan(0);
      const comboError = errors.find(e => e.message.includes("combo"));
      expect(comboError).toBeDefined();
    });

    it("handles empty fieldRules", () => {
      const errors = detectDependencyCycles({});
      expect(errors).toHaveLength(0);
    });

    it("handles missing dependentFields arrays gracefully", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        fieldA: { component: "Textbox" },
        fieldB: { component: "Textbox" },
      };

      const errors = detectDependencyCycles(fieldRules);
      expect(errors).toHaveLength(0);
    });
  });

  describe("detectOrderDependencyCycles", () => {
    it("returns empty array for simple array order deps", () => {
      const orderDeps: OrderDependencyMap = {
        value1: ["fieldA", "fieldB", "fieldC"],
        value2: ["fieldC", "fieldB", "fieldA"],
      };

      const errors = detectOrderDependencyCycles(orderDeps, "rootField");
      expect(errors).toHaveLength(0);
    });

    it("returns empty for nested but acyclic order deps", () => {
      const orderDeps: OrderDependencyMap = {
        A: {
          subField: {
            A1: ["f1", "f2"],
            A2: ["f2", "f1"],
          },
        },
        B: ["f1", "f2"],
      };

      const errors = detectOrderDependencyCycles(orderDeps, "rootField");
      expect(errors).toHaveLength(0);
    });

    it("handles empty order deps", () => {
      const errors = detectOrderDependencyCycles({}, "rootField");
      expect(errors).toHaveLength(0);
    });
  });

  describe("validateDependencyGraph", () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it("logs warnings for cycles in dev mode", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        fieldA: {
          dependentFields: ["fieldB"],
          dependsOnFields: ["fieldB"],
          comboDependentFields: [],
          comboDependsOnFields: [],
        },
        fieldB: {
          dependentFields: ["fieldA"],
          dependsOnFields: ["fieldA"],
          comboDependentFields: [],
          comboDependsOnFields: [],
        },
      };

      const errors = validateDependencyGraph(fieldRules);
      expect(errors.length).toBeGreaterThan(0);
      expect(warnSpy).toHaveBeenCalled();
      expect(warnSpy.mock.calls[0][0]).toContain("[dynamic-forms]");
    });

    it("returns empty for valid dependency graph", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        fieldA: {
          dependentFields: ["fieldB"],
          dependsOnFields: [],
          comboDependentFields: [],
          comboDependsOnFields: [],
        },
        fieldB: {
          dependentFields: [],
          dependsOnFields: ["fieldA"],
          comboDependentFields: [],
          comboDependsOnFields: [],
        },
      };

      const errors = validateDependencyGraph(fieldRules);
      expect(errors).toHaveLength(0);
    });

    it("detects self-referencing order dependency", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        fieldA: {
          dependentFields: [],
          dependsOnFields: [],
          comboDependentFields: [],
          comboDependsOnFields: [],
          pivotalRootField: "fieldA",
          orderDependentFields: ["fieldA"],
        },
      };

      const errors = validateDependencyGraph(fieldRules);
      expect(errors.length).toBeGreaterThan(0);
      const orderError = errors.find(e => e.type === "order");
      expect(orderError).toBeDefined();
      expect(orderError!.message).toContain("self-referencing");
    });
  });
});
