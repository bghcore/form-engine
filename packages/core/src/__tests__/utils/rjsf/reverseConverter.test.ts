import { describe, it, expect } from "vitest";
import { toRjsfSchema } from "../../../utils/rjsf/reverseConverter";
import { IFormConfig } from "../../../types/IFormConfig";

describe("toRjsfSchema", () => {
  it("should convert a simple IFormConfig to JSON Schema", () => {
    const config: IFormConfig = {
      version: 2,
      fields: {
        name: { type: "Textbox", label: "Name", required: true },
        age: { type: "Number", label: "Age" },
      },
    };

    const { schema, uiSchema } = toRjsfSchema(config);
    expect(schema.type).toBe("object");
    expect(schema.properties!.name.type).toBe("string");
    expect(schema.properties!.name.title).toBe("Name");
    expect(schema.properties!.age.type).toBe("number");
    expect(schema.required).toContain("name");
    expect(schema.required).not.toContain("age");
  });

  it("should convert Dropdown to enum", () => {
    const config: IFormConfig = {
      version: 2,
      fields: {
        color: {
          type: "Dropdown",
          label: "Color",
          options: [
            { value: "r", label: "Red" },
            { value: "g", label: "Green" },
          ],
        },
      },
    };

    const { schema } = toRjsfSchema(config);
    expect(schema.properties!.color.enum).toEqual(["r", "g"]);
    expect(schema.properties!.color.enumNames).toEqual(["Red", "Green"]);
  });

  it("should convert Toggle to boolean", () => {
    const config: IFormConfig = {
      version: 2,
      fields: {
        active: { type: "Toggle", label: "Active" },
      },
    };

    const { schema, uiSchema } = toRjsfSchema(config);
    expect(schema.properties!.active.type).toBe("boolean");
    expect(uiSchema.active).toBeDefined();
    expect((uiSchema.active as Record<string, string>)["ui:widget"]).toBe("checkbox");
  });

  it("should convert DateControl to string with format", () => {
    const config: IFormConfig = {
      version: 2,
      fields: {
        dob: { type: "DateControl", label: "Date of Birth" },
      },
    };

    const { schema } = toRjsfSchema(config);
    expect(schema.properties!.dob.type).toBe("string");
    expect(schema.properties!.dob.format).toBe("date");
  });

  it("should convert FieldArray to array with object items", () => {
    const config: IFormConfig = {
      version: 2,
      fields: {
        contacts: {
          type: "FieldArray",
          label: "Contacts",
          items: {
            name: { type: "Textbox", label: "Name", required: true },
            phone: { type: "Textbox", label: "Phone" },
          },
          minItems: 1,
          maxItems: 5,
        },
      },
    };

    const { schema } = toRjsfSchema(config);
    const contacts = schema.properties!.contacts;
    expect(contacts.type).toBe("array");
    expect(contacts.items).toBeDefined();
    const items = contacts.items as Record<string, unknown>;
    expect(items.type).toBe("object");
    expect((items.properties as Record<string, unknown>).name).toBeDefined();
    expect(items.required).toContain("name");
    expect(contacts.minItems).toBe(1);
    expect(contacts.maxItems).toBe(5);
  });

  it("should convert Multiselect to array with enum items", () => {
    const config: IFormConfig = {
      version: 2,
      fields: {
        tags: {
          type: "Multiselect",
          label: "Tags",
          options: [
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ],
        },
      },
    };

    const { schema } = toRjsfSchema(config);
    const tags = schema.properties!.tags;
    expect(tags.type).toBe("array");
    expect(tags.items).toBeDefined();
    const items = tags.items as Record<string, unknown>;
    expect(items.enum).toEqual(["a", "b"]);
  });

  it("should convert validation rules to schema constraints", () => {
    const config: IFormConfig = {
      version: 2,
      fields: {
        name: {
          type: "Textbox",
          label: "Name",
          validate: [
            { name: "minLength", params: { min: 2 } },
            { name: "maxLength", params: { max: 50 } },
          ],
        },
      },
    };

    const { schema } = toRjsfSchema(config);
    expect(schema.properties!.name.minLength).toBe(2);
    expect(schema.properties!.name.maxLength).toBe(50);
  });

  it("should set field order in uiSchema", () => {
    const config: IFormConfig = {
      version: 2,
      fields: {
        a: { type: "Textbox", label: "A" },
        b: { type: "Textbox", label: "B" },
      },
      fieldOrder: ["b", "a"],
    };

    const { uiSchema } = toRjsfSchema(config);
    expect(uiSchema["ui:order"]).toEqual(["b", "a"]);
  });

  it("should convert hidden/readonly/disabled to uiSchema", () => {
    const config: IFormConfig = {
      version: 2,
      fields: {
        secret: { type: "Textbox", label: "Secret", hidden: true },
        locked: { type: "Textbox", label: "Locked", readOnly: true },
        off: { type: "Textbox", label: "Off", disabled: true },
      },
    };

    const { uiSchema } = toRjsfSchema(config);
    expect((uiSchema.secret as Record<string, unknown>)["ui:hidden"]).toBe(true);
    expect((uiSchema.locked as Record<string, unknown>)["ui:readonly"]).toBe(true);
    expect((uiSchema.off as Record<string, unknown>)["ui:disabled"]).toBe(true);
  });

  it("should handle dot-notation fields as nested objects", () => {
    const config: IFormConfig = {
      version: 2,
      fields: {
        "address.street": { type: "Textbox", label: "Street", required: true },
        "address.city": { type: "Textbox", label: "City" },
      },
    };

    const { schema } = toRjsfSchema(config);
    expect(schema.properties!.address).toBeDefined();
    expect(schema.properties!.address.type).toBe("object");
    expect(schema.properties!.address.properties!.street).toBeDefined();
    expect(schema.properties!.address.required).toContain("street");
  });

  it("should not set enumNames if labels match values", () => {
    const config: IFormConfig = {
      version: 2,
      fields: {
        color: {
          type: "Dropdown",
          label: "Color",
          options: [
            { value: "red", label: "red" },
            { value: "blue", label: "blue" },
          ],
        },
      },
    };

    const { schema } = toRjsfSchema(config);
    expect(schema.properties!.color.enumNames).toBeUndefined();
  });

  it("should handle config-based widget info in uiSchema", () => {
    const config: IFormConfig = {
      version: 2,
      fields: {
        pw: {
          type: "Textbox",
          label: "Password",
          config: { type: "password" },
        },
      },
    };

    const { uiSchema } = toRjsfSchema(config);
    expect((uiSchema.pw as Record<string, string>)["ui:widget"]).toBe("password");
  });
});
