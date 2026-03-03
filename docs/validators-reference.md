# Validators Reference

This document covers all validation capabilities in `dynamic-react-business-forms`, including the 9 built-in sync validators, 5 factory functions for creating parameterized validators, async validation support, cross-field validation, and patterns for writing custom validators.

All validation infrastructure is in `packages/core/src/helpers/ValidationRegistry.ts`.

---

## Built-in Sync Validators

These validators are registered by default and can be referenced by name in `IFieldConfig.validations`:

| Name | Checks | Error Message | Skips Empty |
|---|---|---|---|
| `EmailValidation` | Valid email format (`user@domain.tld`) | `"Invalid email address"` | Yes |
| `PhoneNumberValidation` | Valid phone number pattern (international formats supported) | `"Invalid phone number"` | Yes |
| `YearValidation` | Integer year between 1900 and 2100 | `"Invalid year"` | Yes |
| `Max150KbValidation` | String content does not exceed 150 KB | `"Content exceeds maximum size of 150KB"` | Yes |
| `Max32KbValidation` | String content does not exceed 32 KB | `"Content exceeds maximum size of 32KB"` | Yes |
| `isValidUrl` | String starts with `http://` or `https://` | `"Invalid URL"` | Yes |
| `NoSpecialCharactersValidation` | String contains only alphanumeric characters, spaces, hyphens, underscores, and periods | `"Special characters are not allowed"` | Yes |
| `CurrencyValidation` | Valid currency format (optional negative, digits, optional 1-2 decimal places) | `"Invalid currency format"` | Yes |
| `UniqueInArrayValidation` | Array contains no duplicate values | `"Duplicate value: {value}"` | Yes |

**"Skips Empty"** means the validator returns `undefined` (passes) when the value is `null`, `undefined`, or an empty string. This is intentional -- use the `required` flag on `IFieldConfig` for presence validation.

### Detailed Validator Descriptions

#### EmailValidation
Validates against the regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Catches missing `@` signs, spaces in the address, and missing domain parts.

```json
{
  "email": {
    "component": "Textbox",
    "label": "Email Address",
    "validations": ["EmailValidation"]
  }
}
```

#### PhoneNumberValidation
Validates against `/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/`. Supports international formats with optional `+` prefix, country codes in parentheses, and common separators (dashes, spaces, dots, slashes).

```json
{
  "phone": {
    "component": "Textbox",
    "label": "Phone Number",
    "validations": ["PhoneNumberValidation"]
  }
}
```

#### YearValidation
Parses the string value as an integer and checks that it falls within the range 1900-2100 inclusive.

```json
{
  "yearFounded": {
    "component": "Textbox",
    "label": "Year Founded",
    "validations": ["YearValidation"]
  }
}
```

#### Max150KbValidation / Max32KbValidation
Calculates the byte size of the string value using `new Blob([value]).size` and compares against the KB limit (150 or 32). Created using the internal `createMaxKbValidation(maxKb)` factory.

```json
{
  "description": {
    "component": "Textarea",
    "label": "Description",
    "validations": ["Max150KbValidation"]
  }
}
```

#### isValidUrl
Tests the value against the regex `/(http(s?)):\/\//i` (defined in `HookInlineFormConstants.urlRegex`). Requires the string to begin with `http://` or `https://`.

```json
{
  "websiteUrl": {
    "component": "Textbox",
    "label": "Website URL",
    "validations": ["isValidUrl"]
  }
}
```

#### NoSpecialCharactersValidation
Validates against `/[^a-zA-Z0-9\s\-_.]/`. Rejects the value if any character outside the allowed set is found. Allowed characters: letters (a-z, A-Z), digits (0-9), spaces, hyphens, underscores, and periods.

```json
{
  "projectCode": {
    "component": "Textbox",
    "label": "Project Code",
    "validations": ["NoSpecialCharactersValidation"]
  }
}
```

#### CurrencyValidation
Validates against `/^-?\d{1,}(\.\d{1,2})?$/`. Accepts integers and decimals with up to 2 decimal places. Supports negative values. Also handles numeric values (coerces to string before testing).

```json
{
  "amount": {
    "component": "Number",
    "label": "Amount",
    "validations": ["CurrencyValidation"]
  }
}
```

#### UniqueInArrayValidation
Only applies to array values. Iterates through the array and checks for duplicate string representations. Returns the first duplicate found.

```json
{
  "tags": {
    "component": "Multiselect",
    "label": "Tags",
    "validations": ["UniqueInArrayValidation"]
  }
}
```

---

## Factory Validators

Factory functions create parameterized validators. These must be registered at startup using `registerValidations()`.

### createMinLengthValidation(min: number)

**Signature:** `(min: number) => ValidationFunction`

Creates a validator that checks whether the string value has at least `min` characters.

**Error message:** `"Must be at least {min} characters"`

**Skips empty:** Yes

**Example:**
```typescript
import { registerValidations, createMinLengthValidation } from "@bghcore/dynamic-forms-core";

registerValidations({
  MinLength5: createMinLengthValidation(5),
  MinLength10: createMinLengthValidation(10),
});
```

```json
{
  "password": {
    "component": "Textbox",
    "label": "Password",
    "validations": ["MinLength10"]
  }
}
```

---

### createMaxLengthValidation(max: number)

**Signature:** `(max: number) => ValidationFunction`

Creates a validator that checks whether the string value has at most `max` characters.

**Error message:** `"Must be at most {max} characters"`

**Skips empty:** Yes

**Example:**
```typescript
import { registerValidations, createMaxLengthValidation } from "@bghcore/dynamic-forms-core";

registerValidations({
  MaxLength50: createMaxLengthValidation(50),
  MaxLength255: createMaxLengthValidation(255),
});
```

```json
{
  "title": {
    "component": "Textbox",
    "label": "Title",
    "validations": ["MaxLength255"]
  }
}
```

---

### createNumericRangeValidation(min: number, max: number)

**Signature:** `(min: number, max: number) => ValidationFunction`

Creates a validator that checks whether the value (parsed as a number) falls within the specified range. Returns `"Must be a number"` if the value cannot be parsed.

**Error message:** `"Must be between {min} and {max}"` (or `"Must be a number"`)

**Skips empty:** Yes (passes on `null`, `undefined`, or `""`)

**Example:**
```typescript
import { registerValidations, createNumericRangeValidation } from "@bghcore/dynamic-forms-core";

registerValidations({
  PercentageRange: createNumericRangeValidation(0, 100),
  AgeRange: createNumericRangeValidation(0, 150),
});
```

```json
{
  "completionPercent": {
    "component": "Number",
    "label": "Completion %",
    "validations": ["PercentageRange"]
  }
}
```

---

### createPatternValidation(regex: RegExp, message: string)

**Signature:** `(regex: RegExp, message: string) => ValidationFunction`

Creates a validator that tests the string value against a custom regex. Returns the provided message if the pattern does not match.

**Error message:** The custom `message` parameter.

**Skips empty:** Yes

**Example:**
```typescript
import { registerValidations, createPatternValidation } from "@bghcore/dynamic-forms-core";

registerValidations({
  AlphaOnly: createPatternValidation(/^[a-zA-Z]+$/, "Only letters are allowed"),
  USZipCode: createPatternValidation(/^\d{5}(-\d{4})?$/, "Invalid US ZIP code"),
});
```

```json
{
  "zipCode": {
    "component": "Textbox",
    "label": "ZIP Code",
    "validations": ["USZipCode"]
  }
}
```

---

### createRequiredIfValidation(dependentFieldName: string, dependentFieldValues: string[])

**Signature:** `(dependentFieldName: string, dependentFieldValues: string[]) => ValidationFunction`

Creates a cross-field-aware sync validator that makes the current field required conditionally. The field is required only if the specified dependent field's value matches one of the provided values.

**Error message:** `"This field is required"`

**Skips empty:** No -- the point of this validator is to enforce presence when conditions are met. Returns `undefined` if the condition is not met or `entityData` is not available.

**Note:** This validator receives `entityData` (all form values) as the second argument via the `ValidationFunction` signature.

**Example:**
```typescript
import { registerValidations, createRequiredIfValidation } from "@bghcore/dynamic-forms-core";

registerValidations({
  RequiredIfStatusActive: createRequiredIfValidation("status", ["Active", "InProgress"]),
  RequiredIfTypeExternal: createRequiredIfValidation("partnerType", ["External"]),
});
```

```json
{
  "externalPartnerName": {
    "component": "Textbox",
    "label": "Partner Name",
    "validations": ["RequiredIfTypeExternal"]
  }
}
```

---

## Async Validators

Async validators are used for server-side validation (e.g., uniqueness checks, API-based validation). They run after all sync validators pass.

### Registration

```typescript
import { registerAsyncValidations, AsyncValidationFunction } from "@bghcore/dynamic-forms-core";

const checkUniqueEmail: AsyncValidationFunction = async (value, entityData, signal) => {
  if (!value || typeof value !== "string") return undefined;

  const response = await fetch(`/api/check-email?email=${encodeURIComponent(value)}`, {
    signal, // Pass AbortSignal for cancellation
  });

  if (signal?.aborted) return undefined;

  const result = await response.json();
  return result.exists ? "This email is already in use" : undefined;
};

registerAsyncValidations({
  UniqueEmailCheck: checkUniqueEmail,
});
```

### Function Signature

```typescript
type AsyncValidationFunction = (
  value: unknown,
  entityData?: IEntityData,
  signal?: AbortSignal
) => Promise<string | undefined>;
```

- **`value`**: The current field value.
- **`entityData`**: All current form values (for cross-field awareness).
- **`signal`**: An `AbortSignal` for cancellation. Check `signal?.aborted` before processing results from async operations.

### AbortSignal Support

The `signal` parameter enables cancellation of in-flight async validations when the user changes the field value before the previous validation completes. Always check `signal?.aborted` after `await` calls to avoid stale results:

```typescript
const validateWithApi: AsyncValidationFunction = async (value, entityData, signal) => {
  if (!value) return undefined;

  const response = await fetch(`/api/validate?v=${value}`, { signal });

  // IMPORTANT: Check abort status after every await
  if (signal?.aborted) return undefined;

  const data = await response.json();
  if (signal?.aborted) return undefined;

  return data.valid ? undefined : data.message;
};
```

### Debounce Behavior

Use `IFieldConfig.asyncValidationDebounceMs` to debounce async validation triggering:

```json
{
  "username": {
    "component": "Textbox",
    "label": "Username",
    "asyncValidations": ["CheckUsernameAvailable"],
    "asyncValidationDebounceMs": 500
  }
}
```

When the user types, async validation is deferred for the specified number of milliseconds after the last keystroke. This prevents excessive API calls during rapid input.

### Execution Order

In `HookRenderField`, validation runs in sequence within the `Controller`'s `rules.validate` function:

1. **Sync validators** run first (fast fail). If any sync validator returns an error, async validators are **skipped**.
2. **Async validators** run only after all sync validators pass. They run sequentially (not in parallel), stopping at the first error.
3. If the `AbortSignal` is aborted at any point, the async validator returns `undefined` (no error).

### Field Config Properties

| Property | Type | Description |
|---|---|---|
| `asyncValidations` | `string[]` | Array of async validator names registered via `registerAsyncValidations()` |
| `asyncValidationDebounceMs` | `number` | Debounce delay in milliseconds before triggering async validation |

### Full Example: Server-Side Uniqueness Check

```typescript
import {
  registerValidations,
  registerAsyncValidations,
  createMinLengthValidation,
  AsyncValidationFunction,
} from "@bghcore/dynamic-forms-core";

// Register sync validators first (fast fail)
registerValidations({
  MinLength3: createMinLengthValidation(3),
});

// Register async validator
const checkUsernameAvailable: AsyncValidationFunction = async (value, entityData, signal) => {
  if (!value || typeof value !== "string" || value.length < 3) return undefined;

  try {
    const response = await fetch(
      `/api/users/check-username?username=${encodeURIComponent(value)}`,
      { signal }
    );
    if (signal?.aborted) return undefined;
    const data = await response.json();
    return data.available ? undefined : `Username "${value}" is already taken`;
  } catch (err) {
    if (signal?.aborted) return undefined;
    return "Unable to verify username availability";
  }
};

registerAsyncValidations({
  CheckUsernameAvailable: checkUsernameAvailable,
});
```

Field config:
```json
{
  "username": {
    "component": "Textbox",
    "label": "Username",
    "required": true,
    "validations": ["MinLength3", "NoSpecialCharactersValidation"],
    "asyncValidations": ["CheckUsernameAvailable"],
    "asyncValidationDebounceMs": 500
  }
}
```

---

## Cross-Field Validators

Cross-field validators receive all form values and can validate relationships between multiple fields. Unlike regular validators that only see their own field's value, cross-field validators have access to the full entity data.

### Registration

```typescript
import { registerCrossFieldValidations, CrossFieldValidationFunction } from "@bghcore/dynamic-forms-core";

const dateRangeValidation: CrossFieldValidationFunction = (values, fieldName) => {
  const startDate = values["startDate"] as string;
  const endDate = values["endDate"] as string;

  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    return "End date must be after start date";
  }
  return undefined;
};

const passwordConfirmation: CrossFieldValidationFunction = (values, fieldName) => {
  const password = values["password"] as string;
  const confirmPassword = values["confirmPassword"] as string;

  if (password && confirmPassword && password !== confirmPassword) {
    return "Passwords do not match";
  }
  return undefined;
};

registerCrossFieldValidations({
  DateRangeCheck: dateRangeValidation,
  PasswordMatch: passwordConfirmation,
});
```

### Function Signature

```typescript
type CrossFieldValidationFunction = (
  values: IEntityData,
  fieldName: string
) => string | undefined;
```

- **`values`**: All current form values (`Record<string, unknown>`).
- **`fieldName`**: The name of the field being validated. Useful for writing generic validators that need to know which field they are attached to.

### How They Differ from Regular Validators

| Aspect | Regular Validators | Cross-Field Validators |
|---|---|---|
| Input | Single field value | All form values + field name |
| Config key | `validations` | `crossFieldValidations` |
| Scope | Own field only | Full form context |
| Async support | Yes (separate registry) | No (sync only) |
| Registration | `registerValidations()` | `registerCrossFieldValidations()` |

### Field Config Property

```json
{
  "endDate": {
    "component": "DateControl",
    "label": "End Date",
    "crossFieldValidations": ["DateRangeCheck"]
  }
}
```

### Example: Date Range Validation

```typescript
const dateRangeValidation: CrossFieldValidationFunction = (values, fieldName) => {
  // This validator is placed on "endDate" but reads "startDate"
  const startDate = values["startDate"] as string;
  const endDate = values["endDate"] as string;

  if (!startDate || !endDate) return undefined;

  if (new Date(endDate) <= new Date(startDate)) {
    return "End date must be after the start date";
  }

  return undefined;
};
```

### Example: Conditional Sum Limit

```typescript
const budgetLimitValidation: CrossFieldValidationFunction = (values, fieldName) => {
  const hardware = (values["hardwareBudget"] as number) || 0;
  const software = (values["softwareBudget"] as number) || 0;
  const totalBudget = (values["totalBudget"] as number) || 0;

  if (hardware + software > totalBudget) {
    return `Combined budget ($${hardware + software}) exceeds total budget ($${totalBudget})`;
  }

  return undefined;
};
```

---

## Custom Validator Patterns

### Writing a Sync Validator

A sync validator is a function that takes a value and optional entity data, and returns `undefined` for valid or a `string` error message for invalid.

```typescript
import { registerValidations, ValidationFunction } from "@bghcore/dynamic-forms-core";

// Simple value-only validator
const noWhitespace: ValidationFunction = (value) => {
  if (!value || typeof value !== "string") return undefined;
  return /\s/.test(value) ? "Value must not contain whitespace" : undefined;
};

// Validator using entity data (cross-field awareness in a sync validator)
const greaterThanMinimum: ValidationFunction = (value, entityData) => {
  if (value == null || value === "") return undefined;
  const num = Number(value);
  const minimum = Number(entityData?.["minimumValue"]) || 0;
  if (isNaN(num)) return "Must be a number";
  return num <= minimum ? `Must be greater than ${minimum}` : undefined;
};

registerValidations({
  NoWhitespace: noWhitespace,
  GreaterThanMinimum: greaterThanMinimum,
});
```

### Writing an Async Validator

An async validator returns a `Promise<string | undefined>`. Always handle the `AbortSignal` parameter.

```typescript
import { registerAsyncValidations, AsyncValidationFunction } from "@bghcore/dynamic-forms-core";

const validatePostalCode: AsyncValidationFunction = async (value, entityData, signal) => {
  if (!value || typeof value !== "string") return undefined;

  const country = entityData?.["country"] as string;
  if (!country) return undefined;

  try {
    const res = await fetch(`/api/validate-postal?code=${value}&country=${country}`, { signal });
    if (signal?.aborted) return undefined;
    const data = await res.json();
    return data.valid ? undefined : `Invalid postal code for ${country}`;
  } catch {
    if (signal?.aborted) return undefined;
    return "Could not validate postal code";
  }
};

registerAsyncValidations({
  ValidatePostalCode: validatePostalCode,
});
```

### Return Value Convention

- Return `undefined` to indicate the value is **valid**.
- Return a `string` to indicate the value is **invalid** -- the string is the error message displayed to the user.
- For async validators, return `undefined` if the signal is aborted (prevent stale error messages).

### Multiple Validators on a Single Field

A field can specify multiple validators. They run in order; the first error is displayed first, and subsequent errors are appended with ` & `.

```json
{
  "projectId": {
    "component": "Textbox",
    "label": "Project ID",
    "required": true,
    "validations": ["NoSpecialCharactersValidation", "MinLength5", "MaxLength20"]
  }
}
```

If the value is `"A B"`, the combined error message would be: `"Special characters are not allowed"` (if spaces were treated as special -- note: spaces are actually allowed by `NoSpecialCharactersValidation`). If the value is `"AB"`, the error would be: `"Must be at least 5 characters"`.

Multiple errors are concatenated: `"Error 1 & Error 2"`.

### Registration API Reference

```typescript
// Sync validators
function registerValidations(custom: Record<string, ValidationFunction>): void;
function getValidation(name: string): ValidationFunction | undefined;
function getValidationRegistry(): Record<string, ValidationFunction>;

// Async validators
function registerAsyncValidations(custom: Record<string, AsyncValidationFunction>): void;
function getAsyncValidation(name: string): AsyncValidationFunction | undefined;
function getAsyncValidationRegistry(): Record<string, AsyncValidationFunction>;

// Cross-field validators
function registerCrossFieldValidations(custom: Record<string, CrossFieldValidationFunction>): void;
function getCrossFieldValidation(name: string): CrossFieldValidationFunction | undefined;
```

**Important:** `registerValidations()`, `registerAsyncValidations()`, and `registerCrossFieldValidations()` **merge** into the existing registry -- they do not replace it. Call them at application startup before rendering any forms. Registering a name that already exists overwrites the previous validator for that name.
