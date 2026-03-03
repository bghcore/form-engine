import { Dictionary } from "../../utils";
import { IFieldConfig } from "../../types/IFieldConfig";

/** Simple text field with no dependencies */
export const simpleTextFieldConfigs: Dictionary<IFieldConfig> = {
  name: {
    component: "Textbox",
    required: true,
    label: "Name",
  },
  description: {
    component: "Textbox",
    required: false,
    label: "Description",
  },
};

/** Fields with a single dependency: when status="Active", priority becomes required */
export const singleDependencyConfigs: Dictionary<IFieldConfig> = {
  status: {
    component: "Dropdown",
    required: true,
    label: "Status",
    dropdownOptions: [
      { key: "Active", text: "Active" },
      { key: "Inactive", text: "Inactive" },
    ],
    dependencies: {
      Active: {
        priority: { required: true },
      },
      Inactive: {
        priority: { required: false, hidden: true },
      },
    },
  },
  priority: {
    component: "Dropdown",
    required: false,
    label: "Priority",
    dropdownOptions: [
      { key: "High", text: "High" },
      { key: "Medium", text: "Medium" },
      { key: "Low", text: "Low" },
    ],
  },
};

/** Fields with combo (AND) rules: notes required only when status=Active AND type=Bug */
export const comboDependencyConfigs: Dictionary<IFieldConfig> = {
  status: {
    component: "Dropdown",
    required: true,
    label: "Status",
    dropdownOptions: [
      { key: "Active", text: "Active" },
      { key: "Closed", text: "Closed" },
    ],
  },
  type: {
    component: "Dropdown",
    required: true,
    label: "Type",
    dropdownOptions: [
      { key: "Bug", text: "Bug" },
      { key: "Feature", text: "Feature" },
    ],
  },
  notes: {
    component: "Textbox",
    required: false,
    label: "Notes",
    dependencyRules: {
      updatedConfig: { required: true },
      rules: {
        status: ["Active"],
        type: ["Bug"],
      },
    },
  },
};

/** Fields with dropdown dependencies: region dropdown filtered by country */
export const dropdownDependencyConfigs: Dictionary<IFieldConfig> = {
  country: {
    component: "Dropdown",
    required: true,
    label: "Country",
    dropdownOptions: [
      { key: "US", text: "US" },
      { key: "CA", text: "CA" },
    ],
    dropdownDependencies: {
      US: {
        region: ["East", "West", "Central"],
      },
      CA: {
        region: ["Ontario", "Quebec", "BC"],
      },
    },
  },
  region: {
    component: "Dropdown",
    required: true,
    label: "Region",
    dropdownOptions: [],
  },
};

/** Fields with order dependencies: field order changes based on type value */
export const orderDependencyConfigs: Dictionary<IFieldConfig> = {
  type: {
    component: "Dropdown",
    required: true,
    label: "Type",
    dropdownOptions: [
      { key: "Bug", text: "Bug" },
      { key: "Feature", text: "Feature" },
    ],
    orderDependencies: {
      Bug: ["type", "severity", "steps", "description"],
      Feature: ["type", "description", "priority"],
    },
  },
  severity: {
    component: "Dropdown",
    required: false,
    label: "Severity",
    dropdownOptions: [
      { key: "Critical", text: "Critical" },
      { key: "Major", text: "Major" },
      { key: "Minor", text: "Minor" },
    ],
  },
  steps: {
    component: "Textbox",
    required: false,
    label: "Steps to Reproduce",
  },
  description: {
    component: "Textbox",
    required: false,
    label: "Description",
  },
  priority: {
    component: "Dropdown",
    required: false,
    label: "Priority",
    dropdownOptions: [
      { key: "High", text: "High" },
      { key: "Low", text: "Low" },
    ],
  },
};

/** Fields with hidden and readonly attributes */
export const hiddenReadonlyConfigs: Dictionary<IFieldConfig> = {
  id: {
    component: "Textbox",
    required: false,
    isReadonly: true,
    label: "ID",
  },
  secret: {
    component: "Textbox",
    required: false,
    hidden: true,
    label: "Secret",
  },
  name: {
    component: "Textbox",
    required: true,
    label: "Name",
  },
};

/** Field with value function */
export const valueFunctionConfigs: Dictionary<IFieldConfig> = {
  createdDate: {
    component: "DateControl",
    required: false,
    isReadonly: true,
    isValueFunction: true,
    value: "setDate",
    onlyOnCreate: true,
    label: "Created Date",
  },
  modifiedDate: {
    component: "DateControl",
    required: false,
    isReadonly: true,
    isValueFunction: true,
    value: "setDate",
    label: "Modified Date",
  },
  name: {
    component: "Textbox",
    required: true,
    label: "Name",
    dependencies: {
      "test": {
        modifiedDate: { isValueFunction: true, value: "setDate" },
      },
    },
  },
};

/** Fields with validations */
export const validationConfigs: Dictionary<IFieldConfig> = {
  email: {
    component: "Textbox",
    required: true,
    label: "Email",
    validations: ["EmailValidation"],
  },
  phone: {
    component: "Textbox",
    required: false,
    label: "Phone",
    validations: ["PhoneNumberValidation"],
  },
  website: {
    component: "Textbox",
    required: false,
    label: "Website",
    validations: ["isValidUrl"],
  },
};

/** Fields with confirmInput flag */
export const confirmInputConfigs: Dictionary<IFieldConfig> = {
  trigger: {
    component: "Dropdown",
    required: true,
    label: "Trigger",
    dropdownOptions: [
      { key: "Yes", text: "Yes" },
      { key: "No", text: "No" },
    ],
    dependencies: {
      Yes: {
        confirmed: { confirmInput: true },
      },
      No: {
        confirmed: { confirmInput: false },
      },
    },
  },
  confirmed: {
    component: "Textbox",
    required: false,
    confirmInput: false,
    label: "Confirmed Field",
  },
};

/** Fields with component swap dependency */
export const componentSwapConfigs: Dictionary<IFieldConfig> = {
  mode: {
    component: "Dropdown",
    required: true,
    label: "Mode",
    dropdownOptions: [
      { key: "simple", text: "Simple" },
      { key: "advanced", text: "Advanced" },
    ],
    dependencies: {
      simple: {
        detail: { component: "Textbox" },
      },
      advanced: {
        detail: { component: "PopOutEditor" },
      },
    },
  },
  detail: {
    component: "Textbox",
    required: false,
    label: "Detail",
  },
};

/** Fields with deprecated dropdown options */
export const deprecatedDropdownConfigs: Dictionary<IFieldConfig> = {
  category: {
    component: "Dropdown",
    required: true,
    label: "Category",
    dropdownOptions: [
      { key: "A", text: "A" },
      { key: "B", text: "B" },
    ],
    deprecatedDropdownOptions: [
      { oldVal: "C", newVal: "A" },
    ],
  },
};

/** Fields for DynamicFragment (hidden by default) */
export const fragmentConfigs: Dictionary<IFieldConfig> = {
  fragment: {
    component: "DynamicFragment",
    label: "Fragment",
  },
  name: {
    component: "Textbox",
    required: true,
    label: "Name",
  },
};

/** Circular dependency configs (for cycle detection tests) */
export const circularDependencyConfigs: Dictionary<IFieldConfig> = {
  fieldA: {
    component: "Dropdown",
    required: false,
    label: "Field A",
    dropdownOptions: [
      { key: "x", text: "X" },
    ],
    dependencies: {
      x: {
        fieldB: { required: true },
      },
    },
  },
  fieldB: {
    component: "Dropdown",
    required: false,
    label: "Field B",
    dropdownOptions: [
      { key: "y", text: "Y" },
    ],
    dependencies: {
      y: {
        fieldA: { required: true },
      },
    },
  },
};

/** All fields readonly scenario */
export const allReadonlyConfigs: Dictionary<IFieldConfig> = {
  name: {
    component: "Textbox",
    required: true,
    label: "Name",
  },
  status: {
    component: "Dropdown",
    required: false,
    label: "Status",
    dropdownOptions: [
      { key: "Open", text: "Open" },
      { key: "Closed", text: "Closed" },
    ],
  },
};

/** Fields with nested order dependencies (recursive) */
export const nestedOrderDependencyConfigs: Dictionary<IFieldConfig> = {
  category: {
    component: "Dropdown",
    required: true,
    label: "Category",
    dropdownOptions: [
      { key: "A", text: "A" },
      { key: "B", text: "B" },
    ],
    orderDependencies: {
      A: {
        subcategory: {
          A1: ["category", "subcategory", "name"],
          A2: ["category", "subcategory", "description"],
        },
      },
      B: ["category", "name", "description"],
    },
  },
  subcategory: {
    component: "Dropdown",
    required: false,
    label: "Subcategory",
    dropdownOptions: [
      { key: "A1", text: "A1" },
      { key: "A2", text: "A2" },
    ],
  },
  name: {
    component: "Textbox",
    required: true,
    label: "Name",
  },
  description: {
    component: "Textbox",
    required: false,
    label: "Description",
  },
};

/** multiselect fields with dropdown deps */
export const multiselectConfigs: Dictionary<IFieldConfig> = {
  tags: {
    component: "Multiselect",
    required: false,
    label: "Tags",
    dropdownOptions: [
      { key: "frontend", text: "Frontend" },
      { key: "backend", text: "Backend" },
      { key: "design", text: "Design" },
    ],
  },
};

/** Default value configs */
export const defaultValueConfigs: Dictionary<IFieldConfig> = {
  status: {
    component: "Dropdown",
    required: true,
    label: "Status",
    defaultValue: "Open",
    dropdownOptions: [
      { key: "Open", text: "Open" },
      { key: "Closed", text: "Closed" },
    ],
  },
  name: {
    component: "Textbox",
    required: true,
    label: "Name",
  },
};
