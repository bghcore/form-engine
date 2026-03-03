import { IEntityData } from "../../utils";

/** Empty entity */
export const emptyEntity: IEntityData = {};

/** Simple entity with name and description */
export const simpleEntity: IEntityData = {
  name: "Test Item",
  description: "A test description",
};

/** Entity with Active status */
export const activeStatusEntity: IEntityData = {
  status: "Active",
  priority: "High",
};

/** Entity with Inactive status */
export const inactiveStatusEntity: IEntityData = {
  status: "Inactive",
  priority: "",
};

/** Entity with combo rule conditions met: status=Active AND type=Bug */
export const comboMetEntity: IEntityData = {
  status: "Active",
  type: "Bug",
  notes: "",
};

/** Entity with combo rule conditions NOT met */
export const comboNotMetEntity: IEntityData = {
  status: "Active",
  type: "Feature",
  notes: "",
};

/** Entity with US country */
export const usCountryEntity: IEntityData = {
  country: "US",
  region: "East",
};

/** Entity with CA country */
export const caCountryEntity: IEntityData = {
  country: "CA",
  region: "Ontario",
};

/** Entity with Bug type (for order deps) */
export const bugTypeEntity: IEntityData = {
  type: "Bug",
  severity: "Major",
  steps: "Step 1\nStep 2",
  description: "A bug",
};

/** Entity with Feature type (for order deps) */
export const featureTypeEntity: IEntityData = {
  type: "Feature",
  description: "A feature",
  priority: "High",
};

/** Entity with nested path values */
export const nestedEntity: IEntityData = {
  name: "Test",
  Parent: {
    id: "parent-1",
    name: "Parent Item",
  },
};

/** Entity with deprecated value selected */
export const deprecatedValueEntity: IEntityData = {
  category: "C",
};

/** Entity with valid value */
export const validCategoryEntity: IEntityData = {
  category: "A",
};

/** Entity with all fields readonly scenario */
export const allFieldsEntity: IEntityData = {
  name: "Test Name",
  status: "Open",
};

/** Entity for nested order deps */
export const nestedOrderEntity: IEntityData = {
  category: "A",
  subcategory: "A1",
  name: "Test",
  description: "Desc",
};

/** Entity with multiselect values */
export const multiselectEntity: IEntityData = {
  tags: ["frontend", "backend"],
};

/** Entity with email, phone, website */
export const validationEntity: IEntityData = {
  email: "test@example.com",
  phone: "+1-555-1234",
  website: "https://example.com",
};

/** Entity with invalid values */
export const invalidValidationEntity: IEntityData = {
  email: "not-an-email",
  phone: "abc",
  website: "no-protocol.com",
};

/** Entity for confirm input tests */
export const confirmTriggerEntity: IEntityData = {
  trigger: "Yes",
  confirmed: "",
};

/** Entity for component swap */
export const simpleModEntity: IEntityData = {
  mode: "simple",
  detail: "Some text",
};

export const advancedModeEntity: IEntityData = {
  mode: "advanced",
  detail: "Rich content",
};

/** Entity with default values scenario */
export const defaultValueEntity: IEntityData = {
  status: null,
  name: "",
};
