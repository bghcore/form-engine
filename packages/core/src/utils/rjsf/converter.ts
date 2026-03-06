import { IFieldConfig } from "../../types/IFieldConfig";
import { IFormConfig } from "../../types/IFormConfig";
import { IJsonSchemaNode, IRjsfUiSchema, IRjsfConvertOptions } from "./types";
import { resolveRefs } from "./refResolver";
import {
  schemaNodeToFieldConfig,
  applyUiSchema,
  extractValidationRules,
} from "./fieldMapper";
import {
  convertDependencies,
  convertIfThenElse,
  convertComposition,
} from "./ruleConverter";

/**
 * Convert an RJSF schema + uiSchema + formData into an IFormConfig (v2).
 *
 * This is the main entry point for RJSF migration. It:
 * 1. Resolves all $ref pointers
 * 2. Merges allOf if present
 * 3. Maps properties to IFieldConfig
 * 4. Applies uiSchema rendering hints
 * 5. Merges formData as defaultValues
 * 6. Converts dependencies → IRule[]
 * 7. Converts if/then/else → IRule[]
 * 8. Converts oneOf/anyOf → IRule[]
 * 9. Determines fieldOrder from uiSchema or property order
 */
export function fromRjsfSchema(
  schema: IJsonSchemaNode,
  uiSchema?: IRjsfUiSchema,
  formData?: Record<string, unknown>,
  options?: IRjsfConvertOptions
): IFormConfig {
  const strategy = options?.nestedObjectStrategy ?? "flatten";
  const idPrefix = options?.ruleIdPrefix ?? "rjsf";

  // Step 1: Resolve $ref pointers
  const resolved = resolveRefs(schema);

  // Step 2: Merge allOf if present
  const merged = mergeAllOf(resolved);

  // Step 3: Map properties to field configs
  const fields: Record<string, IFieldConfig> = {};
  const requiredSet = new Set(merged.required ?? []);

  if (merged.properties) {
    mapProperties(
      merged.properties,
      requiredSet,
      fields,
      "",
      strategy,
      uiSchema,
      formData
    );
  }

  // Step 4-5 handled in mapProperties

  // Step 6: Convert dependencies
  if (merged.dependencies) {
    convertDependencies(merged.dependencies, fields, merged, idPrefix);
  }

  // Step 7: Convert if/then/else
  if (merged.if) {
    convertIfThenElse(merged, fields, merged, idPrefix);
  }

  // Step 8: Convert oneOf/anyOf
  if (merged.oneOf || merged.anyOf) {
    convertComposition(merged, fields, merged, idPrefix);
  }

  // Step 9: Determine field order
  const fieldOrder = resolveFieldOrder(fields, uiSchema);

  return {
    version: 2,
    fields,
    fieldOrder,
  };
}

// --- Internal helpers ---

function mapProperties(
  properties: Record<string, IJsonSchemaNode>,
  requiredSet: Set<string>,
  fields: Record<string, IFieldConfig>,
  prefix: string,
  strategy: "flatten" | "fieldArray",
  uiSchema?: IRjsfUiSchema,
  formData?: Record<string, unknown>
): void {
  for (const [propName, propSchema] of Object.entries(properties)) {
    const fullName = prefix ? `${prefix}.${propName}` : propName;
    const isRequired = requiredSet.has(propName);

    if (isObjectType(propSchema) && propSchema.properties) {
      if (strategy === "flatten") {
        // Flatten: recurse with dot-prefix
        const nestedRequired = new Set(propSchema.required ?? []);
        const nestedUiSchema = uiSchema?.[propName] as IRjsfUiSchema | undefined;
        const nestedFormData = formData?.[propName] as
          | Record<string, unknown>
          | undefined;
        mapProperties(
          propSchema.properties,
          nestedRequired,
          fields,
          fullName,
          strategy,
          nestedUiSchema,
          nestedFormData
        );
        continue;
      } else {
        // FieldArray strategy for nested objects
        const items: Record<string, IFieldConfig> = {};
        const nestedRequired = new Set(propSchema.required ?? []);
        for (const [itemProp, itemSchema] of Object.entries(
          propSchema.properties
        )) {
          items[itemProp] = schemaNodeToFieldConfig(
            itemProp,
            itemSchema,
            nestedRequired.has(itemProp)
          );
        }
        fields[fullName] = {
          type: "FieldArray",
          label: propSchema.title ?? propName,
          items,
        };
        continue;
      }
    }

    // Array with object items → FieldArray
    if (isArrayWithObjectItems(propSchema)) {
      const itemSchema = propSchema.items as IJsonSchemaNode;
      const items: Record<string, IFieldConfig> = {};
      const itemRequired = new Set(itemSchema.required ?? []);
      if (itemSchema.properties) {
        for (const [itemProp, itemPropSchema] of Object.entries(
          itemSchema.properties
        )) {
          items[itemProp] = schemaNodeToFieldConfig(
            itemProp,
            itemPropSchema,
            itemRequired.has(itemProp)
          );
        }
      }
      const config = schemaNodeToFieldConfig(fullName, propSchema, isRequired);
      config.type = "FieldArray";
      config.items = items;
      if (propSchema.minItems !== undefined) config.minItems = propSchema.minItems;
      if (propSchema.maxItems !== undefined) config.maxItems = propSchema.maxItems;
      fields[fullName] = config;

      // Apply uiSchema
      const fieldUiSchema = getFieldUiSchema(uiSchema, propName, prefix);
      if (fieldUiSchema) {
        fields[fullName] = applyUiSchema(fields[fullName], fieldUiSchema);
      }

      // Apply formData
      const dataValue = getFormDataValue(formData, propName);
      if (dataValue !== undefined && fields[fullName].defaultValue === undefined) {
        fields[fullName].defaultValue = dataValue;
      }

      continue;
    }

    // Standard field
    const config = schemaNodeToFieldConfig(fullName, propSchema, isRequired);
    fields[fullName] = config;

    // Apply uiSchema
    const fieldUiSchema = getFieldUiSchema(uiSchema, propName, prefix);
    if (fieldUiSchema) {
      fields[fullName] = applyUiSchema(fields[fullName], fieldUiSchema);
    }

    // Apply formData as defaultValue
    const dataValue = getFormDataValue(formData, propName);
    if (dataValue !== undefined && fields[fullName].defaultValue === undefined) {
      fields[fullName].defaultValue = dataValue;
    }
  }
}

function mergeAllOf(schema: IJsonSchemaNode): IJsonSchemaNode {
  if (!schema.allOf || schema.allOf.length === 0) return schema;

  const { allOf, ...base } = schema;
  let result = { ...base };

  for (const subSchema of allOf) {
    result = mergeSchemas(result, subSchema);
  }

  return result;
}

function mergeSchemas(
  a: IJsonSchemaNode,
  b: IJsonSchemaNode
): IJsonSchemaNode {
  const result = { ...a };

  if (b.properties) {
    result.properties = { ...(result.properties ?? {}), ...b.properties };
  }
  if (b.required) {
    const existing = new Set(result.required ?? []);
    for (const r of b.required) existing.add(r);
    result.required = [...existing];
  }
  if (b.if) result.if = b.if;
  if (b.then) result.then = b.then;
  if (b.else) result.else = b.else;
  if (b.dependencies) {
    result.dependencies = {
      ...(result.dependencies ?? {}),
      ...b.dependencies,
    };
  }

  return result;
}

function isObjectType(node: IJsonSchemaNode): boolean {
  if (node.type === "object") return true;
  if (Array.isArray(node.type) && node.type.includes("object")) return true;
  return false;
}

function isArrayWithObjectItems(node: IJsonSchemaNode): boolean {
  const type = Array.isArray(node.type) ? node.type[0] : node.type;
  if (type !== "array") return false;
  const items = node.items;
  if (!items || Array.isArray(items)) return false;
  return items.type === "object" && !!items.properties;
}

function getFieldUiSchema(
  uiSchema: IRjsfUiSchema | undefined,
  fieldName: string,
  prefix: string
): IRjsfUiSchema | undefined {
  if (!uiSchema) return undefined;
  // Navigate into nested uiSchema for prefixed fields
  if (prefix) {
    const parts = prefix.split(".");
    let current: IRjsfUiSchema | undefined = uiSchema;
    for (const part of parts) {
      current = current?.[part] as IRjsfUiSchema | undefined;
    }
    return current?.[fieldName] as IRjsfUiSchema | undefined;
  }
  return uiSchema[fieldName] as IRjsfUiSchema | undefined;
}

function getFormDataValue(
  formData: Record<string, unknown> | undefined,
  fieldName: string
): unknown {
  if (!formData) return undefined;
  return formData[fieldName];
}

function resolveFieldOrder(
  fields: Record<string, IFieldConfig>,
  uiSchema?: IRjsfUiSchema
): string[] {
  const uiOrder = uiSchema?.["ui:order"];
  if (!Array.isArray(uiOrder)) return Object.keys(fields);

  const allFields = new Set(Object.keys(fields));
  const order: string[] = [];
  const wildcardIdx = uiOrder.indexOf("*");

  for (const item of uiOrder) {
    if (item === "*") continue;
    if (allFields.has(item)) {
      order.push(item);
      allFields.delete(item);
    }
  }

  if (wildcardIdx !== -1) {
    // Insert remaining fields where * was
    const remaining = [...allFields];
    order.splice(wildcardIdx, 0, ...remaining);
  } else {
    // Append remaining at end
    order.push(...allFields);
  }

  return order;
}
