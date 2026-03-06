import { IFieldConfig } from "../../types/IFieldConfig";
import { IOption } from "../../types/IOption";
import { IValidationRule } from "../../types/IValidationRule";
import { IJsonSchemaNode, IRjsfUiSchema } from "./types";

/**
 * Map from RJSF ui:widget names to our component type keys.
 */
const WIDGET_MAP: Record<string, string> = {
  text: "Textbox",
  textarea: "Textarea",
  password: "Textbox",
  color: "Textbox",
  hidden: "DynamicFragment",
  select: "Dropdown",
  radio: "Dropdown",
  checkboxes: "Multiselect",
  updown: "Number",
  range: "Slider",
  date: "DateControl",
  datetime: "DateControl",
  "date-time": "DateControl",
  file: "DocumentLinks",
  checkbox: "Toggle",
};

/**
 * Config overrides for specific widgets (e.g., password → config.type:"password").
 */
const WIDGET_CONFIG: Record<string, Record<string, unknown>> = {
  password: { type: "password" },
  color: { type: "color" },
  radio: { display: "radio" },
  checkboxes: { display: "checkboxes" },
};

/**
 * Convert a JSON Schema node to an IFieldConfig.
 */
export function schemaNodeToFieldConfig(
  fieldName: string,
  node: IJsonSchemaNode,
  isRequired: boolean
): IFieldConfig {
  const type = mapTypeToComponent(node);
  const validate = extractValidationRules(node);
  const options = extractOptions(node);

  const config: IFieldConfig = {
    type,
    label: node.title ?? fieldName,
    required: isRequired,
  };

  if (validate.length > 0) config.validate = validate;
  if (options) config.options = options;
  if (node.default !== undefined) config.defaultValue = node.default;
  if (node.description) config.description = node.description;

  // const fields are read-only with the const as default
  if (node.const !== undefined) {
    config.readOnly = true;
    config.defaultValue = node.const;
  }

  return config;
}

/**
 * Extract IValidationRule[] from JSON Schema constraints.
 */
export function extractValidationRules(
  node: IJsonSchemaNode
): IValidationRule[] {
  const rules: IValidationRule[] = [];

  if (node.minLength !== undefined) {
    rules.push({ name: "minLength", params: { min: node.minLength } });
  }
  if (node.maxLength !== undefined) {
    rules.push({ name: "maxLength", params: { max: node.maxLength } });
  }
  if (node.pattern) {
    rules.push({
      name: "pattern",
      params: { pattern: node.pattern, message: "Must match pattern" },
    });
  }

  // Numeric ranges
  const hasMin = node.minimum !== undefined;
  const hasMax = node.maximum !== undefined;
  const hasExclMin = node.exclusiveMinimum !== undefined;
  const hasExclMax = node.exclusiveMaximum !== undefined;

  if (hasExclMin || hasExclMax) {
    rules.push({
      name: "exclusiveNumericRange",
      params: {
        exclusiveMin: node.exclusiveMinimum,
        exclusiveMax: node.exclusiveMaximum,
        min: node.minimum,
        max: node.maximum,
      },
    });
  } else if (hasMin || hasMax) {
    rules.push({
      name: "numericRange",
      params: {
        min: node.minimum ?? -Infinity,
        max: node.maximum ?? Infinity,
      },
    });
  }

  if (node.multipleOf !== undefined) {
    rules.push({
      name: "multipleOf",
      params: { factor: node.multipleOf },
    });
  }

  // Format-based validators
  if (node.format === "email") rules.push({ name: "email" });
  if (node.format === "uri" || node.format === "url") rules.push({ name: "url" });
  if (node.format === "phone") rules.push({ name: "phone" });

  if (node.uniqueItems) {
    rules.push({ name: "uniqueInArray" });
  }

  return rules;
}

/**
 * Apply RJSF uiSchema overrides to an IFieldConfig.
 */
export function applyUiSchema(
  config: IFieldConfig,
  uiSchema: IRjsfUiSchema
): IFieldConfig {
  const result = { ...config };

  // Widget → component type override
  const widget = uiSchema["ui:widget"];
  if (typeof widget === "string" && WIDGET_MAP[widget]) {
    result.type = WIDGET_MAP[widget];
    // Apply widget-specific config
    const extraConfig = WIDGET_CONFIG[widget];
    if (extraConfig) {
      result.config = { ...(result.config ?? {}), ...extraConfig };
    }
  }

  if (uiSchema["ui:title"]) result.label = uiSchema["ui:title"] as string;
  if (uiSchema["ui:description"])
    result.description = uiSchema["ui:description"] as string;
  if (uiSchema["ui:help"]) result.helpText = uiSchema["ui:help"] as string;
  if (uiSchema["ui:placeholder"])
    result.placeholder = uiSchema["ui:placeholder"] as string;
  if (uiSchema["ui:hidden"] === true) result.hidden = true;
  if (uiSchema["ui:readonly"] === true) result.readOnly = true;
  if (uiSchema["ui:disabled"] === true) result.disabled = true;

  if (uiSchema["ui:autofocus"] === true) {
    result.config = { ...(result.config ?? {}), autofocus: true };
  }
  if (uiSchema["ui:classNames"]) {
    result.config = {
      ...(result.config ?? {}),
      className: uiSchema["ui:classNames"],
    };
  }
  if (uiSchema["ui:options"] && typeof uiSchema["ui:options"] === "object") {
    result.config = { ...(result.config ?? {}), ...uiSchema["ui:options"] };
  }
  if (uiSchema["ui:label"] === false) {
    result.config = { ...(result.config ?? {}), hideLabel: true };
  }

  // ui:enumDisabled → mark matching options as disabled
  const enumDisabled = uiSchema["ui:enumDisabled"];
  if (Array.isArray(enumDisabled) && result.options) {
    result.options = result.options.map((opt) => ({
      ...opt,
      disabled: enumDisabled.includes(opt.value) ? true : opt.disabled,
    }));
  }

  // ui:enumNames → override option labels
  const enumNames = uiSchema["ui:enumNames"];
  if (Array.isArray(enumNames) && result.options) {
    result.options = result.options.map((opt, i) => ({
      ...opt,
      label: enumNames[i] != null ? String(enumNames[i]) : opt.label,
    }));
  }

  return result;
}

// --- Internal helpers ---

function mapTypeToComponent(node: IJsonSchemaNode): string {
  // Enum always → Dropdown
  if (node.enum) return "Dropdown";

  // const → Textbox (will be read-only)
  if (node.const !== undefined) return "Textbox";

  const type = resolveType(node);

  switch (type) {
    case "string":
      if (node.format === "date" || node.format === "date-time") return "DateControl";
      if (node.format === "data-url") return "DocumentLinks";
      if (node.maxLength && node.maxLength > 200) return "Textarea";
      return "Textbox";
    case "number":
    case "integer":
      if (node.minimum !== undefined && node.maximum !== undefined) return "Slider";
      return "Number";
    case "boolean":
      return "Toggle";
    case "array":
      return mapArrayType(node);
    case "object":
      return "Textbox"; // Objects handled at converter level
    default:
      return "Textbox";
  }
}

function resolveType(node: IJsonSchemaNode): string {
  if (!node.type) return "string";
  if (typeof node.type === "string") return node.type;
  // Array of types (nullable) — pick first non-null
  const nonNull = node.type.filter((t) => t !== "null");
  return nonNull[0] ?? "string";
}

function mapArrayType(node: IJsonSchemaNode): string {
  const items = node.items;
  if (!items || Array.isArray(items)) return "Multiselect";

  if (items.enum) return "Multiselect";
  if (items.type === "object" && items.properties) return "FieldArray";
  return "Multiselect";
}

function extractOptions(node: IJsonSchemaNode): IOption[] | undefined {
  if (!node.enum) return undefined;

  const names = node.enumNames;
  return node.enum.map((val, i) => ({
    value: String(val),
    label: names && names[i] != null ? String(names[i]) : String(val),
  }));
}
