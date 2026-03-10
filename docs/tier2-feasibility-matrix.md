# Tier 2 Field Feasibility Matrix

## Overview

Assessment of 19 candidate Tier 2 fields across all adapter targets. Each cell is classified by feasibility level.

## Classification Key

| Level | Meaning |
|---|---|
| Strong | UI library has a native component that maps directly |
| Viable | Can implement with minor workarounds or composition |
| Partial | Significant gaps — would require heavy custom work |
| Defer | Not practical for this adapter at this time |
| Recipe | shadcn/Tailwind recipe — copy-paste pattern, not adapter code |

## Feasibility Matrix

| Field | fluent | mui | headless | antd | chakra | mantine | atlaskit | base-web | heroui | radix | react-aria | shadcn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Rating | Strong | Strong | Viable | Strong | Viable | Strong | Viable | Viable | Viable | Viable | Viable | Recipe |
| Autocomplete | Strong | Strong | Viable | Strong | Viable | Strong | Viable | Viable | Viable | Partial | Strong | Recipe |
| DateTime | Strong | Strong | Viable | Strong | Viable | Strong | Viable | Viable | Viable | Viable | Strong | Recipe |
| DateRange | Partial | Strong | Viable | Strong | Viable | Strong | Viable | Viable | Viable | Viable | Strong | Recipe |
| PhoneInput | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Recipe |
| FileUpload | Viable | Viable | Viable | Strong | Viable | Strong | Viable | Strong | Viable | Viable | Viable | Recipe |
| ColorPicker | Strong | Viable | Viable | Strong | Viable | Strong | Viable | Viable | Viable | Viable | Viable | Recipe |
| MultiSelectSearch | Strong | Strong | Partial | Strong | Partial | Strong | Partial | Partial | Partial | Partial | Viable | Recipe |
| RichText | Defer | Defer | Defer | Defer | Defer | Strong | Defer | Defer | Defer | Defer | Defer | Defer |
| DocumentLinks | Strong | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Recipe |
| StatusDropdown | Strong | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Recipe |
| ReadOnlyArray | Strong | Strong | Strong | Strong | Strong | Strong | Viable | Viable | Viable | Viable | Viable | Recipe |
| ReadOnlyDateTime | Strong | Strong | Strong | Strong | Strong | Strong | Viable | Viable | Viable | Viable | Viable | Recipe |
| ReadOnlyCumulativeNumber | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Recipe |
| ReadOnlyRichText | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Recipe |
| ReadOnlyWithButton | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Recipe |
| ChoiceSet | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Recipe |
| FieldArray (nested) | Strong | Strong | Strong | Strong | Strong | Strong | Strong | Strong | Strong | Strong | Strong | Recipe |
| PopOutEditor | Strong | Strong | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Recipe |

## Recommended Rollout Waves

### Wave 1: High-Value, Broad Coverage

**Rating, Autocomplete, DateTime**

Rationale: Strong native support in 5+ adapters each. Most-requested by consumers. Clean API surface for IFieldConfig extension.

Estimated test additions: ~400 tests (parity + edge cases)

### Wave 2: Form Completeness

**DateRange, PhoneInput, FileUpload**

Rationale: Fills common form patterns. Several adapters have native support. PhoneInput may need a shared formatting utility in core.

Estimated test additions: ~300 tests

### Wave 3: Specialized Fields

**ColorPicker, MultiSelectSearch, RichText**

Rationale: Less universal demand but high value for specific use cases. MultiSelectSearch is complex; RichText may be deferred to Wave 4+ due to editor library dependency.

Estimated test additions: ~250 tests

### Wave 4: Completeness & Variants

**DocumentLinks, StatusDropdown, ReadOnly variants (5), ChoiceSet, PopOutEditor**

Rationale: Rounds out the full field set. Many are simple read-only variants. DocumentLinks and StatusDropdown already exist in Fluent.

Estimated test additions: ~350 tests

## Risk Assessment

| Risk | Mitigation |
|---|---|
| RichText editor library lock-in | Defer to Wave 3+, evaluate tiptap vs prosemirror vs lexical |
| PhoneInput i18n complexity | Shared formatting utility in core, libphonenumber-js as optional peer |
| MultiSelectSearch performance | Virtual scrolling for large option lists, debounced search |
| DateRange dual-input complexity | Shared IDateRangeValue type already in core/adapter-utils |

## Related Documentation

- [Choosing an Adapter](./choosing-an-adapter.md)
- [Divergence Register](./divergence-register.md)
- [Tier 2 Handoff](./tier2-handoff.md)
