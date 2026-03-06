/**
 * JSON Schema node type (supports draft-04 through draft-2020-12 features used by RJSF).
 */
export interface IJsonSchemaNode {
  $ref?: string;
  definitions?: Record<string, IJsonSchemaNode>;
  $defs?: Record<string, IJsonSchemaNode>;

  type?: string | string[];
  const?: unknown;
  title?: string;
  description?: string;
  default?: unknown;

  // String constraints
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string; // email, uri, date, date-time, time, data-url, phone

  // Numeric constraints
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;

  // Enum
  enum?: unknown[];
  enumNames?: string[]; // RJSF extension

  // Object
  properties?: Record<string, IJsonSchemaNode>;
  required?: string[];
  additionalProperties?: boolean | IJsonSchemaNode;

  // Array
  items?: IJsonSchemaNode | IJsonSchemaNode[];
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;

  // Composition
  oneOf?: IJsonSchemaNode[];
  anyOf?: IJsonSchemaNode[];
  allOf?: IJsonSchemaNode[];

  // Conditional (draft-07+)
  if?: IJsonSchemaNode;
  then?: IJsonSchemaNode;
  else?: IJsonSchemaNode;

  // Dependencies (draft-04 extension, widely used by RJSF)
  dependencies?: Record<string, string[] | IJsonSchemaNode>;

  // Allow additional properties for forward compatibility
  [key: string]: unknown;
}

/**
 * RJSF uiSchema type — controls rendering hints separate from the data schema.
 */
export interface IRjsfUiSchema {
  "ui:widget"?: string;
  "ui:field"?: string;
  "ui:options"?: Record<string, unknown>;
  "ui:order"?: string[];
  "ui:hidden"?: boolean;
  "ui:readonly"?: boolean;
  "ui:disabled"?: boolean;
  "ui:placeholder"?: string;
  "ui:title"?: string;
  "ui:description"?: string;
  "ui:help"?: string;
  "ui:autofocus"?: boolean;
  "ui:enumDisabled"?: unknown[];
  "ui:enumNames"?: string[];
  "ui:label"?: boolean;
  "ui:classNames"?: string;
  "ui:submitButtonOptions"?: Record<string, unknown>;
  [fieldName: string]: unknown;
}

/**
 * Options for controlling the RJSF-to-IFormConfig conversion.
 */
export interface IRjsfConvertOptions {
  /** "flatten" = dot-notation keys (default), "fieldArray" = FieldArray items */
  nestedObjectStrategy?: "flatten" | "fieldArray";
  /** Prefix for generated rule IDs (default: "rjsf") */
  ruleIdPrefix?: string;
}
