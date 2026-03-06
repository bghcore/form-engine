import { describe, it, expect } from "vitest";
import {
  schemaToCondition,
  convertDependencies,
  convertIfThenElse,
  convertComposition,
} from "../../../utils/rjsf/ruleConverter";
import { IFieldConfig } from "../../../types/IFieldConfig";

describe("schemaToCondition", () => {
  it("should convert const property to equals condition", () => {
    const result = schemaToCondition({
      properties: { status: { const: "active" } },
    });
    expect(result).toEqual({
      field: "status",
      operator: "equals",
      value: "active",
    });
  });

  it("should convert enum property to in condition", () => {
    const result = schemaToCondition({
      properties: { color: { enum: ["red", "blue"] } },
    });
    expect(result).toEqual({
      field: "color",
      operator: "in",
      value: ["red", "blue"],
    });
  });

  it("should convert minimum to greaterThanOrEqual", () => {
    const result = schemaToCondition({
      properties: { age: { minimum: 18 } },
    });
    expect(result).toEqual({
      field: "age",
      operator: "greaterThanOrEqual",
      value: 18,
    });
  });

  it("should convert maximum to lessThanOrEqual", () => {
    const result = schemaToCondition({
      properties: { score: { maximum: 100 } },
    });
    expect(result).toEqual({
      field: "score",
      operator: "lessThanOrEqual",
      value: 100,
    });
  });

  it("should convert minLength > 0 to isNotEmpty", () => {
    const result = schemaToCondition({
      properties: { name: { minLength: 1 } },
    });
    expect(result).toEqual({ field: "name", operator: "isNotEmpty" });
  });

  it("should convert pattern to matches", () => {
    const result = schemaToCondition({
      properties: { code: { pattern: "^[A-Z]{3}$" } },
    });
    expect(result).toEqual({
      field: "code",
      operator: "matches",
      value: "^[A-Z]{3}$",
    });
  });

  it("should convert required without properties to isNotEmpty", () => {
    const result = schemaToCondition({ required: ["name"] });
    expect(result).toEqual({ field: "name", operator: "isNotEmpty" });
  });

  it("should convert multiple required to AND condition", () => {
    const result = schemaToCondition({ required: ["name", "email"] });
    expect(result).toEqual({
      operator: "and",
      conditions: [
        { field: "name", operator: "isNotEmpty" },
        { field: "email", operator: "isNotEmpty" },
      ],
    });
  });

  it("should convert multiple properties to AND condition", () => {
    const result = schemaToCondition({
      properties: {
        type: { const: "premium" },
        age: { minimum: 18 },
      },
    });
    expect(result).toEqual({
      operator: "and",
      conditions: [
        { field: "type", operator: "equals", value: "premium" },
        { field: "age", operator: "greaterThanOrEqual", value: 18 },
      ],
    });
  });

  it("should convert allOf to AND", () => {
    const result = schemaToCondition({
      allOf: [
        { properties: { a: { const: 1 } } },
        { properties: { b: { const: 2 } } },
      ],
    });
    expect(result).toEqual({
      operator: "and",
      conditions: [
        { field: "a", operator: "equals", value: 1 },
        { field: "b", operator: "equals", value: 2 },
      ],
    });
  });

  it("should convert anyOf to OR", () => {
    const result = schemaToCondition({
      anyOf: [
        { properties: { a: { const: 1 } } },
        { properties: { b: { const: 2 } } },
      ],
    });
    expect(result).toEqual({
      operator: "or",
      conditions: [
        { field: "a", operator: "equals", value: 1 },
        { field: "b", operator: "equals", value: 2 },
      ],
    });
  });

  it("should convert not to NOT", () => {
    const result = schemaToCondition({
      not: { properties: { active: { const: false } } },
    });
    expect(result).toEqual({
      operator: "not",
      conditions: [
        { field: "active", operator: "equals", value: false },
      ],
    });
  });

  it("should return null for empty schema", () => {
    expect(schemaToCondition({})).toBeNull();
  });

  it("should unwrap single-item allOf", () => {
    const result = schemaToCondition({
      allOf: [{ properties: { a: { const: 1 } } }],
    });
    expect(result).toEqual({ field: "a", operator: "equals", value: 1 });
  });

  it("should handle required alongside properties", () => {
    const result = schemaToCondition({
      properties: { type: { const: "premium" } },
      required: ["name"],
    });
    expect(result).toEqual({
      operator: "and",
      conditions: [
        { field: "type", operator: "equals", value: "premium" },
        { field: "name", operator: "isNotEmpty" },
      ],
    });
  });
});

describe("convertDependencies", () => {
  it("should convert property dependencies to required rules", () => {
    const fields: Record<string, IFieldConfig> = {
      credit_card: { type: "Textbox", label: "Card" },
      billing_address: { type: "Textbox", label: "Address" },
    };

    convertDependencies(
      { credit_card: ["billing_address"] },
      fields,
      {},
      "test"
    );

    expect(fields.billing_address.rules).toHaveLength(1);
    const rule = fields.billing_address.rules![0];
    expect(rule.when).toEqual({
      field: "credit_card",
      operator: "isNotEmpty",
    });
    expect(rule.then).toEqual({ required: true });
    expect(rule.else).toEqual({ required: false });
  });

  it("should convert schema dependencies to visibility rules", () => {
    const fields: Record<string, IFieldConfig> = {
      credit_card: { type: "Textbox", label: "Card" },
    };

    convertDependencies(
      {
        credit_card: {
          properties: {
            billing_address: { type: "string", title: "Address" },
          },
          required: ["billing_address"],
        },
      },
      fields,
      {},
      "test"
    );

    expect(fields.billing_address).toBeDefined();
    expect(fields.billing_address.hidden).toBe(true);
    expect(fields.billing_address.rules).toHaveLength(1);
    const rule = fields.billing_address.rules![0];
    expect(rule.then).toEqual({ hidden: false, required: true });
    expect(rule.else).toEqual({ hidden: true });
  });

  it("should skip unknown dependent fields in property dependencies", () => {
    const fields: Record<string, IFieldConfig> = {
      a: { type: "Textbox", label: "A" },
    };

    convertDependencies({ a: ["nonexistent"] }, fields, {}, "test");
    expect(Object.keys(fields)).toEqual(["a"]);
  });

  it("should handle multiple property dependencies", () => {
    const fields: Record<string, IFieldConfig> = {
      a: { type: "Textbox", label: "A" },
      b: { type: "Textbox", label: "B" },
      c: { type: "Textbox", label: "C" },
    };

    convertDependencies({ a: ["b", "c"] }, fields, {}, "test");
    expect(fields.b.rules).toHaveLength(1);
    expect(fields.c.rules).toHaveLength(1);
  });
});

describe("convertIfThenElse", () => {
  it("should convert simple if/then to visibility rules", () => {
    const fields: Record<string, IFieldConfig> = {
      type: { type: "Dropdown", label: "Type" },
    };

    convertIfThenElse(
      {
        if: { properties: { type: { const: "business" } } },
        then: {
          properties: { company: { type: "string", title: "Company" } },
          required: ["company"],
        },
      },
      fields,
      {},
      "test"
    );

    expect(fields.company).toBeDefined();
    expect(fields.company.rules).toHaveLength(1);
    const rule = fields.company.rules![0];
    expect(rule.when).toEqual({
      field: "type",
      operator: "equals",
      value: "business",
    });
    expect(rule.then).toEqual({ hidden: false, required: true });
    expect(rule.else).toEqual({ hidden: true });
  });

  it("should handle if/then/else with both branches", () => {
    const fields: Record<string, IFieldConfig> = {
      payment: { type: "Dropdown", label: "Payment" },
    };

    convertIfThenElse(
      {
        if: { properties: { payment: { const: "card" } } },
        then: {
          properties: { card_number: { type: "string" } },
        },
        else: {
          properties: { bank_account: { type: "string" } },
        },
      },
      fields,
      {},
      "test"
    );

    expect(fields.card_number).toBeDefined();
    expect(fields.bank_account).toBeDefined();
  });

  it("should handle if/then with required fields", () => {
    const fields: Record<string, IFieldConfig> = {
      age: { type: "Number", label: "Age" },
      guardian: { type: "Textbox", label: "Guardian" },
    };

    convertIfThenElse(
      {
        if: { properties: { age: { maximum: 17 } } },
        then: { required: ["guardian"] },
      },
      fields,
      {},
      "test"
    );

    expect(fields.guardian.rules).toHaveLength(1);
    expect(fields.guardian.rules![0].then).toEqual({ required: true });
  });
});

describe("convertComposition", () => {
  it("should detect discriminator in oneOf and create dropdown + rules", () => {
    const fields: Record<string, IFieldConfig> = {};

    convertComposition(
      {
        oneOf: [
          {
            properties: {
              type: { const: "person" },
              name: { type: "string" },
            },
            required: ["name"],
          },
          {
            properties: {
              type: { const: "company" },
              company_name: { type: "string" },
            },
            required: ["company_name"],
          },
        ],
      },
      fields,
      {},
      "test"
    );

    expect(fields.type).toBeDefined();
    expect(fields.type.type).toBe("Dropdown");
    expect(fields.type.options).toHaveLength(2);

    expect(fields.name).toBeDefined();
    expect(fields.name.hidden).toBe(true);
    expect(fields.name.rules).toHaveLength(1);
    expect(fields.name.rules![0].when).toEqual({
      field: "type",
      operator: "equals",
      value: "person",
    });

    expect(fields.company_name).toBeDefined();
    expect(fields.company_name.rules![0].when).toEqual({
      field: "type",
      operator: "equals",
      value: "company",
    });
  });

  it("should create synthetic _variant for oneOf without discriminator", () => {
    const fields: Record<string, IFieldConfig> = {};

    convertComposition(
      {
        oneOf: [
          {
            properties: { a: { type: "string" } },
          },
          {
            properties: { b: { type: "number" } },
          },
        ],
      },
      fields,
      {},
      "test"
    );

    expect(fields._variant).toBeDefined();
    expect(fields._variant.type).toBe("Dropdown");
    expect(fields._variant.options).toHaveLength(2);
    expect(fields.a.rules![0].when).toEqual({
      field: "_variant",
      operator: "equals",
      value: "0",
    });
  });

  it("should handle anyOf the same as oneOf", () => {
    const fields: Record<string, IFieldConfig> = {};

    convertComposition(
      {
        anyOf: [
          {
            properties: { mode: { const: "a" }, x: { type: "string" } },
          },
          {
            properties: { mode: { const: "b" }, y: { type: "string" } },
          },
        ],
      },
      fields,
      {},
      "test"
    );

    expect(fields.mode).toBeDefined();
    expect(fields.x).toBeDefined();
    expect(fields.y).toBeDefined();
  });

  it("should skip empty variants array", () => {
    const fields: Record<string, IFieldConfig> = {};
    convertComposition({ oneOf: [] }, fields, {}, "test");
    expect(Object.keys(fields)).toHaveLength(0);
  });
});
