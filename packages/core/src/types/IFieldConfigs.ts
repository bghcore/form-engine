/**
 * Shared field config interfaces used by adapter packages.
 * These define the shape of the `config` prop (IFieldProps.config) for specific field types.
 */

/** Config for Rating field */
export interface IRatingConfig {
  max?: number;
  allowHalf?: boolean;
}

/** Config for DateRange field */
export interface IDateRangeConfig {
  minDate?: string;
  maxDate?: string;
}

/** Value shape for DateRange field */
export interface IDateRangeValue {
  start: string;
  end: string;
}

/** Config for DateTime field */
export interface IDateTimeConfig {
  minDateTime?: string;
  maxDateTime?: string;
}

/** Config for FileUpload field */
export interface IFileUploadConfig {
  multiple?: boolean;
  accept?: string;
  maxSizeMb?: number;
}

/** Config for PhoneInput field */
export interface IPhoneInputConfig {
  format?: "us" | "international" | "raw";
}
