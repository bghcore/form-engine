# Form Engine vs Alternatives

How does form-engine compare to other React form libraries? This guide provides an honest, feature-by-feature comparison to help you choose the right tool. Every library here is good -- the question is which one fits your project.

> **Last verified:** March 2026. Bundle sizes are approximate ESM values from bundlephobia or package dist. Feature claims are based on published documentation. If anything is out of date, please open an issue.

## Summary Table

| Feature | form-engine | RJSF | TanStack Form | Formik | react-final-form | uniforms | surveyjs | formio |
|---------|:-----------:|:----:|:-------------:|:------:|:----------------:|:--------:|:--------:|:------:|
| Config-driven (JSON/data) | Yes | Yes | No | No | No | Yes | Yes | Yes |
| Rules engine (declarative) | Yes (20 ops) | Partial | No | No | No | No | Partial | Partial |
| UI adapter system | 12 adapters | 5 themes | N/A (headless) | N/A | N/A | 6 bridges | Built-in | Built-in |
| Conditional field visibility | Declarative | JSON Schema | Code | Code | Code | JSON Schema | JSON | JSON |
| Computed values | `$values`, `$fn` | No | No | No | No | No | Expressions | Calculated |
| Wizard / multi-step | Built-in | Add-on | Manual | Manual | Manual | No | Built-in | Built-in |
| Visual form builder | Yes | No | No | No | No | No | Yes (paid) | Yes (paid) |
| Async validation | Debounced | No | Yes | Yes | Yes | Yes | Yes | Yes |
| Field arrays | Built-in | Built-in | Built-in | FieldArray | FieldArray | ListField | Matrix | DataGrid |
| i18n | Locale registry | React-intl | Manual | Manual | Manual | Manual | Built-in | Built-in |
| TypeScript | Strict | Partial | Strict | Yes | Yes | Yes | Yes | Yes |
| Schema import (JSON Schema) | `fromRjsfSchema()` | Native | No | No | No | Native | Proprietary | Proprietary |
| Zod import | `zodSchemaToFieldConfig()` | No | Adapter | Adapter | No | No | No | No |
| License | MIT | Apache 2.0 | MIT | Apache 2.0 | MIT | MIT | Mixed | Mixed |
| Core bundle (approx.) | ~114 KB | ~85 KB | ~12 KB | ~13 KB | ~8 KB | ~45 KB | ~200 KB+ | ~250 KB+ |

## Detailed Comparisons

### react-jsonschema-form (RJSF)

**Closest competitor.** Both are config-driven form renderers that take a schema and produce a form.

**What they share:**
- Forms defined as data (JSON Schema for RJSF, IFormConfig for form-engine)
- Field type resolution from schema
- Conditional fields (RJSF via `dependencies`/`if-then-else`, form-engine via `IRule[]`)
- Multiple UI themes/adapters
- Field arrays for repeating sections

**Key differences:**
- **Rules engine**: form-engine has a purpose-built declarative rules engine with 20 condition operators, priority-based conflict resolution, computed values, and cross-field effects. RJSF relies on JSON Schema `dependencies` and `if/then/else`, which are powerful but limited to visibility and required toggling.
- **Computed values**: form-engine supports `$values.qty * $values.price` expressions and custom `$fn` functions. RJSF has no built-in computed value system.
- **Visual builder**: form-engine includes `@form-eng/designer`. RJSF has community playground tools but no official builder.
- **UI adapters**: form-engine has 12 first-party adapters. RJSF has 5 official themes (antd, chakra, fluent, mui, semantic).
- **Schema interop**: form-engine can import RJSF schemas via `fromRjsfSchema()` and export via `toRjsfSchema()`, so migration is straightforward.
- **Community**: RJSF has a much larger community (~14k GitHub stars) and longer track record.

**Choose RJSF when:** you already have JSON Schemas, need the largest community and ecosystem, or want schema-first development where the form schema is also used for API validation.

**Choose form-engine when:** you need a declarative rules engine with computed values, cross-field effects, and priority-based conflict resolution that goes beyond what JSON Schema conditionals can express.

---

### TanStack Form

**Different category.** TanStack Form is a headless form state manager. form-engine is a config-driven form renderer with a rules engine.

**What they share:**
- React form state management
- TypeScript-first
- Async validation support
- Framework flexibility (TanStack Form supports React, Vue, Angular, Solid, Lit)

**Key differences:**
- **Approach**: TanStack Form is code-first -- you write JSX and wire up fields in code. form-engine is config-first -- you define fields as data and the library renders them.
- **Rules engine**: form-engine has a built-in declarative rules engine. TanStack Form has no equivalent -- conditional logic is imperative code.
- **Rendering**: TanStack Form provides zero UI. form-engine provides 12 adapter packages with ready-to-use field components.
- **Bundle size**: TanStack Form is ~12 KB. form-engine core is ~114 KB (includes the rules engine, expression evaluator, wizard system, and validation registry).
- **Multi-framework**: TanStack Form works with React, Vue, Angular, Solid, Lit. form-engine is React-only.

**Choose TanStack Form when:** you want full control over rendering, need multi-framework support, are building simple-to-medium forms where you can write the conditional logic yourself, or need the smallest possible bundle.

**Choose form-engine when:** your forms are data-driven (stored in a database, generated by a builder, or configured by non-developers), you need a declarative rules engine, or you want ready-made UI components for your design system.

---

### Formik

**Legacy standard.** Formik was the de facto React form library before react-hook-form. It is in maintenance mode (no major releases since 2021).

**What they share:**
- React form state management
- Validation (Formik uses Yup by convention)
- Field arrays

**Key differences:**
- **Status**: Formik is in maintenance mode. form-engine and react-hook-form (which form-engine uses internally) are actively maintained.
- **Approach**: Formik is code-first with `<Field>` components or `useFormik`. form-engine is config-driven.
- **Re-renders**: Formik re-renders on every keystroke by default. form-engine uses react-hook-form's uncontrolled inputs for better performance.
- **Rules engine**: Formik has no conditional field system. form-engine has a full declarative rules engine.

**Choose Formik when:** you have an existing Formik codebase and the cost of migration outweighs the benefits.

**Choose form-engine when:** you are starting a new project and need config-driven forms with a rules engine. If you are migrating from Formik, form-engine's config-driven approach will require rethinking how your forms are structured, which is a larger effort than swapping to react-hook-form directly.

---

### react-final-form

**Subscription-based form state.** react-final-form optimizes renders by letting components subscribe to specific parts of form state.

**What they share:**
- React form state management
- Fine-grained render control
- Field arrays
- Validation

**Key differences:**
- **Maintenance**: react-final-form is maintained but sees infrequent updates. form-engine is actively developed.
- **Approach**: Code-first vs config-driven.
- **Subscription model**: react-final-form's per-field subscriptions are elegant but require manual setup. form-engine uses react-hook-form's uncontrolled inputs, which achieve similar performance with less configuration.
- **Rules engine**: No equivalent in react-final-form.

**Choose react-final-form when:** you have an existing codebase using it and it meets your needs, or you specifically want the subscription-based render model.

**Choose form-engine when:** you need config-driven forms, a rules engine, or ready-made UI adapter components.

---

### uniforms

**Closest in spirit.** uniforms is also a config-driven form library with multiple UI bridges. It generates forms from schemas (JSON Schema, GraphQL, SimpleSchema).

**What they share:**
- Config/schema-driven form rendering
- Multiple UI adapters (uniforms calls them "bridges": antd, bootstrap, material, mui, semantic, unstyled)
- Auto-generated forms from schema
- TypeScript support

**Key differences:**
- **Rules engine**: form-engine has a declarative rules engine with 20 operators. uniforms uses JSON Schema conditionals or requires imperative code for complex conditions.
- **Computed values**: form-engine supports computed expressions. uniforms does not.
- **Visual builder**: form-engine includes `@form-eng/designer`. uniforms has no visual builder.
- **Schema sources**: uniforms supports JSON Schema, GraphQL, and SimpleSchema. form-engine uses its own IFormConfig format but can import JSON Schema and Zod schemas.
- **Adapter count**: form-engine has 12 adapters. uniforms has 6 bridges.
- **Wizard**: form-engine has built-in wizard support with conditional step visibility. uniforms requires custom implementation.

**Choose uniforms when:** you use GraphQL schemas or SimpleSchema and want auto-generated forms from those formats, or you prefer the uniforms bridge API.

**Choose form-engine when:** you need a declarative rules engine, computed values, wizard forms, or a visual builder. Also consider form-engine if you need adapters for Fluent UI, Mantine, Radix, React Aria, or other design systems that uniforms doesn't support.

---

### SurveyJS

**Different market.** SurveyJS is a commercial survey and form platform with a builder, analytics, and a PDF generator.

**What they share:**
- JSON-driven form/survey rendering
- Visual form builder (SurveyJS Creator)
- Conditional logic and branching
- Multi-step / wizard forms

**Key differences:**
- **Licensing**: SurveyJS form library is MIT, but the Creator (visual builder), PDF generator, and analytics dashboard are commercial licenses. form-engine is MIT for everything including the designer.
- **Scope**: SurveyJS is a full survey platform. form-engine is a form rendering library that integrates into your existing React app.
- **UI integration**: SurveyJS provides its own themed UI. form-engine renders through your existing design system (Fluent, MUI, Ant, etc.).
- **Bundle size**: SurveyJS is significantly larger (~200 KB+).
- **Rules engine**: SurveyJS has conditional visibility and calculated values. form-engine's rules engine is more expressive (20 operators, cross-field effects, priority resolution).

**Choose SurveyJS when:** you need a complete survey platform with analytics, PDF export, and are willing to pay for commercial features.

**Choose form-engine when:** you need a form library that integrates with your existing React UI framework, want MIT licensing for all features, or need a more powerful rules engine.

---

### Form.io

**Full platform.** Form.io is a commercial form management platform with a server-side component, submission handling, and a drag-and-drop builder.

**What they share:**
- JSON-driven form rendering
- Visual form builder
- Conditional logic
- Multi-step forms

**Key differences:**
- **Architecture**: Form.io includes a server-side form submission and management platform. form-engine is a client-side React library -- you bring your own backend.
- **Licensing**: Form.io's renderer is open source, but the builder and platform are commercial. form-engine is MIT for everything.
- **React integration**: Form.io's React SDK wraps their vanilla JS renderer. form-engine is React-native.
- **UI adapters**: Form.io provides its own styled components. form-engine renders through your design system.

**Choose Form.io when:** you want a managed platform that handles form submissions, roles, and persistence -- and you're willing to use their ecosystem.

**Choose form-engine when:** you want a React-native library with full control over your backend, UI framework integration, and MIT licensing for all features.

## Migration Paths

| From | To form-engine | Effort |
|------|---------------|--------|
| RJSF | `fromRjsfSchema()` auto-converts schemas and dependencies to IFormConfig + IRule[]. Start here. | Low-Medium |
| Formik / react-hook-form | Redefine forms as IFormConfig objects. Move validation to the validation registry. New mental model. | Medium-High |
| TanStack Form | Similar to Formik migration. Config-driven is a different paradigm. | Medium-High |
| uniforms | Map bridge schemas to IFormConfig. Rules need manual conversion. | Medium |
| SurveyJS | Export survey JSON, manually map to IFormConfig. No automated converter. | High |
