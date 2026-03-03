import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  GetChildEntity,
  IsExpandVisible,
  GetConfirmInputModalProps,
  GetValueFunctionsOnDirtyFields,
  GetValueFunctionsOnCreate,
  CheckFieldValidationRules,
  CheckIsDeprecated,
  ShowField,
  GetFieldsToRender,
  CheckDefaultValues,
  CheckDeprecatedDropdownOptions,
  CheckValidDropdownOptions,
  CombineSchemaConfig,
  ExecuteValueFunction,
  InitOnEditBusinessRules,
} from "../../helpers/HookInlineFormHelper";
import { Dictionary, IEntityData } from "../../utils";
import { IBusinessRule } from "../../types/IBusinessRule";
import { IFieldConfig } from "../../types/IFieldConfig";
import { HookInlineFormConstants } from "../../constants";
import { deprecatedDropdownConfigs, multiselectConfigs } from "../__fixtures__/fieldConfigs";

describe("HookInlineFormHelper", () => {
  describe("GetChildEntity", () => {
    const parentEntity: IEntityData = {
      items: [
        { id: "child-1", name: "First" },
        { id: "child-2", name: "Second" },
        { id: "child-3", name: "Third" },
      ],
    };

    it("finds and returns the child entity with Parent reference when exactly one match", () => {
      const result = GetChildEntity("child-2", parentEntity, "items");
      expect(result).toBeDefined();
      expect(result!.id).toBe("child-2");
      expect(result!.name).toBe("Second");
      expect(result!.Parent).toEqual(parentEntity);
    });

    it("returns undefined when entityId does not match any child", () => {
      const result = GetChildEntity("nonexistent", parentEntity, "items");
      expect(result).toBeUndefined();
    });

    it("returns undefined when entity is undefined", () => {
      const result = GetChildEntity("child-1", undefined, "items");
      expect(result).toBeUndefined();
    });

    it("returns undefined when entityPath is undefined", () => {
      const result = GetChildEntity("child-1", parentEntity, undefined);
      expect(result).toBeUndefined();
    });

    it("returns undefined when multiple children match (ambiguous)", () => {
      const entityWithDuplicates: IEntityData = {
        items: [
          { id: "dup", name: "First" },
          { id: "dup", name: "Second" },
        ],
      };
      const result = GetChildEntity("dup", entityWithDuplicates, "items");
      expect(result).toBeUndefined();
    });

    it("supports custom idField parameter", () => {
      const entityWithCustomId: IEntityData = {
        records: [
          { code: "REC-1", title: "Record One" },
          { code: "REC-2", title: "Record Two" },
        ],
      };
      const result = GetChildEntity("REC-1", entityWithCustomId, "records", "code");
      expect(result).toBeDefined();
      expect(result!.code).toBe("REC-1");
      expect(result!.title).toBe("Record One");
    });
  });

  describe("IsExpandVisible", () => {
    it("returns true when visible (non-hidden) fields exceed the default cutoff", () => {
      const rules: Dictionary<IBusinessRule> = {};
      // default cutoff is 12, create 13 non-hidden fields
      for (let i = 0; i < 13; i++) {
        rules[`field${i}`] = { hidden: false };
      }
      expect(IsExpandVisible(rules)).toBe(true);
    });

    it("returns false when visible fields are at or below the default cutoff", () => {
      const rules: Dictionary<IBusinessRule> = {};
      for (let i = 0; i < 12; i++) {
        rules[`field${i}`] = { hidden: false };
      }
      expect(IsExpandVisible(rules)).toBe(false);
    });

    it("does not count hidden fields", () => {
      const rules: Dictionary<IBusinessRule> = {};
      for (let i = 0; i < 20; i++) {
        rules[`field${i}`] = { hidden: true };
      }
      // 0 visible fields, should not exceed cutoff
      expect(IsExpandVisible(rules)).toBe(false);
    });

    it("uses custom expandCutoffCount when provided", () => {
      const rules: Dictionary<IBusinessRule> = {
        field1: { hidden: false },
        field2: { hidden: false },
        field3: { hidden: false },
      };
      // cutoff of 2, 3 visible fields -> should be visible
      expect(IsExpandVisible(rules, 2)).toBe(true);
      // cutoff of 3, 3 visible fields -> should NOT be visible
      expect(IsExpandVisible(rules, 3)).toBe(false);
    });
  });

  describe("GetConfirmInputModalProps", () => {
    it("builds confirmInput props from dirty fields with confirm dependencies", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        trigger: {
          dependentFields: ["confirmed"],
        },
        confirmed: {
          confirmInput: true,
        },
      };

      const result = GetConfirmInputModalProps(["trigger"], fieldRules);

      expect(result.confirmInputsTriggeredBy).toBe("trigger");
      expect(result.dependentFieldNames).toEqual(["confirmed"]);
      expect(result.otherDirtyFields).toEqual([]);
    });

    it("includes other dirty fields that are not the trigger or confirm dependents", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        trigger: {
          dependentFields: ["confirmed"],
        },
        confirmed: {
          confirmInput: true,
        },
        otherField: {},
      };

      const result = GetConfirmInputModalProps(["trigger", "otherField"], fieldRules);

      expect(result.confirmInputsTriggeredBy).toBe("trigger");
      expect(result.dependentFieldNames).toEqual(["confirmed"]);
      expect(result.otherDirtyFields).toEqual(["otherField"]);
    });

    it("returns empty props when no dirty fields have confirm dependencies", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        fieldA: { dependentFields: ["fieldB"] },
        fieldB: { confirmInput: false },
      };

      const result = GetConfirmInputModalProps(["fieldA"], fieldRules);

      expect(result.confirmInputsTriggeredBy).toBeUndefined();
      expect(result.dependentFieldNames).toBeUndefined();
    });

    it("collects multiple confirm dependents from a single trigger", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        trigger: {
          dependentFields: ["confirm1", "confirm2"],
        },
        confirm1: { confirmInput: true },
        confirm2: { confirmInput: true },
      };

      const result = GetConfirmInputModalProps(["trigger"], fieldRules);

      expect(result.confirmInputsTriggeredBy).toBe("trigger");
      expect(result.dependentFieldNames).toEqual(["confirm1", "confirm2"]);
    });
  });

  describe("GetValueFunctionsOnDirtyFields", () => {
    it("finds value functions on dependents of dirty fields", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        name: {
          dependentFields: ["modifiedDate"],
        },
        modifiedDate: {
          valueFunction: "setDate",
        },
      };

      const result = GetValueFunctionsOnDirtyFields(["name"], fieldRules);

      expect(result).toEqual([
        { fieldName: "modifiedDate", valueFunction: "setDate" },
      ]);
    });

    it("excludes dependents that are themselves dirty", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        name: {
          dependentFields: ["modifiedDate"],
        },
        modifiedDate: {
          valueFunction: "setDate",
        },
      };

      // Both name and modifiedDate are dirty
      const result = GetValueFunctionsOnDirtyFields(["name", "modifiedDate"], fieldRules);

      expect(result).toEqual([]);
    });

    it("excludes dependents with onlyOnCreate flag", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        name: {
          dependentFields: ["createdDate"],
        },
        createdDate: {
          valueFunction: "setDate",
          onlyOnCreate: true,
        },
      };

      const result = GetValueFunctionsOnDirtyFields(["name"], fieldRules);

      expect(result).toEqual([]);
    });

    it("excludes dependents with empty valueFunction", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        name: {
          dependentFields: ["otherField"],
        },
        otherField: {
          valueFunction: "",
        },
      };

      const result = GetValueFunctionsOnDirtyFields(["name"], fieldRules);

      expect(result).toEqual([]);
    });

    it("returns empty array when no dirty fields have dependents with value functions", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        name: {},
      };

      const result = GetValueFunctionsOnDirtyFields(["name"], fieldRules);

      expect(result).toEqual([]);
    });
  });

  describe("GetValueFunctionsOnCreate", () => {
    it("finds onlyOnCreate value functions", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        createdDate: {
          valueFunction: "setDate",
          onlyOnCreate: true,
        },
        modifiedDate: {
          valueFunction: "setDate",
          onlyOnCreate: false,
        },
        name: {},
      };

      const result = GetValueFunctionsOnCreate(fieldRules);

      expect(result).toEqual([
        { fieldName: "createdDate", valueFunction: "setDate" },
      ]);
    });

    it("returns empty array when no fields have onlyOnCreate", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        modifiedDate: {
          valueFunction: "setDate",
        },
        name: {},
      };

      const result = GetValueFunctionsOnCreate(fieldRules);

      expect(result).toEqual([]);
    });

    it("excludes fields with empty or missing valueFunction even if onlyOnCreate is true", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        field1: {
          valueFunction: "",
          onlyOnCreate: true,
        },
        field2: {
          onlyOnCreate: true,
          // valueFunction not set
        },
      };

      const result = GetValueFunctionsOnCreate(fieldRules);

      expect(result).toEqual([]);
    });
  });

  describe("CheckFieldValidationRules", () => {
    it("returns undefined when all validations pass", () => {
      const result = CheckFieldValidationRules(
        "user@example.com",
        {},
        ["EmailValidation"]
      );
      expect(result).toBeUndefined();
    });

    it("returns the error message when a single validation fails", () => {
      const result = CheckFieldValidationRules(
        "not-an-email",
        {},
        ["EmailValidation"]
      );
      expect(result).toBe("Invalid email address");
    });

    it("concatenates errors from multiple failing validations", () => {
      const result = CheckFieldValidationRules(
        "abc",
        {},
        ["EmailValidation", "isValidUrl"]
      );
      expect(result).toBe("Invalid email address & Invalid URL");
    });

    it("returns undefined when validations array is empty", () => {
      const result = CheckFieldValidationRules("anything", {}, []);
      expect(result).toBeUndefined();
    });

    it("skips unknown validators gracefully", () => {
      const result = CheckFieldValidationRules(
        "test@example.com",
        {},
        ["NonExistentValidator", "EmailValidation"]
      );
      // NonExistentValidator returns undefined, EmailValidation passes
      expect(result).toBeUndefined();
    });

    it("handles mix of passing, failing, and unknown validators", () => {
      const result = CheckFieldValidationRules(
        "not-valid",
        {},
        ["NonExistentValidator", "EmailValidation", "isValidUrl"]
      );
      expect(result).toBe("Invalid email address & Invalid URL");
    });
  });

  describe("CheckIsDeprecated", () => {
    it("returns true when value is in deprecated options", () => {
      const fieldConfig = deprecatedDropdownConfigs.category;
      const result = CheckIsDeprecated("C", fieldConfig);
      expect(result).toBe(true);
    });

    it("returns false/undefined when value is not deprecated", () => {
      const fieldConfig = deprecatedDropdownConfigs.category;
      const result = CheckIsDeprecated("A", fieldConfig);
      expect(result).toBeFalsy();
    });

    it("returns undefined when fieldConfig has no deprecatedDropdownOptions", () => {
      const fieldConfig: IFieldConfig = {
        component: "Dropdown",
        label: "Test",
      };
      const result = CheckIsDeprecated("X", fieldConfig);
      expect(result).toBeUndefined();
    });
  });

  describe("ShowField", () => {
    it("returns true when filterText is undefined (no filter)", () => {
      expect(ShowField(undefined, "anything", "Any Label")).toBe(true);
    });

    it("returns true when filterText is empty string", () => {
      expect(ShowField("", "anything", "Any Label")).toBe(true);
    });

    it("returns true when value contains filterText (case-insensitive)", () => {
      expect(ShowField("test", "Test Value", "Label")).toBe(true);
      expect(ShowField("TEST", "test value", "Label")).toBe(true);
    });

    it("returns true when label contains filterText (case-insensitive)", () => {
      expect(ShowField("label", "some value", "My Label")).toBe(true);
      expect(ShowField("LABEL", "some value", "my label")).toBe(true);
    });

    it("returns false when neither value nor label match", () => {
      expect(ShowField("xyz", "abc", "def")).toBe(false);
    });

    it("handles object values by serializing to JSON", () => {
      expect(ShowField("hello", { greeting: "hello world" }, "Label")).toBe(true);
    });

    it("handles array values by serializing to JSON", () => {
      expect(ShowField("item1", ["item1", "item2"], "Label")).toBe(true);
    });

    it("handles null/undefined value gracefully", () => {
      expect(ShowField("test", undefined, "test label")).toBe(true);
      expect(ShowField("test", null, "test label")).toBe(true);
    });
  });

  describe("GetFieldsToRender", () => {
    const fieldOrder = ["field1", "field2", "field3", "field4", "field5"];
    const fieldRules: Dictionary<IBusinessRule> = {
      field1: { hidden: false },
      field2: { hidden: false },
      field3: { hidden: true },
      field4: { hidden: false },
      field5: { hidden: false },
    };

    it("returns all fields as not softHidden when fieldRenderLimit is 0 (no limit)", () => {
      const result = GetFieldsToRender(0, fieldOrder, fieldRules);

      expect(result).toHaveLength(5);
      result.forEach((field) => {
        expect(field.softHidden).toBe(false);
      });
    });

    it("respects field render limit and soft-hides fields beyond it", () => {
      // Limit to 2 visible fields. field3 is hidden so not counted.
      // field1 (visible, count=1), field2 (visible, count=2), field3 (hidden, skipped),
      // field4 (visible, but count=2 already => softHidden), field5 similarly
      const result = GetFieldsToRender(2, fieldOrder, fieldRules);

      expect(result).toHaveLength(4); // hidden field3 is skipped entirely
      expect(result[0]).toEqual({ fieldName: "field1", softHidden: false });
      expect(result[1]).toEqual({ fieldName: "field2", softHidden: false });
      expect(result[2]).toEqual({ fieldName: "field4", softHidden: true });
      expect(result[3]).toEqual({ fieldName: "field5", softHidden: true });
    });

    it("skips hidden fields (they do not appear in output when limit is set)", () => {
      const result = GetFieldsToRender(10, fieldOrder, fieldRules);

      // field3 is hidden, so it gets returned but not counted
      // Actually, looking at the code: hidden fields `return;` (skip entirely)
      // Wait - let me re-check the code flow:
      // if hidden -> return (skip, do not push)
      // else if count === limit -> push with softHidden true
      // else -> push with softHidden false, count++
      const fieldNames = result.map((f) => f.fieldName);
      expect(fieldNames).not.toContain("field3");
      expect(result).toHaveLength(4);
    });

    it("handles empty field order", () => {
      const result = GetFieldsToRender(5, [], fieldRules);
      expect(result).toEqual([]);
    });

    it("returns all fields without limit (fieldRenderLimit = 0)", () => {
      const result = GetFieldsToRender(0, ["a", "b", "c"]);

      expect(result).toEqual([
        { fieldName: "a", softHidden: false },
        { fieldName: "b", softHidden: false },
        { fieldName: "c", softHidden: false },
      ]);
    });
  });

  describe("CheckDefaultValues", () => {
    it("calls setValue for fields with defaultValue when form value is null", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        status: { defaultValue: "Open", hidden: false },
        name: { hidden: false },
      };

      const formValues: IEntityData = {
        status: null,
        name: "existing",
      };

      const setValue = vi.fn();

      CheckDefaultValues(fieldRules, formValues, setValue);

      expect(setValue).toHaveBeenCalledTimes(1);
      expect(setValue).toHaveBeenCalledWith("status", "Open", { shouldDirty: true });
    });

    it("does not call setValue when form value already exists", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        status: { defaultValue: "Open", hidden: false },
      };

      const formValues: IEntityData = {
        status: "Active",
      };

      const setValue = vi.fn();

      CheckDefaultValues(fieldRules, formValues, setValue);

      expect(setValue).not.toHaveBeenCalled();
    });

    it("does not call setValue when field is hidden", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        status: { defaultValue: "Open", hidden: true },
      };

      const formValues: IEntityData = {
        status: null,
      };

      const setValue = vi.fn();

      CheckDefaultValues(fieldRules, formValues, setValue);

      expect(setValue).not.toHaveBeenCalled();
    });

    it("does not call setValue when defaultValue is null/undefined", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        status: { defaultValue: undefined, hidden: false },
      };

      const formValues: IEntityData = {
        status: null,
      };

      const setValue = vi.fn();

      CheckDefaultValues(fieldRules, formValues, setValue);

      expect(setValue).not.toHaveBeenCalled();
    });

    it("does nothing when fieldRules is empty", () => {
      const setValue = vi.fn();
      CheckDefaultValues({}, { status: null }, setValue);
      expect(setValue).not.toHaveBeenCalled();
    });

    it("does nothing when formValues is empty", () => {
      const setValue = vi.fn();
      CheckDefaultValues(
        { status: { defaultValue: "Open", hidden: false } },
        {},
        setValue
      );
      expect(setValue).not.toHaveBeenCalled();
    });
  });

  describe("CheckDeprecatedDropdownOptions", () => {
    it("returns deprecated option for a Dropdown field when value is deprecated", () => {
      const fieldConfig: IFieldConfig = {
        component: HookInlineFormConstants.dropdown,
        label: "Category",
        dropdownOptions: [
          { key: "A", text: "A" },
          { key: "B", text: "B" },
        ],
        deprecatedDropdownOptions: [
          { oldVal: "C", newVal: "A" },
        ],
      };

      const activeOptions = [
        { key: "A", text: "A" },
        { key: "B", text: "B" },
      ];

      const result = CheckDeprecatedDropdownOptions(fieldConfig, activeOptions, "C");

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe("C");
      expect(result[0].text).toBe("C");
      expect(result[0].disabled).toBe(true);
      expect(result[0].data).toEqual({
        iconName: "Info",
        iconTitle: "This value has been Deprecated",
      });
    });

    it("returns empty array when the dropdown value is not deprecated", () => {
      const fieldConfig: IFieldConfig = {
        component: HookInlineFormConstants.dropdown,
        label: "Category",
        deprecatedDropdownOptions: [
          { oldVal: "C", newVal: "A" },
        ],
      };

      const activeOptions = [
        { key: "A", text: "A" },
        { key: "B", text: "B" },
      ];

      const result = CheckDeprecatedDropdownOptions(fieldConfig, activeOptions, "A");

      expect(result).toEqual([]);
    });

    it("returns empty array when value is already in active dropdown options", () => {
      const fieldConfig: IFieldConfig = {
        component: HookInlineFormConstants.dropdown,
        label: "Category",
        deprecatedDropdownOptions: [
          { oldVal: "A" },
        ],
      };

      const activeOptions = [
        { key: "A", text: "A" },
        { key: "B", text: "B" },
      ];

      // "A" is in active options, so even though it's deprecated, it is found in dropdown
      const result = CheckDeprecatedDropdownOptions(fieldConfig, activeOptions, "A");

      expect(result).toEqual([]);
    });

    it("handles StatusDropdown component type", () => {
      const fieldConfig: IFieldConfig = {
        component: HookInlineFormConstants.statusDropdown,
        label: "Status",
        deprecatedDropdownOptions: [
          { oldVal: "Legacy" },
        ],
      };

      const activeOptions = [
        { key: "Active", text: "Active" },
        { key: "Closed", text: "Closed" },
      ];

      const result = CheckDeprecatedDropdownOptions(fieldConfig, activeOptions, "Legacy");

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe("Legacy");
      expect(result[0].disabled).toBe(true);
    });

    it("returns deprecated options for multiselect when some values are deprecated", () => {
      const fieldConfig: IFieldConfig = {
        component: HookInlineFormConstants.multiselect,
        label: "Tags",
        deprecatedDropdownOptions: [
          { oldVal: "oldTag1" },
          { oldVal: "oldTag2" },
        ],
      };

      const activeOptions = [
        { key: "tag1", text: "Tag 1" },
        { key: "tag2", text: "Tag 2" },
      ];

      const result = CheckDeprecatedDropdownOptions(
        fieldConfig,
        activeOptions,
        ["tag1", "oldTag1", "oldTag2"]
      );

      expect(result).toHaveLength(2);
      expect(result[0].key).toBe("oldTag1");
      expect(result[0].disabled).toBe(true);
      expect(result[1].key).toBe("oldTag2");
      expect(result[1].disabled).toBe(true);
    });

    it("returns empty array for multiselect when no values are deprecated", () => {
      const fieldConfig: IFieldConfig = {
        component: HookInlineFormConstants.multiselect,
        label: "Tags",
        deprecatedDropdownOptions: [
          { oldVal: "oldTag" },
        ],
      };

      const activeOptions = [
        { key: "tag1", text: "Tag 1" },
        { key: "tag2", text: "Tag 2" },
      ];

      const result = CheckDeprecatedDropdownOptions(
        fieldConfig,
        activeOptions,
        ["tag1", "tag2"]
      );

      expect(result).toEqual([]);
    });

    it("returns empty array for non-dropdown/multiselect component types", () => {
      const fieldConfig: IFieldConfig = {
        component: "Textbox",
        label: "Name",
        deprecatedDropdownOptions: [
          { oldVal: "old" },
        ],
      };

      const result = CheckDeprecatedDropdownOptions(fieldConfig, [], "old");

      expect(result).toEqual([]);
    });
  });

  describe("CheckValidDropdownOptions", () => {
    it("clears dropdown value when it is not in options and not deprecated", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        status: {
          component: HookInlineFormConstants.dropdown,
          dropdownOptions: [
            { key: "Active", text: "Active" },
            { key: "Closed", text: "Closed" },
          ],
        },
      };
      const fieldConfigs: Dictionary<IFieldConfig> = {
        status: { component: HookInlineFormConstants.dropdown, label: "Status" },
      };
      const formValues: IEntityData = { status: "Invalid" };
      const setValue = vi.fn();

      CheckValidDropdownOptions(fieldRules, fieldConfigs, formValues, setValue);

      expect(setValue).toHaveBeenCalledWith("status", null, { shouldDirty: false });
    });

    it("does not clear dropdown value when it is in options", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        status: {
          component: HookInlineFormConstants.dropdown,
          dropdownOptions: [
            { key: "Active", text: "Active" },
            { key: "Closed", text: "Closed" },
          ],
        },
      };
      const fieldConfigs: Dictionary<IFieldConfig> = {
        status: { component: HookInlineFormConstants.dropdown, label: "Status" },
      };
      const formValues: IEntityData = { status: "Active" };
      const setValue = vi.fn();

      CheckValidDropdownOptions(fieldRules, fieldConfigs, formValues, setValue);

      expect(setValue).not.toHaveBeenCalled();
    });

    it("does not clear dropdown value when it is deprecated", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        status: {
          component: HookInlineFormConstants.dropdown,
          dropdownOptions: [
            { key: "Active", text: "Active" },
          ],
        },
      };
      const fieldConfigs: Dictionary<IFieldConfig> = {
        status: {
          component: HookInlineFormConstants.dropdown,
          label: "Status",
          deprecatedDropdownOptions: [{ oldVal: "Legacy" }],
        },
      };
      const formValues: IEntityData = { status: "Legacy" };
      const setValue = vi.fn();

      CheckValidDropdownOptions(fieldRules, fieldConfigs, formValues, setValue);

      expect(setValue).not.toHaveBeenCalled();
    });

    it("filters multiselect values to valid options", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        tags: {
          component: HookInlineFormConstants.multiselect,
          dropdownOptions: [
            { key: "a", text: "A" },
            { key: "b", text: "B" },
          ],
        },
      };
      const fieldConfigs: Dictionary<IFieldConfig> = {
        tags: { component: HookInlineFormConstants.multiselect, label: "Tags" },
      };
      const formValues: IEntityData = { tags: ["a", "b", "invalid"] };
      const setValue = vi.fn();

      CheckValidDropdownOptions(fieldRules, fieldConfigs, formValues, setValue);

      expect(setValue).toHaveBeenCalledWith("tags", ["a", "b"], { shouldDirty: false });
    });

    it("does not modify multiselect when all values are valid", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        tags: {
          component: HookInlineFormConstants.multiselect,
          dropdownOptions: [
            { key: "a", text: "A" },
            { key: "b", text: "B" },
          ],
        },
      };
      const fieldConfigs: Dictionary<IFieldConfig> = {
        tags: { component: HookInlineFormConstants.multiselect, label: "Tags" },
      };
      const formValues: IEntityData = { tags: ["a", "b"] };
      const setValue = vi.fn();

      CheckValidDropdownOptions(fieldRules, fieldConfigs, formValues, setValue);

      expect(setValue).not.toHaveBeenCalled();
    });

    it("does nothing when fieldRules is empty", () => {
      const setValue = vi.fn();
      CheckValidDropdownOptions({}, {}, { status: "X" }, setValue);
      expect(setValue).not.toHaveBeenCalled();
    });

    it("does nothing when formValues is empty", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        status: { component: HookInlineFormConstants.dropdown, dropdownOptions: [] },
      };
      const setValue = vi.fn();
      CheckValidDropdownOptions(fieldRules, {}, {}, setValue);
      expect(setValue).not.toHaveBeenCalled();
    });

    it("handles null form value for dropdown", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        status: {
          component: HookInlineFormConstants.dropdown,
          dropdownOptions: [{ key: "Active", text: "Active" }],
        },
      };
      const fieldConfigs: Dictionary<IFieldConfig> = {
        status: { component: HookInlineFormConstants.dropdown, label: "Status" },
      };
      const formValues: IEntityData = { status: null };
      const setValue = vi.fn();

      CheckValidDropdownOptions(fieldRules, fieldConfigs, formValues, setValue);

      expect(setValue).not.toHaveBeenCalled();
    });

    it("handles StatusDropdown component type", () => {
      const fieldRules: Dictionary<IBusinessRule> = {
        status: {
          component: HookInlineFormConstants.statusDropdown,
          dropdownOptions: [{ key: "Open", text: "Open" }],
        },
      };
      const fieldConfigs: Dictionary<IFieldConfig> = {
        status: { component: HookInlineFormConstants.statusDropdown, label: "Status" },
      };
      const formValues: IEntityData = { status: "Missing" };
      const setValue = vi.fn();

      CheckValidDropdownOptions(fieldRules, fieldConfigs, formValues, setValue);

      expect(setValue).toHaveBeenCalledWith("status", null, { shouldDirty: false });
    });
  });

  describe("CombineSchemaConfig", () => {
    it("merges defaultValue from schema into field configs", () => {
      const fieldConfigs: Dictionary<IFieldConfig> = {
        status: { component: "Dropdown", label: "Status" },
      };
      const schemaConfigs = {
        status: { defaultValue: "Open" },
      };

      const result = CombineSchemaConfig(fieldConfigs, schemaConfigs);

      expect(result.status.defaultValue).toBe("Open");
    });

    it("merges dropdown values from schema", () => {
      const fieldConfigs: Dictionary<IFieldConfig> = {
        status: { component: "Dropdown", label: "Status" },
      };
      const schemaConfigs = {
        status: {
          values: [
            { key: "Open", text: "Open" },
            { key: "Closed", text: "Closed" },
          ],
        },
      };

      const result = CombineSchemaConfig(fieldConfigs, schemaConfigs);

      expect(result.status.dropdownOptions).toHaveLength(2);
    });

    it("sets empty dropdownOptions when schema has no values", () => {
      const fieldConfigs: Dictionary<IFieldConfig> = {
        name: { component: "Textbox", label: "Name" },
      };
      const schemaConfigs = {
        name: {},
      };

      const result = CombineSchemaConfig(fieldConfigs, schemaConfigs);

      expect(result.name.dropdownOptions).toEqual([]);
    });

    it("handles boolean defaultValue wrapped in braces", () => {
      const fieldConfigs: Dictionary<IFieldConfig> = {
        active: { component: "Toggle", label: "Active" },
      };
      const schemaConfigs = {
        active: { defaultValue: "{true}", type: ["boolean"] },
      };

      const result = CombineSchemaConfig(fieldConfigs, schemaConfigs);

      expect(result.active.defaultValue).toBe(true);
    });

    it("handles number defaultValue wrapped in braces", () => {
      const fieldConfigs: Dictionary<IFieldConfig> = {
        count: { component: "Number", label: "Count" },
      };
      const schemaConfigs = {
        count: { defaultValue: "{42}", type: ["number"] },
      };

      const result = CombineSchemaConfig(fieldConfigs, schemaConfigs);

      expect(result.count.defaultValue).toBe(42);
    });

    it("handles string defaultValue wrapped in braces", () => {
      const fieldConfigs: Dictionary<IFieldConfig> = {
        name: { component: "Textbox", label: "Name" },
      };
      const schemaConfigs = {
        name: { defaultValue: "{'hello'}", type: ["string"] },
      };

      const result = CombineSchemaConfig(fieldConfigs, schemaConfigs);

      expect(result.name.defaultValue).toBe("hello");
    });

    it("merges dependency rules from schema", () => {
      const fieldConfigs: Dictionary<IFieldConfig> = {
        country: { component: "Dropdown", label: "Country" },
        region: { component: "Dropdown", label: "Region" },
      };
      const schemaConfigs = {
        country: {},
        region: {
          depdendencyRules: [{
            conditions: [{ fieldName: "country", fieldValue: "US" }],
            dependencyValues: ["East", "West"],
          }],
        },
      };

      const result = CombineSchemaConfig(fieldConfigs, schemaConfigs);

      expect(result.country.dropdownDependencies).toBeDefined();
      expect(result.country.dropdownDependencies!["US"]["region"]).toEqual(["East", "West"]);
    });

    it("merges deprecatedOptions from schema", () => {
      const fieldConfigs: Dictionary<IFieldConfig> = {
        status: { component: "Dropdown", label: "Status" },
      };
      const schemaConfigs = {
        status: {
          deprecatedOptions: [{ oldVal: "Legacy", newVal: "Active" }],
        },
      };

      const result = CombineSchemaConfig(fieldConfigs, schemaConfigs);

      expect(result.status.deprecatedDropdownOptions).toHaveLength(1);
      expect(result.status.deprecatedDropdownOptions![0].oldVal).toBe("Legacy");
    });

    it("does not mutate original fieldConfigs", () => {
      const fieldConfigs: Dictionary<IFieldConfig> = {
        name: { component: "Textbox", label: "Name" },
      };
      const schemaConfigs = {
        name: { defaultValue: "New" },
      };

      CombineSchemaConfig(fieldConfigs, schemaConfigs);

      expect(fieldConfigs.name.defaultValue).toBeUndefined();
    });
  });

  describe("ExecuteValueFunction", () => {
    it("delegates to the value function registry", () => {
      const result = ExecuteValueFunction("createdDate", "setDate");
      expect(result).toBeInstanceOf(Date);
    });

    it("returns undefined for unknown value function", () => {
      const result = ExecuteValueFunction("field", "unknownFunction");
      expect(result).toBeUndefined();
    });
  });

  describe("InitOnEditBusinessRules", () => {
    it("returns onLoadRules and initEntityData", () => {
      const fieldConfigs: Dictionary<IFieldConfig> = {
        name: { component: "Textbox", required: true, label: "Name" },
      };
      const defaultValues: IEntityData = { name: "Test" };
      const mockInitBusinessRules = vi.fn().mockReturnValue({
        fieldRules: { name: { component: "Textbox", required: true } },
        order: ["name"],
      });

      const result = InitOnEditBusinessRules(
        "testConfig",
        fieldConfigs,
        defaultValues,
        false,
        mockInitBusinessRules
      );

      expect(result.initEntityData).toBe(defaultValues);
      expect(result.onLoadRules).toBeDefined();
      expect(mockInitBusinessRules).toHaveBeenCalledWith(
        "testConfig", defaultValues, fieldConfigs, false
      );
    });

    it("passes areAllFieldsReadonly flag", () => {
      const fieldConfigs: Dictionary<IFieldConfig> = {
        name: { component: "Textbox", label: "Name" },
      };
      const defaultValues: IEntityData = { name: "Test" };
      const mockInitBusinessRules = vi.fn().mockReturnValue({
        fieldRules: {},
        order: [],
      });

      InitOnEditBusinessRules("config", fieldConfigs, defaultValues, true, mockInitBusinessRules);

      expect(mockInitBusinessRules).toHaveBeenCalledWith(
        "config", defaultValues, fieldConfigs, true
      );
    });
  });
});
