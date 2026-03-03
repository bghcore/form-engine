import { describe, it, expect, vi, beforeEach } from "vitest";
import businessRulesReducer from "../../reducers/BusinessRulesReducer";
import { ActionTypeKeys } from "../../types/IBusinessRuleActionKeys";
import { IBusinessRulesState } from "../../types/IBusinessRulesState";
import { IConfigBusinessRules } from "../../types/IConfigBusinessRules";
import { defaultBusinessRulesState } from "../../providers/IBusinessRulesProvider";
import BusinessRulesActionType from "../../types/IBusinessRuleAction";

describe("BusinessRulesReducer", () => {
  const makeConfigRules = (overrides?: Partial<IConfigBusinessRules>): IConfigBusinessRules => ({
    order: ["field1", "field2"],
    fieldRules: {
      field1: { component: "Textbox", required: true },
      field2: { component: "Dropdown", required: false, hidden: false },
    },
    ...overrides,
  });

  describe("default/unknown action", () => {
    it("returns the same state for an unknown action type", () => {
      const state: IBusinessRulesState = {
        configRules: {
          existingConfig: makeConfigRules(),
        },
      };

      // Use "as any" to simulate an unknown action type
      const unknownAction = {
        type: "UNKNOWN_ACTION",
        payload: {
          configName: "test",
          configBusinessRules: makeConfigRules(),
        },
      } as unknown as BusinessRulesActionType;

      const result = businessRulesReducer(state, unknownAction);
      expect(result).toBe(state);
    });

    it("returns default state when state is undefined and action is unknown", () => {
      const unknownAction = {
        type: "UNKNOWN_ACTION",
        payload: {
          configName: "test",
          configBusinessRules: makeConfigRules(),
        },
      } as unknown as BusinessRulesActionType;

      const result = businessRulesReducer(undefined, unknownAction);
      expect(result).toEqual(defaultBusinessRulesState);
    });
  });

  describe("BUSINESSRULES_SET action", () => {
    it("sets config rules for a config name on empty state", () => {
      const configRules = makeConfigRules();

      const action: BusinessRulesActionType = {
        type: ActionTypeKeys.BUSINESSRULES_SET,
        payload: {
          configName: "myForm",
          configBusinessRules: configRules,
        },
      };

      const result = businessRulesReducer(defaultBusinessRulesState, action);

      expect(result.configRules).toHaveProperty("myForm");
      expect(result.configRules.myForm.order).toEqual(["field1", "field2"]);
      expect(result.configRules.myForm.fieldRules.field1).toEqual({
        component: "Textbox",
        required: true,
      });
      expect(result.configRules.myForm.fieldRules.field2).toEqual({
        component: "Dropdown",
        required: false,
        hidden: false,
      });
    });

    it("does not mutate the original state", () => {
      const state: IBusinessRulesState = {
        configRules: {},
      };

      const action: BusinessRulesActionType = {
        type: ActionTypeKeys.BUSINESSRULES_SET,
        payload: {
          configName: "myForm",
          configBusinessRules: makeConfigRules(),
        },
      };

      const result = businessRulesReducer(state, action);

      expect(result).not.toBe(state);
      expect(state.configRules).not.toHaveProperty("myForm");
    });

    it("overwrites an existing config when SET is dispatched again", () => {
      const initialConfig = makeConfigRules({
        order: ["old1", "old2"],
        fieldRules: {
          old1: { component: "Textbox" },
          old2: { component: "Textbox" },
        },
      });

      const state: IBusinessRulesState = {
        configRules: {
          myForm: initialConfig,
        },
      };

      const newConfig = makeConfigRules({
        order: ["new1"],
        fieldRules: {
          new1: { component: "Dropdown", required: true },
        },
      });

      const action: BusinessRulesActionType = {
        type: ActionTypeKeys.BUSINESSRULES_SET,
        payload: {
          configName: "myForm",
          configBusinessRules: newConfig,
        },
      };

      const result = businessRulesReducer(state, action);

      expect(result.configRules.myForm.order).toEqual(["new1"]);
      expect(result.configRules.myForm.fieldRules).toEqual({
        new1: { component: "Dropdown", required: true },
      });
      // old fields should be gone
      expect(result.configRules.myForm.fieldRules).not.toHaveProperty("old1");
    });
  });

  describe("BUSINESSRULES_UPDATE action", () => {
    it("merges field rules and updates order", () => {
      const state: IBusinessRulesState = {
        configRules: {
          myForm: makeConfigRules(),
        },
      };

      const updatePayload: IConfigBusinessRules = {
        order: ["field2", "field1"],
        fieldRules: {
          field1: { required: false, hidden: true },
        },
      };

      const action: BusinessRulesActionType = {
        type: ActionTypeKeys.BUSINESSRULES_UPDATE,
        payload: {
          configName: "myForm",
          configBusinessRules: updatePayload,
        },
      };

      const result = businessRulesReducer(state, action);

      // Order should be replaced
      expect(result.configRules.myForm.order).toEqual(["field2", "field1"]);

      // field1 should be merged: component from original, required/hidden from update
      expect(result.configRules.myForm.fieldRules.field1).toEqual({
        component: "Textbox",
        required: false,
        hidden: true,
      });
    });

    it("preserves existing fields not in the update payload", () => {
      const state: IBusinessRulesState = {
        configRules: {
          myForm: makeConfigRules(),
        },
      };

      const updatePayload: IConfigBusinessRules = {
        order: ["field1", "field2"],
        fieldRules: {
          field1: { required: false },
        },
      };

      const action: BusinessRulesActionType = {
        type: ActionTypeKeys.BUSINESSRULES_UPDATE,
        payload: {
          configName: "myForm",
          configBusinessRules: updatePayload,
        },
      };

      const result = businessRulesReducer(state, action);

      // field2 should be unchanged
      expect(result.configRules.myForm.fieldRules.field2).toEqual({
        component: "Dropdown",
        required: false,
        hidden: false,
      });
    });

    it("does not mutate the original state", () => {
      const state: IBusinessRulesState = {
        configRules: {
          myForm: makeConfigRules(),
        },
      };

      const action: BusinessRulesActionType = {
        type: ActionTypeKeys.BUSINESSRULES_UPDATE,
        payload: {
          configName: "myForm",
          configBusinessRules: {
            order: ["field2", "field1"],
            fieldRules: {
              field1: { hidden: true },
            },
          },
        },
      };

      const result = businessRulesReducer(state, action);

      expect(result).not.toBe(state);
      // Original field1 should not have hidden
      expect(state.configRules.myForm.fieldRules.field1).toEqual({
        component: "Textbox",
        required: true,
      });
    });
  });

  describe("multiple configs coexisting", () => {
    it("SET for different config names results in both being present", () => {
      let state: IBusinessRulesState = { configRules: {} };

      const configA = makeConfigRules({
        order: ["a1"],
        fieldRules: { a1: { component: "Textbox" } },
      });

      const configB = makeConfigRules({
        order: ["b1", "b2"],
        fieldRules: {
          b1: { component: "Dropdown" },
          b2: { component: "Toggle" },
        },
      });

      state = businessRulesReducer(state, {
        type: ActionTypeKeys.BUSINESSRULES_SET,
        payload: { configName: "formA", configBusinessRules: configA },
      });

      state = businessRulesReducer(state, {
        type: ActionTypeKeys.BUSINESSRULES_SET,
        payload: { configName: "formB", configBusinessRules: configB },
      });

      expect(state.configRules).toHaveProperty("formA");
      expect(state.configRules).toHaveProperty("formB");
      expect(state.configRules.formA.order).toEqual(["a1"]);
      expect(state.configRules.formB.order).toEqual(["b1", "b2"]);
    });

    it("UPDATE on one config does not affect another", () => {
      const state: IBusinessRulesState = {
        configRules: {
          formA: makeConfigRules({
            order: ["a1"],
            fieldRules: { a1: { component: "Textbox", required: true } },
          }),
          formB: makeConfigRules({
            order: ["b1"],
            fieldRules: { b1: { component: "Dropdown", required: false } },
          }),
        },
      };

      const result = businessRulesReducer(state, {
        type: ActionTypeKeys.BUSINESSRULES_UPDATE,
        payload: {
          configName: "formA",
          configBusinessRules: {
            order: ["a1"],
            fieldRules: { a1: { required: false } },
          },
        },
      });

      // formA updated
      expect(result.configRules.formA.fieldRules.a1.required).toBe(false);

      // formB unchanged
      expect(result.configRules.formB.fieldRules.b1).toEqual({
        component: "Dropdown",
        required: false,
      });
    });
  });
});
