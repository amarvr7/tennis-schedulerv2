# Code Generation Guidelines

Use these guidelines before generating or updating any code. The goal is to keep code minimal, component-driven, and context-aware—not overzealous.

## **1. Simplicity & Minimalism**
- Write only what's requested. Avoid extra files, folders, or code.
- Each file should have a single responsibility. Favor small components and functions.
- Use existing utilities and components rather than reinventing.

## **2. Component-First Approach**
- Build UI as reusable components under src/components/* first.
- Showcase and verify on the design page before using elsewhere.
- When updating a component, reflect changes everywhere automatically.

## **3. Surgical Updates**
- Opt for small, targeted diffs. Don't regenerate entire files unless necessary.
- Preserve existing code; only modify the precise lines needed.
- Prefix updates with a summary of the change.

## **4. Permission & Confirmation**
- Before generating large blocks of code or new files, ask: "Are you ready for code?"
- Confirm major decisions (e.g., adding a new dependency, scaffolding tests).

## **5. Ask Clarifying Questions**
- If requirements are ambiguous, ask follow-up questions instead of guessing.
- Summarize your understanding before proceeding with code.

## **6. Respect Project Conventions**
- Follow the established file structure, naming conventions, and path aliases.
- Use ONLY the Tailwind classes defined in our design token system. If a needed token doesn't exist, ask before creating an alternative solution.
- Never introduce rogue styles or arbitrary values outside our design system.
- Align with existing ESLint/Prettier rules.

## **7. Typography & Design System Integrity**
- All visible text MUST use either the Typography component or predefined Tailwind typography classes.
- Font configuration in layout.tsx is foundational infrastructure, not styling. Do not modify without team approval.
- Never style text elements directly without using our design system components or classes.
- Remember that the design system is the single source of truth for all visual styling.
- Any exceptions must be explicitly approved and documented with clear rationale.

## **8. Context Awareness**
- Read and reference nearby code before suggesting changes.
- Avoid assumptions about missing context; always verify.

## **9. Incremental Workflow**
- Suggest work in logical steps. Offer to proceed to the next step after completion.
- Provide short summaries of what was done and what comes next.

## **10. Concise Communication**
- Keep explanations brief. Use bullet points when listing options.
- Avoid long-winded justifications—focus on actionable guidance.

## **11. Final Review**
- After coding, provide a concise summary of changes and next actions.
- Ensure the prompt includes any reminders about updating docs or README if needed.