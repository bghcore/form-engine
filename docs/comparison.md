# Form Engine vs Alternatives

How does form-engine compare to other React form libraries? This guide provides an honest, feature-by-feature comparison to help you choose the right tool. Every library here is good -- the question is which one fits your project.

> **Last verified:** March 2026. Bundle sizes are approximate ESM values from bundlephobia or package dist. Feature claims are based on published documentation. If anything is out of date, please open an issue.

## Summary Table

| Feature | form-engine | FormEngine.io | RJSF | TanStack Form | Formik | uniforms | surveyjs | formio |
|---------|:-----------:|:-------------:|:----:|:-------------:|:------:|:--------:|:--------:|:------:|
| Config-driven (JSON/data) | Yes | Yes | Yes | No | No | Yes | Yes | Yes |
| Rules engine (declarative) | Yes (20 ops) | Partial | Partial | No | No | No | Partial | Partial |
| UI adapter system | 11 adapters | 4 adapters | 5 themes | N/A (headless) | N/A | 6 bridges | Built-in | Built-in |
| Conditional field visibility | Declarative | JSON-based | JSON Schema | Code | Code | JSON Schema | JSON | JSON |
| Computed values | `$values`, `$fn` | MobX-based | No | No | No | No | Expressions | Calculated |
| Wizard / multi-step | Built-in | Layout-based | Add-on | Manual | Manual | No | Built-in | Built-in |
| Visual form builder | Yes (MIT) | Yes (paid) | No | No | No | No | Yes (paid) | Yes (paid) |
| AI form generation | No | ChatGPT custom GPT | No | No | No | No | No | No |
| Async validation | Debounced | Zod/Yup/AJV | No | Yes | Yes | Yes | Yes | Yes |
| Field arrays / repeaters | Built-in | Repeater component | Built-in | Built-in | FieldArray | ListField | Matrix | DataGrid |
| i18n / localization | Locale registry | Fluent.js | React-intl | Manual | Manual | Manual | Built-in | Built-in |
| Custom components | cloneElement injection | Fluent builder API | Widgets | N/A | N/A | Fields | Built-in | Built-in |
| Embedded forms / templates | No | Yes | No | No | No | No | No | Partial |
| TypeScript | Strict | Yes | Partial | Strict | Yes | Yes | Yes | Yes |
| Schema import | JSON Schema + Zod | Proprietary JSON | Native JSON Schema | No | No | JSON Schema | Proprietary | Proprietary |
| React framework support | React only | React + Next.js + Remix | React | React/Vue/Angular/Solid | React | React | Multi-framework | Multi-framework |
| License | MIT (all) | MIT core / Paid builder | Apache 2.0 | MIT | Apache 2.0 | MIT | Mixed | Mixed |
| Core bundle (approx.) | ~114 KB | ~189 KB (gzip) | ~85 KB | ~12 KB | ~13 KB | ~45 KB | ~200 KB+ | ~250 KB+ |

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
- **UI adapters**: form-engine has 11 first-party adapters with 28 field types each. RJSF has 5 official themes (antd, chakra, fluent, mui, semantic).
- **Schema interop**: form-engine can import RJSF schemas via `fromRjsfSchema()` and export via `toRjsfSchema()`, so migration is straightforward.
- **Community**: RJSF has a much larger community (~14k GitHub stars) and longer track record.

**Choose RJSF when:** you already have JSON Schemas, need the largest community and ecosystem, or want schema-first development where the form schema is also used for API validation.

**Choose form-engine when:** you need a declarative rules engine with computed values, cross-field effects, and priority-based conflict resolution that goes beyond what JSON Schema conditionals can express.

---

### FormEngine.io

**Closest name, different product.** [FormEngine.io](https://formengine.io/) (package: `@react-form-builder/core`) is a JSON-driven React form engine with a commercial drag-and-drop designer. Despite the similar name, the products differ significantly in architecture and strengths.

**What they share:**
- JSON-driven form rendering
- Visual drag-and-drop form builder
- Conditional field visibility from config
- Custom component registration
- Multi-UI-library support (MUI, Mantine, etc.)
- TypeScript support
- i18n / localization support

**Where we lead:**
- **Rules engine**: form-engine has a purpose-built declarative rules engine with 20 condition operators, dependency graph evaluation, priority-based conflict resolution, computed values with `$values`/`$fn` expressions, and cross-field effects. FormEngine.io uses MobX-based dynamic properties -- more flexible for simple cases but lacks declarative semantics, priority resolution, and tracing/debugging tools.
- **UI adapter count**: 11 first-party adapters (fluent, mui, headless, antd, chakra, mantine, atlaskit, base-web, heroui, radix, react-aria) with 28 field types each. FormEngine.io ships 4 adapters (MUI, Mantine, React Suite, shadcn/ui) with others listed as "coming soon."
- **Accessibility-first adapters**: form-engine has dedicated radix (unstyled primitives) and react-aria (ARIA-first) adapters. FormEngine.io has no accessibility-specialized adapter.
- **Open-source designer**: form-engine's `@form-eng/designer` is MIT-licensed. FormEngine.io's designer is commercial ($1,299-$5,999 perpetual license).
- **Contract-tested parity**: All 11 adapters run the same contract + parity test suite (6,296 tests). FormEngine.io's adapter parity is not publicly documented.
- **Schema interop**: form-engine imports JSON Schema (via `fromRjsfSchema()`) and Zod schemas. FormEngine.io uses a proprietary JSON format with no documented import from standard schemas.
- **DevTools**: form-engine includes FormDevTools for runtime rule tracing, value inspection, and performance tracking. FormEngine.io has no equivalent.

**Where they lead:**
- **AI form generation**: FormEngine.io offers a custom ChatGPT GPT that converts screenshots, PDFs, or text descriptions into their JSON schema. form-engine has no AI generation story.
- **Embedded forms / templates**: FormEngine.io supports forms-within-forms and reusable template components. form-engine has no template/embedding system beyond field arrays.
- **Specialized components**: FormEngine.io offers premium components (data grid with inline editing, signature capture, QR codes, Google Maps, rich text editor). form-engine focuses on standard form fields.
- **Validation library choice**: FormEngine.io integrates Zod, Yup, AJV, Superstruct, and Joi out of the box. form-engine has its own validation registry (14 built-in validators + custom) but no direct Zod/Yup runtime integration.
- **Workflow integration**: FormEngine.io is part of the Optimajet ecosystem (Workflow Engine, Workflow Server), enabling form-to-workflow pipelines. form-engine is standalone.
- **Layout system**: FormEngine.io has built-in responsive grid layouts, columns, and nested sections. form-engine delegates layout to the consuming application.
- **Enterprise logos**: FormEngine.io claims Bosch, Philips, Dell, Acer, Novartis adoption.

**Roughly at parity:**
- Computed/dynamic properties (different approaches, similar capability)
- Custom component registration (different APIs, similar extensibility)
- i18n support (form-engine: LocaleRegistry, FormEngine.io: Fluent.js)
- Multi-step / wizard forms

**Choose FormEngine.io when:** you want a commercial-grade visual designer with AI generation, need specialized components like data grids or signature capture, or are in the Optimajet workflow ecosystem.

**Choose form-engine when:** you need a declarative rules engine with formal semantics, want the widest UI adapter ecosystem (11 adapters, 28 fields each), need accessibility-first adapters (radix, react-aria), want everything MIT-licensed including the designer, or need contract-tested cross-adapter parity.

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
- **Adapter count**: form-engine has 11 adapters with 28 field types each. uniforms has 6 bridges.
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
