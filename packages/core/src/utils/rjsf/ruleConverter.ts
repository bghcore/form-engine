import { IFieldConfig } from "../../types/IFieldConfig";
import { ICondition } from "../../types/ICondition";
import { IRule } from "../../types/IRule";
import { IJsonSchemaNode } from "./types";
import { schemaNodeToFieldConfig } from "./fieldMapper";

/**
 * Convert JSON Schema `dependencies` to IRule[] attached to affected fields.
 *
 * Handles both property dependencies (string[]) and schema dependencies (object).
 */
export function convertDependencies(
  dependencies: Record<string, string[] | IJsonSchemaNode>,
  fields: Record<string, IFieldConfig>,
  rootSchema: IJsonSchemaNode,
  idPrefix: string
): void {
  for (const [sourceField, dep] of Object.entries(dependencies)) {
    if (Array.isArray(dep)) {
      // Property dependency: when source is not empty, dependents become required
      for (const dependentField of dep) {
        if (!fields[dependentField]) continue;
        const rule: IRule = {
          id: `${idPrefix}_dep_${sourceField}_${dependentField}`,
          when: { field: sourceField, operator: "isNotEmpty" },
          then: { required: true },
          else: { required: false },
        };
        fields[dependentField].rules = [
          ...(fields[dependentField].rules ?? []),
          rule,
        ];
      }
    } else {
      // Schema dependency: source not empty → show/require additional fields
      convertSchemaDependency(sourceField, dep, fields, rootSchema, idPrefix);
    }
  }
}

/**
 * Convert JSON Schema `if/then/else` to IRule[] attached to affected fields.
 */
export function convertIfThenElse(
  schema: IJsonSchemaNode,
  fields: Record<string, IFieldConfig>,
  rootSchema: IJsonSchemaNode,
  idPrefix: string
): void {
  const condition = schemaToCondition(schema.if!);
  if (!condition) return;

  const thenSchema = schema.then;
  const elseSchema = schema.else;

  // Collect affected fields from then/else
  const affectedFields = new Set<string>();
  if (thenSchema?.properties) {
    Object.keys(thenSchema.properties).forEach((f) => affectedFields.add(f));
  }
  if (thenSchema?.required) {
    thenSchema.required.forEach((f) => affectedFields.add(f));
  }
  if (elseSchema?.properties) {
    Object.keys(elseSchema.properties).forEach((f) => affectedFields.add(f));
  }
  if (elseSchema?.required) {
    elseSchema.required.forEach((f) => affectedFields.add(f));
  }

  for (const fieldName of affectedFields) {
    // Ensure field exists
    if (!fields[fieldName] && thenSchema?.properties?.[fieldName]) {
      fields[fieldName] = schemaNodeToFieldConfig(
        fieldName,
        thenSchema.properties[fieldName],
        false
      );
      fields[fieldName].hidden = true;
    }
    if (!fields[fieldName] && elseSchema?.properties?.[fieldName]) {
      fields[fieldName] = schemaNodeToFieldConfig(
        fieldName,
        elseSchema.properties[fieldName],
        false
      );
      fields[fieldName].hidden = true;
    }
    if (!fields[fieldName]) continue;

    const thenEffect: Record<string, unknown> = {};
    const elseEffect: Record<string, unknown> = {};

    // Visibility
    if (thenSchema?.properties?.[fieldName]) {
      thenEffect.hidden = false;
    }
    if (elseSchema?.properties?.[fieldName]) {
      elseEffect.hidden = false;
    }
    // If only in then → hide in else
    if (thenSchema?.properties?.[fieldName] && !elseSchema?.properties?.[fieldName]) {
      elseEffect.hidden = true;
    }
    // If only in else → hide in then
    if (!thenSchema?.properties?.[fieldName] && elseSchema?.properties?.[fieldName]) {
      thenEffect.hidden = true;
    }

    // Required
    if (thenSchema?.required?.includes(fieldName)) {
      thenEffect.required = true;
    }
    if (elseSchema?.required?.includes(fieldName)) {
      elseEffect.required = true;
    }

    const rule: IRule = {
      id: `${idPrefix}_ite_${fieldName}`,
      when: condition,
      then: thenEffect,
    };

    if (Object.keys(elseEffect).length > 0) {
      rule.else = elseEffect;
    }

    fields[fieldName].rules = [...(fields[fieldName].rules ?? []), rule];
  }
}

/**
 * Convert oneOf/anyOf composition with discriminator detection to IRule[].
 */
export function convertComposition(
  schema: IJsonSchemaNode,
  fields: Record<string, IFieldConfig>,
  rootSchema: IJsonSchemaNode,
  idPrefix: string
): void {
  const variants = schema.oneOf ?? schema.anyOf;
  if (!variants || variants.length === 0) return;

  const compositionType = schema.oneOf ? "oneOf" : "anyOf";

  // Detect discriminator: a property that has const/enum in every variant
  const discriminator = findDiscriminator(variants);

  if (discriminator) {
    convertWithDiscriminator(
      discriminator,
      variants,
      fields,
      rootSchema,
      idPrefix,
      compositionType
    );
  } else {
    convertWithSyntheticDiscriminator(
      variants,
      fields,
      rootSchema,
      idPrefix,
      compositionType
    );
  }
}

/**
 * Convert a JSON Schema condition shape to our ICondition type.
 * Used for if/then/else, dependencies, and composition detection.
 */
export function schemaToCondition(
  schema: IJsonSchemaNode
): ICondition | null {
  if (!schema) return null;

  // { not: {...} }
  if (schema.not) {
    const inner = schemaToCondition(schema.not as IJsonSchemaNode);
    if (!inner) return null;
    return { operator: "not", conditions: [inner] };
  }

  // { allOf: [...] }
  if (schema.allOf && schema.allOf.length > 0) {
    const conditions = schema.allOf
      .map((s) => schemaToCondition(s))
      .filter((c): c is ICondition => c !== null);
    if (conditions.length === 0) return null;
    if (conditions.length === 1) return conditions[0];
    return { operator: "and", conditions };
  }

  // { anyOf: [...] }
  if (schema.anyOf && schema.anyOf.length > 0) {
    const conditions = schema.anyOf
      .map((s) => schemaToCondition(s))
      .filter((c): c is ICondition => c !== null);
    if (conditions.length === 0) return null;
    if (conditions.length === 1) return conditions[0];
    return { operator: "or", conditions };
  }

  // { required: ["x"] } without properties → isNotEmpty
  if (schema.required && !schema.properties) {
    const conditions: ICondition[] = schema.required.map((field) => ({
      field,
      operator: "isNotEmpty" as const,
    }));
    if (conditions.length === 1) return conditions[0];
    return { operator: "and", conditions };
  }

  // { properties: { x: { const: v } } }
  if (schema.properties) {
    const conditions: ICondition[] = [];

    for (const [field, propSchema] of Object.entries(schema.properties)) {
      const condition = propertySchemaToCondition(field, propSchema);
      if (condition) conditions.push(condition);
    }

    // Also handle required alongside properties
    if (schema.required) {
      for (const field of schema.required) {
        if (!schema.properties[field]) {
          conditions.push({ field, operator: "isNotEmpty" });
        }
      }
    }

    if (conditions.length === 0) return null;
    if (conditions.length === 1) return conditions[0];
    return { operator: "and", conditions };
  }

  return null;
}

// --- Internal helpers ---

function propertySchemaToCondition(
  field: string,
  schema: IJsonSchemaNode
): ICondition | null {
  if (schema.const !== undefined) {
    return { field, operator: "equals", value: schema.const };
  }
  if (schema.enum && schema.enum.length > 0) {
    return { field, operator: "in", value: schema.enum };
  }
  if (schema.minimum !== undefined) {
    return { field, operator: "greaterThanOrEqual", value: schema.minimum };
  }
  if (schema.maximum !== undefined) {
    return { field, operator: "lessThanOrEqual", value: schema.maximum };
  }
  if (schema.minLength !== undefined && schema.minLength > 0) {
    return { field, operator: "isNotEmpty" };
  }
  if (schema.pattern) {
    return { field, operator: "matches", value: schema.pattern };
  }

  return null;
}

function convertSchemaDependency(
  sourceField: string,
  depSchema: IJsonSchemaNode,
  fields: Record<string, IFieldConfig>,
  rootSchema: IJsonSchemaNode,
  idPrefix: string
): void {
  const depRequired = new Set(depSchema.required ?? []);

  if (depSchema.properties) {
    for (const [depFieldName, depFieldSchema] of Object.entries(
      depSchema.properties
    )) {
      // Create field if it doesn't exist
      if (!fields[depFieldName]) {
        fields[depFieldName] = schemaNodeToFieldConfig(
          depFieldName,
          depFieldSchema,
          depRequired.has(depFieldName)
        );
        fields[depFieldName].hidden = true;
      }

      const rule: IRule = {
        id: `${idPrefix}_schemadep_${sourceField}_${depFieldName}`,
        when: { field: sourceField, operator: "isNotEmpty" },
        then: {
          hidden: false,
          ...(depRequired.has(depFieldName) ? { required: true } : {}),
        },
        else: {
          hidden: true,
        },
      };

      fields[depFieldName].rules = [
        ...(fields[depFieldName].rules ?? []),
        rule,
      ];
    }
  }

  // Handle oneOf inside schema dependencies (common RJSF pattern)
  if (depSchema.oneOf) {
    convertComposition(
      depSchema,
      fields,
      rootSchema,
      `${idPrefix}_schemadep_${sourceField}`
    );
  }
}

function findDiscriminator(
  variants: IJsonSchemaNode[]
): string | null {
  if (variants.length < 2) return null;

  // Find properties that appear in all variants with const or single-value enum
  const firstVariant = variants[0];
  if (!firstVariant.properties) return null;

  for (const propName of Object.keys(firstVariant.properties)) {
    const prop = firstVariant.properties[propName];
    if (!hasConstOrSingleEnum(prop)) continue;

    // Check all other variants have this property with const/enum
    const allHave = variants.every(
      (v) => v.properties?.[propName] && hasConstOrSingleEnum(v.properties[propName])
    );

    if (allHave) {
      // Verify all values are distinct
      const values = variants.map((v) =>
        getConstValue(v.properties![propName])
      );
      const unique = new Set(values.map(String));
      if (unique.size === variants.length) return propName;
    }
  }

  return null;
}

function hasConstOrSingleEnum(node: IJsonSchemaNode): boolean {
  if (node.const !== undefined) return true;
  if (node.enum && node.enum.length === 1) return true;
  return false;
}

function getConstValue(node: IJsonSchemaNode): unknown {
  if (node.const !== undefined) return node.const;
  if (node.enum && node.enum.length === 1) return node.enum[0];
  return undefined;
}

function convertWithDiscriminator(
  discriminatorField: string,
  variants: IJsonSchemaNode[],
  fields: Record<string, IFieldConfig>,
  rootSchema: IJsonSchemaNode,
  idPrefix: string,
  compositionType: string
): void {
  // Ensure discriminator field exists as a dropdown
  const allValues = variants.map((v) =>
    getConstValue(v.properties![discriminatorField])
  );
  if (!fields[discriminatorField]) {
    fields[discriminatorField] = {
      type: "Dropdown",
      label: discriminatorField,
      options: allValues.map((v) => ({
        value: String(v),
        label: String(v),
      })),
    };
  }

  // For each variant, create visibility rules for variant-specific fields
  for (const variant of variants) {
    if (!variant.properties) continue;
    const variantValue = getConstValue(variant.properties[discriminatorField]);
    const variantRequired = new Set(variant.required ?? []);

    for (const [fieldName, fieldSchema] of Object.entries(variant.properties)) {
      if (fieldName === discriminatorField) continue;

      if (!fields[fieldName]) {
        fields[fieldName] = schemaNodeToFieldConfig(
          fieldName,
          fieldSchema,
          variantRequired.has(fieldName)
        );
        fields[fieldName].hidden = true;
      }

      const rule: IRule = {
        id: `${idPrefix}_${compositionType}_${discriminatorField}_${fieldName}`,
        when: {
          field: discriminatorField,
          operator: "equals",
          value: variantValue,
        },
        then: {
          hidden: false,
          ...(variantRequired.has(fieldName) ? { required: true } : {}),
        },
        else: { hidden: true },
      };

      fields[fieldName].rules = [
        ...(fields[fieldName].rules ?? []),
        rule,
      ];
    }
  }
}

function convertWithSyntheticDiscriminator(
  variants: IJsonSchemaNode[],
  fields: Record<string, IFieldConfig>,
  rootSchema: IJsonSchemaNode,
  idPrefix: string,
  compositionType: string
): void {
  // Create a synthetic _variant dropdown
  const options = variants.map((_, i) => ({
    value: String(i),
    label: `Option ${i + 1}`,
  }));

  fields["_variant"] = {
    type: "Dropdown",
    label: "Variant",
    options,
  };

  // For each variant, create visibility rules
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    if (!variant.properties) continue;
    const variantRequired = new Set(variant.required ?? []);

    for (const [fieldName, fieldSchema] of Object.entries(variant.properties)) {
      if (!fields[fieldName]) {
        fields[fieldName] = schemaNodeToFieldConfig(
          fieldName,
          fieldSchema,
          variantRequired.has(fieldName)
        );
        fields[fieldName].hidden = true;
      }

      const rule: IRule = {
        id: `${idPrefix}_${compositionType}_variant${i}_${fieldName}`,
        when: {
          field: "_variant",
          operator: "equals",
          value: String(i),
        },
        then: {
          hidden: false,
          ...(variantRequired.has(fieldName) ? { required: true } : {}),
        },
        else: { hidden: true },
      };

      fields[fieldName].rules = [
        ...(fields[fieldName].rules ?? []),
        rule,
      ];
    }
  }
}
