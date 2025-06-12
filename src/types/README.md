# Types Directory

This directory contains shared type definitions for the project. It follows a lean, pragmatic approach to TypeScript types.

## Key Principles

1. **Co-location Over Centralization**
   - Component-specific types stay with their components
   - Only move types here when used across multiple files

2. **Schema-First Development**
   - Define data models with Zod schemas in `models/` directory
   - Infer TypeScript types from schemas using `z.infer<typeof Schema>`

3. **Minimal Abstraction**
   - Start simple, add complexity only when needed
   - Avoid creating utility types until they're used in multiple places

## Directory Structure

- `index.ts`: Re-exports shared types (barrel file)
- `api.ts`: API response types (only if needed)
- `components.ts`: Shared component props (only when used across components)
- `models/`: Zod schemas for data models
  - `User.ts`: Example user model (uncomment when needed)

## Usage Guide

### When To Add Types Here

✅ Types used by multiple components  
✅ Model definitions shared across features  
✅ API response shapes used in multiple places  

### When NOT To Add Types Here

❌ Component-specific props (keep with component)  
❌ One-off utility types (keep with their function)  
❌ Types only used in a single feature  

### Example: Using a Model

```typescript
// Import model type
import { User } from '@/types';
// Or import model schema
import { UserSchema } from '@/types/models/User';

// Use the type
function UserProfile({ user }: { user: User }) {
  // ...
}

// Validate with schema
const validUser = UserSchema.parse(data);
```

For more details, see the [type-management.md](../../docs/type-management.md) document. 