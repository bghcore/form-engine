export interface IFieldArrayConfig {
  /** Field configs for each item in the array. Keys are field names within an item. */
  itemFields: Record<string, {
    component?: string;
    required?: boolean;
    label?: string;
    validations?: string[];
    dropdownOptions?: Array<{ key: string | number; text: string }>;
  }>;
  minItems?: number;
  maxItems?: number;
  defaultItem?: Record<string, unknown>;
  reorderable?: boolean;
}
