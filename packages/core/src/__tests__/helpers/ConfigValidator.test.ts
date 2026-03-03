import { describe, it, expect, vi, afterEach } from "vitest";
import { validateFieldConfigs } from "../../helpers/ConfigValidator";
import { Dictionary } from "../../utils";
import { IFieldConfig } from "../../types/IFieldConfig";
import { registerValidations, registerAsyncValidations } from "../../helpers/ValidationRegistry";

describe("ConfigValidator", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty array for valid simple config", () => {
    // Suppress cycle detection warnings
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const configs: Dictionary<IFieldConfig> = {
      name: { component: "Textbox", required: true, label: "Name" },
      status: { component: "Dropdown", required: true, label: "Status", dropdownOptions: [{ key: "Active", text: "Active" }] },
    };

    const errors = validateFieldConfigs(configs);
    expect(errors).toHaveLength(0);
  });

  it("detects dependency targeting non-existent field", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const configs: Dictionary<IFieldConfig> = {
      status: {
        component: "Dropdown",
        label: "Status",
        dependencies: {
          Active: {
            nonExistent: { required: true },
          },
        },
      },
    };

    const errors = validateFieldConfigs(configs);
    const depErrors = errors.filter(e => e.type === "missing_dependency_target");
    expect(depErrors.length).toBeGreaterThan(0);
    expect(depErrors[0].message).toContain("nonExistent");
  });

  it("detects combo rule depending on non-existent field", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const configs: Dictionary<IFieldConfig> = {
      notes: {
        component: "Textbox",
        label: "Notes",
        dependencyRules: {
          updatedConfig: { required: true },
          rules: {
            nonExistentField: ["value1"],
          },
        },
      },
    };

    const errors = validateFieldConfigs(configs);
    const depErrors = errors.filter(e => e.type === "missing_dependency_target");
    expect(depErrors.length).toBeGreaterThan(0);
    expect(depErrors[0].message).toContain("nonExistentField");
  });

  it("detects dropdown dependency targeting non-existent field", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const configs: Dictionary<IFieldConfig> = {
      country: {
        component: "Dropdown",
        label: "Country",
        dropdownOptions: [{ key: "US", text: "US" }],
        dropdownDependencies: {
          US: {
            nonExistentRegion: ["East", "West"],
          },
        },
      },
    };

    const errors = validateFieldConfigs(configs);
    const depErrors = errors.filter(e => e.type === "missing_dependency_target");
    expect(depErrors.length).toBeGreaterThan(0);
    expect(depErrors[0].message).toContain("nonExistentRegion");
  });

  it("detects unregistered component type when registry provided", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const configs: Dictionary<IFieldConfig> = {
      field: { component: "CustomWidget", label: "Field" },
    };

    const registeredComponents = new Set(["Textbox", "Dropdown"]);
    const errors = validateFieldConfigs(configs, registeredComponents);
    const compErrors = errors.filter(e => e.type === "unregistered_component");
    expect(compErrors.length).toBeGreaterThan(0);
    expect(compErrors[0].message).toContain("CustomWidget");
    expect(compErrors[0].message).toContain("Textbox");
  });

  it("does not flag component types when no registry provided", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const configs: Dictionary<IFieldConfig> = {
      field: { component: "CustomWidget", label: "Field" },
    };

    const errors = validateFieldConfigs(configs);
    const compErrors = errors.filter(e => e.type === "unregistered_component");
    expect(compErrors).toHaveLength(0);
  });

  it("detects unregistered validation name", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const configs: Dictionary<IFieldConfig> = {
      email: {
        component: "Textbox",
        label: "Email",
        validations: ["EmailValidation", "NonExistentValidation"],
      },
    };

    const errors = validateFieldConfigs(configs);
    const valErrors = errors.filter(e => e.type === "unregistered_validation");
    expect(valErrors).toHaveLength(1);
    expect(valErrors[0].message).toContain("NonExistentValidation");
  });

  it("does not flag registered validation names", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const configs: Dictionary<IFieldConfig> = {
      email: {
        component: "Textbox",
        label: "Email",
        validations: ["EmailValidation"],
      },
    };

    const errors = validateFieldConfigs(configs);
    const valErrors = errors.filter(e => e.type === "unregistered_validation");
    expect(valErrors).toHaveLength(0);
  });

  it("detects unregistered async validation name", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const configs: Dictionary<IFieldConfig> = {
      username: {
        component: "Textbox",
        label: "Username",
        asyncValidations: ["CheckUniqueUsername"],
      },
    };

    const errors = validateFieldConfigs(configs);
    const asyncErrors = errors.filter(e => e.type === "unregistered_async_validation");
    expect(asyncErrors).toHaveLength(1);
    expect(asyncErrors[0].message).toContain("CheckUniqueUsername");
  });

  it("does not flag registered async validation names", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    registerAsyncValidations({
      CheckUniqueUsername: async () => undefined,
    });

    const configs: Dictionary<IFieldConfig> = {
      username: {
        component: "Textbox",
        label: "Username",
        asyncValidations: ["CheckUniqueUsername"],
      },
    };

    const errors = validateFieldConfigs(configs);
    const asyncErrors = errors.filter(e => e.type === "unregistered_async_validation");
    expect(asyncErrors).toHaveLength(0);
  });

  it("detects circular dependencies", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const configs: Dictionary<IFieldConfig> = {
      fieldA: {
        component: "Dropdown",
        label: "A",
        dropdownOptions: [{ key: "x", text: "X" }],
        dependencies: {
          x: { fieldB: { required: true } },
        },
      },
      fieldB: {
        component: "Dropdown",
        label: "B",
        dropdownOptions: [{ key: "y", text: "Y" }],
        dependencies: {
          y: { fieldA: { required: true } },
        },
      },
    };

    const errors = validateFieldConfigs(configs);
    const cycleErrors = errors.filter(e => e.type === "circular_dependency");
    expect(cycleErrors.length).toBeGreaterThan(0);
  });

  it("warns about dropdown without options and no incoming dependency", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const configs: Dictionary<IFieldConfig> = {
      status: {
        component: "Dropdown",
        label: "Status",
        // No dropdownOptions, no dropdownDependencies
      },
    };

    const errors = validateFieldConfigs(configs);
    const ddErrors = errors.filter(e => e.type === "missing_dropdown_options");
    expect(ddErrors).toHaveLength(1);
    expect(ddErrors[0].message).toContain("no dropdown options");
  });

  it("does not warn about dropdown with options from another field's dependency", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const configs: Dictionary<IFieldConfig> = {
      country: {
        component: "Dropdown",
        label: "Country",
        dropdownOptions: [{ key: "US", text: "US" }],
        dropdownDependencies: {
          US: { region: ["East", "West"] },
        },
      },
      region: {
        component: "Dropdown",
        label: "Region",
        // No options, but country's dropdownDependencies provides them
      },
    };

    const errors = validateFieldConfigs(configs);
    const ddErrors = errors.filter(e => e.type === "missing_dropdown_options" && e.fieldName === "region");
    expect(ddErrors).toHaveLength(0);
  });

  it("handles empty config", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const errors = validateFieldConfigs({});
    expect(errors).toHaveLength(0);
  });
});
