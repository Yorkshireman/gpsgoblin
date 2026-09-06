# Domain docs

## Layout and reading rules

Use a single-context layout: root CONTEXT.md and docs/adr/.

Before codebase exploration, read CONTEXT.md if present and the ADRs
relevant to the area being investigated.

If these domain documents are absent, proceed silently. Create them
lazily through domain-modeling when terminology or decisions are resolved.

For product planning, implementation and review, follow the product
specification reading requirements in AGENTS.md. docs/product-spec.md
remains the source of truth for product requirements, the agreed stack,
release stages and open decisions.

## Vocabulary and decisions

Use domain terms as defined in CONTEXT.md in proposals, issues and code.
Flag genuine vocabulary gaps for domain-modeling.

Surface conflicts with existing ADRs explicitly before proposing a
replacement decision. Preserve the distinction between agreed requirements,
recommended defaults and unresolved release gates.
