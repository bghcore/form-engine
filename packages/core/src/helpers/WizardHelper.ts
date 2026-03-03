import { IEntityData } from "../utils";
import { IWizardStep } from "../types/IWizardConfig";
import { Dictionary } from "../utils";
import { IBusinessRule } from "../types/IBusinessRule";

export function getVisibleSteps(
  steps: IWizardStep[],
  entityData: IEntityData
): IWizardStep[] {
  return steps.filter(step => {
    if (!step.visibleWhen) return true;
    const fieldValue = String(entityData[step.visibleWhen.fieldName] ?? "");
    return step.visibleWhen.values.includes(fieldValue);
  });
}

export function getStepFields(
  step: IWizardStep,
  fieldRules?: Dictionary<IBusinessRule>
): string[] {
  if (!fieldRules) return step.fields;
  return step.fields.filter(fieldName => {
    const rule = fieldRules[fieldName];
    return !rule?.hidden;
  });
}

export function getStepFieldOrder(
  steps: IWizardStep[],
  entityData: IEntityData
): string[] {
  const visibleSteps = getVisibleSteps(steps, entityData);
  return visibleSteps.flatMap(step => step.fields);
}

export function validateStepFields(
  step: IWizardStep,
  errors: Record<string, unknown>
): string[] {
  return step.fields.filter(fieldName => fieldName in errors);
}

export function isStepValid(
  step: IWizardStep,
  errors: Record<string, unknown>
): boolean {
  return validateStepFields(step, errors).length === 0;
}

export function getStepIndex(
  steps: IWizardStep[],
  stepId: string
): number {
  return steps.findIndex(s => s.id === stepId);
}
