# TypeScript Type Management Strategy

This document outlines the recommended approach for handling types in the boilerplate project to ensure consistency, especially when working with AI assistants.

## Core Principles

### Simplicity First
- Start with only what you need. Add complexity only when you have a real use-case.
- Favor plain TypeScript interfaces + Zod schemas; avoid extra layers (like hand-rolled type guards or unused utils.ts) until they earn their keep.

### Single Source of Truth
- All types live under src/types. No external docs or spreadsheets.
- Your code is your documentation.

### Co-location Over "Global Everything"
- Keep component-specific props next to the component file.
- Only pull something into src/types once it's shared by two or more modules.

### Schema-First Workflow
- Whenever you build a new feature, ask "What data do I need?"
- Define the Zod schema (and infer its TypeScript type) before writing any logic or UI.

### Prune Ruthlessly
- If a file or pattern hasn't been used in two sprints, remove it.
- AI-generated "best practices" that aren't actively solving your problem should be cut.

## Folder & File Structure

```
src/
├── lib/
│   └── firebase.ts        # initialize Firebase + converters
├── types/
│   ├── index.ts           # barrel: re-export only truly shared types
│   ├── models/            # Zod schemas + inferred TS types
│   │   └── User.ts
│   └── api.ts             # if you have custom ApiResponse<T> needs
└── components/
    └── Button.tsx         # props interface lives here if one-off
```

**Note:**
- No enums.ts, no utils.ts, no extra barrels until you actually need them.
- Merge an enum into its schema file (e.g. role: z.enum([...])) until you outgrow that file's size.

## Example Implementations

### Example Model File

```typescript
// src/types/models/User.ts
import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().optional(),
  role: z.enum(['admin','user','guest']),
  createdAt: z.date(),
})

export type User = z.infer<typeof UserSchema>
```

**Why Zod?**
- Runtime validation at API boundaries or Firestore reads.
- Auto-infers TS types—no separate interface.

### Minimal API Types

Only introduce these if you truly need consistent envelope shapes:

```typescript
// src/types/api.ts
export interface ApiResponse<T> {
  status: 'success' | 'error'
  data?: T
  message?: string
}
```

Drop this file entirely if you're just doing "fetch → res.json()" without a shared pattern.

### Frontend Usage Pattern

Fetch via your API route (or directly call Firestore with converters):

```typescript
const res = await fetch('/api/users')
const users: User[] = await res.json()
```

Validate on arrival (optional):

```typescript
const parsed = UserSchema.array().safeParse(users)
if (!parsed.success) throw new Error('Invalid user data')
```

Use types in React props:

```typescript
interface UserListProps { users: User[] }
export function UserList({ users }: UserListProps) { /*...*/ }
```

## Component Prop Standardization

Keep component-specific types with the component file:

```typescript
// src/components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
}
```

Only move to shared types when the same prop structure is used across multiple components:

```typescript
// src/types/components.ts - ONLY IF ACTUALLY SHARED
export interface BaseProps {
  className?: string;
  id?: string;
}

export type Variant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
```

## Evolving Your Schema

1. Add or change a field in the schema file first (e.g., User.ts)
2. Run tsc to catch any broken imports or mismatches
3. Fix UI/API code until you're green
4. Optionally write a one-off migration to backfill database documents

## Implementation Strategy

When implementing this approach:

1. Start small - create only what you immediately need
2. Add schemas for entities as you build features
3. Co-locate types with their components until shared
4. Ruthlessly prune unused types and files

## Benefits for AI Assistance

This approach will specifically help with AI-assisted development by:

1. Providing clear and minimal boundaries for where types should live
2. Creating consistent schema-first patterns AI can follow
3. Reducing the need for AI to invent types on the fly
4. Making it easy for AI to find and reference existing types
5. Ensuring validation happens consistently

## Keeping It Lean

- Archive or delete any file not referenced in a month
- Avoid:
  - Hand-written type guards (isUserType)—use Zod instead
  - Generic utility files with no clear ownership
  - Over-engineering API envelopes until you've got multiple endpoints needing them

## In Summary

Drift toward simplicity: start small → schema first → co-locate → prune unused code → repeat.

This keeps your boilerplate light, your AI prompts focused, and your app easy to maintain. 