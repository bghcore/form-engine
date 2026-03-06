import { describe, it, expect } from "vitest";
import { resolveRefs } from "../../../utils/rjsf/refResolver";

describe("resolveRefs", () => {
  it("should return schema unchanged when no $ref present", () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
      },
    };
    expect(resolveRefs(schema)).toEqual(schema);
  });

  it("should resolve a simple $ref to definitions", () => {
    const schema = {
      type: "object",
      definitions: {
        Name: { type: "string", title: "Name" },
      },
      properties: {
        name: { $ref: "#/definitions/Name" },
      },
    };
    const result = resolveRefs(schema);
    expect(result.properties!.name).toEqual({ type: "string", title: "Name" });
    expect(result.definitions).toBeUndefined();
  });

  it("should resolve $ref to $defs (draft-2019+)", () => {
    const schema = {
      type: "object",
      $defs: {
        Email: { type: "string", format: "email" },
      },
      properties: {
        email: { $ref: "#/$defs/Email" },
      },
    };
    const result = resolveRefs(schema);
    expect(result.properties!.email).toEqual({
      type: "string",
      format: "email",
    });
    expect(result.$defs).toBeUndefined();
  });

  it("should merge sibling properties with $ref", () => {
    const schema = {
      type: "object",
      definitions: {
        Address: { type: "string", title: "Default Address" },
      },
      properties: {
        home: { $ref: "#/definitions/Address", title: "Home Address" },
      },
    };
    const result = resolveRefs(schema);
    expect(result.properties!.home.title).toBe("Home Address");
    expect(result.properties!.home.type).toBe("string");
  });

  it("should resolve nested $ref chains", () => {
    const schema = {
      type: "object",
      definitions: {
        StringType: { type: "string" },
        Name: { $ref: "#/definitions/StringType", title: "Name" },
      },
      properties: {
        name: { $ref: "#/definitions/Name" },
      },
    };
    const result = resolveRefs(schema);
    expect(result.properties!.name).toEqual({ type: "string", title: "Name" });
  });

  it("should handle circular $ref by falling back to string", () => {
    const schema = {
      type: "object",
      definitions: {
        Tree: {
          type: "object",
          properties: {
            value: { type: "string" },
            child: { $ref: "#/definitions/Tree" },
          },
        },
      },
      properties: {
        root: { $ref: "#/definitions/Tree" },
      },
    };
    const result = resolveRefs(schema);
    // The child should be resolved as { type: "string" } due to cycle
    expect(result.properties!.root.properties!.child).toEqual({
      type: "string",
    });
    expect(result.properties!.root.properties!.value).toEqual({
      type: "string",
    });
  });

  it("should resolve $ref inside allOf", () => {
    const schema = {
      type: "object",
      definitions: {
        Base: {
          type: "object",
          properties: { id: { type: "string" } },
        },
      },
      allOf: [{ $ref: "#/definitions/Base" }],
    };
    const result = resolveRefs(schema);
    expect(result.allOf![0]).toEqual({
      type: "object",
      properties: { id: { type: "string" } },
    });
  });

  it("should resolve $ref inside oneOf", () => {
    const schema = {
      definitions: {
        Opt: { type: "string", title: "Option" },
      },
      oneOf: [{ $ref: "#/definitions/Opt" }],
    };
    const result = resolveRefs(schema);
    expect(result.oneOf![0]).toEqual({ type: "string", title: "Option" });
  });

  it("should resolve $ref inside if/then/else", () => {
    const schema = {
      definitions: {
        HasName: {
          properties: { name: { minLength: 1 } },
        },
        NameFields: {
          properties: { nickname: { type: "string" } },
        },
      },
      if: { $ref: "#/definitions/HasName" },
      then: { $ref: "#/definitions/NameFields" },
    };
    const result = resolveRefs(schema);
    expect(result.if).toEqual({ properties: { name: { minLength: 1 } } });
    expect(result.then).toEqual({
      properties: { nickname: { type: "string" } },
    });
  });

  it("should resolve $ref inside dependencies", () => {
    const schema = {
      definitions: {
        Extra: {
          properties: { extra: { type: "string" } },
          required: ["extra"],
        },
      },
      dependencies: {
        name: { $ref: "#/definitions/Extra" },
      },
    };
    const result = resolveRefs(schema);
    expect(result.dependencies!.name).toEqual({
      properties: { extra: { type: "string" } },
      required: ["extra"],
    });
  });

  it("should handle unknown $ref path gracefully", () => {
    const schema = {
      properties: {
        unknown: { $ref: "#/definitions/DoesNotExist" },
      },
    };
    const result = resolveRefs(schema);
    expect(result.properties!.unknown).toEqual({ type: "string" });
  });

  it("should strip definitions and $defs from output", () => {
    const schema = {
      type: "object",
      definitions: { A: { type: "string" } },
      $defs: { B: { type: "number" } },
      properties: { x: { type: "string" } },
    };
    const result = resolveRefs(schema);
    expect(result.definitions).toBeUndefined();
    expect(result.$defs).toBeUndefined();
    expect(result.properties!.x).toEqual({ type: "string" });
  });
});
