export interface IWizardStepCondition {
  fieldName: string;
  values: string[];
}

export interface IWizardStep {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  visibleWhen?: IWizardStepCondition;
}

export interface IWizardConfig {
  steps: IWizardStep[];
  linearNavigation?: boolean;
  validateOnStepChange?: boolean;
  saveOnStepChange?: boolean;
}
