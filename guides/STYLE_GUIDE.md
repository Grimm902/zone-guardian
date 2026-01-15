# Zone Guardian Style Guide

This style guide defines the coding standards and best practices for the Zone Guardian project. All code should follow these guidelines to ensure consistency, readability, and maintainability.

## Table of Contents

1. [General Principles](#general-principles)
2. [TypeScript Guidelines](#typescript-guidelines)
3. [React Patterns](#react-patterns)
4. [File Organization](#file-organization)
5. [Import Statements](#import-statements)
6. [Component Structure](#component-structure)
7. [Styling with Tailwind CSS](#styling-with-tailwind-css)
8. [Layout Patterns](#layout-patterns)
9. [Design System](#design-system)
10. [Component Design Patterns](#component-design-patterns)
11. [Visual Hierarchy](#visual-hierarchy)
12. [Error Handling](#error-handling)
13. [Type Safety](#type-safety)
14. [Comments and Documentation](#comments-and-documentation)
15. [Code Formatting](#code-formatting)

## General Principles

- **Consistency**: Follow established patterns throughout the codebase
- **Readability**: Write code that is easy to understand at a glance
- **Maintainability**: Structure code for easy modification and extension
- **Type Safety**: Leverage TypeScript's type system to catch errors early
- **Performance**: Write efficient code, but prioritize clarity over premature optimization

## TypeScript Guidelines

### Type Definitions

- Use `interface` for object shapes and component props
- Use `type` for unions, intersections, and computed types
- Prefer explicit types over `any`; use `unknown` when the type is truly unknown
- Export types and interfaces that are used across multiple files

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

type UserRole = 'admin' | 'user' | 'guest';

// ❌ Bad
const user: any = { id: '1' };
```

### Type Inference

- Let TypeScript infer types when they're obvious
- Explicitly type function parameters and return types for public APIs
- Use `as const` for literal types when needed

```typescript
// ✅ Good
const getUser = async (id: string): Promise<User | null> => {
  // ...
};

// ✅ Good - inference is fine for simple cases
const count = items.length;

// ❌ Bad - unnecessary type annotation
const count: number = items.length;
```

### Generics

- Use descriptive generic names (T, U, V are acceptable for simple cases)
- Prefer more descriptive names for complex generics

```typescript
// ✅ Good
function getValue<T>(key: string): T | null {
  // ...
}

interface ApiResponse<TData> {
  data: TData;
  error: string | null;
}
```

## React Patterns

### Component Structure

- Use functional components with hooks
- Prefer named exports for components
- Use default exports only for page components
- Keep components focused and single-purpose

```typescript
// ✅ Good - Named export for reusable component
export const Button = ({ children, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{children}</button>;
};

// ✅ Good - Default export for page component
const Login = () => {
  // ...
};
export default Login;
```

### Component Props

- Define props interfaces above the component
- Use destructuring for props
- Provide default values when appropriate
- Mark optional props with `?`

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
}: ButtonProps) => {
  // ...
};
```

### Hooks

- Use hooks at the top of the component
- Group related hooks together
- Extract complex logic into custom hooks
- Follow the Rules of Hooks (no conditional hooks)

```typescript
// ✅ Good
const MyComponent = () => {
  const [state, setState] = useState<string>('');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // effect logic
  }, [user]);

  // ...
};
```

### State Management

- Use `useState` for local component state
- Use context for shared state across components
- Consider React Query for server state
- Keep state as close to where it's used as possible

## File Organization

### Directory Structure

```
src/
  components/        # Reusable UI components
    ui/             # Base UI components (shadcn/ui)
    forms/          # Form-specific components
    layout/         # Layout components
    auth/           # Authentication components
  pages/            # Page components (route components)
  contexts/         # React contexts
  hooks/            # Custom React hooks
  lib/              # Utility functions and helpers
  types/            # TypeScript type definitions
  integrations/     # Third-party integrations
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `Button.tsx`, `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`, `validations.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.tsx`, `useMobile.tsx`)
- **Types**: camelCase (e.g., `auth.ts`, `user.ts`)
- **Constants**: UPPER_SNAKE_CASE for exported constants

```typescript
// ✅ Good
// Button.tsx
// useAuth.tsx
// utils.ts
// auth.ts

// ❌ Bad
// button.tsx
// use-auth.tsx
// Utils.ts
```

## Import Statements

### Import Order

Group imports in the following order:

1. External dependencies (React, third-party libraries)
2. Internal absolute imports (using `@/` alias)
3. Relative imports
4. Type-only imports (use `import type`)

```typescript
// ✅ Good
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/forms/FormField';
import type { User } from '@/types/auth';
```

### Import Style

- Use named imports when possible
- Use default imports only when necessary
- Group related imports together
- Use `import type` for type-only imports

```typescript
// ✅ Good
import { useState, useEffect, type ReactNode } from 'react';
import type { UserProfile } from '@/types/auth';

// ✅ Good - default import for pages
import Login from '@/pages/Login';
```

## Component Structure

### Component Layout

Structure components in this order:

1. Imports
2. Type/Interface definitions
3. Component definition
4. Helper functions (if needed)
5. Export

```typescript
// ✅ Good
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
}

export const MyComponent = ({ title }: MyComponentProps) => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Count: {count}</Button>
    </div>
  );
};
```

### Event Handlers

- Prefix event handlers with `handle`
- Use descriptive names that indicate the action

```typescript
// ✅ Good
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // ...
};

const handleUserClick = (userId: string) => {
  // ...
};

// ❌ Bad
const onClick = () => {};
const click = () => {};
```

## Styling with Tailwind CSS

### Class Organization

Order Tailwind classes in this general order:

1. Layout (display, position, flex, grid)
2. Spacing (margin, padding)
3. Sizing (width, height)
4. Typography (font, text)
5. Visual (background, border, shadow)
6. Effects (opacity, transform)
7. Responsive variants

```typescript
// ✅ Good
<div className="flex items-center gap-4 p-4 w-full text-lg bg-background border rounded-lg shadow-md hover:opacity-90 md:p-6">
  {/* content */}
</div>
```

### Responsive Design

- Use mobile-first approach
- Apply responsive variants when needed
- Group responsive classes together

```typescript
// ✅ Good
<div className="flex flex-col gap-4 md:flex-row md:gap-6 lg:gap-8">
  {/* content */}
</div>
```

### Dynamic Classes

- Use the `cn()` utility function for conditional classes
- Keep class logic readable

```typescript
// ✅ Good
import { cn } from '@/lib/utils';

<button
  className={cn(
    'base-classes',
    isActive && 'active-classes',
    disabled && 'disabled-classes',
    className
  )}
>
  {children}
</button>
```

### Color Usage

- Use semantic color tokens from the theme
- Prefer theme colors over hardcoded colors
- Use `text-*`, `bg-*`, `border-*` with semantic names

```typescript
// ✅ Good
<div className="bg-background text-foreground border-border">
  <p className="text-muted-foreground">Secondary text</p>
</div>

// ❌ Bad
<div className="bg-white text-black border-gray-300">
  {/* Hardcoded colors */}
</div>
```

## Layout Patterns

### Page Layout Structure

The application uses two main layout patterns:

#### AppLayout (Authenticated Pages)

- **Sticky Header**: Header remains visible while scrolling
- **Container-based Content**: Main content uses `container` class for consistent max-width and padding
- **Responsive Navigation**: Desktop horizontal nav, mobile hamburger menu
- **User Menu**: Dropdown menu in header with profile and admin links

```typescript
// ✅ Good - Using AppLayout for authenticated pages
import { AppLayout } from '@/components/layout/AppLayout';

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page content */}
      </div>
    </AppLayout>
  );
};
```

#### AuthLayout (Authentication Pages)

- **Split-screen Design**: Branding panel (left) and form panel (right)
- **Responsive**: Single column on mobile, split on desktop
- **Centered Form**: Form content centered with max-width constraint

```typescript
// ✅ Good - Using AuthLayout for auth pages
import { AuthLayout } from '@/components/layout/AuthLayout';

const Login = () => {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue">
      <form>{/* Form content */}</form>
    </AuthLayout>
  );
};
```

### Container Usage

- Use `container` class for main content areas
- Provides consistent max-width and padding
- Automatically centers content

```typescript
// ✅ Good
<main className="container py-8">
  {/* Content */}
</main>

// ✅ Good - Max width for forms
<div className="max-w-2xl mx-auto">
  {/* Form content */}
</div>
```

### Content Spacing

Use consistent spacing patterns:

- **Page Sections**: `space-y-8` for major page sections
- **Forms**: `space-y-6` for form containers
- **Form Groups**: `space-y-4` for form field groups
- **Card Content**: `space-y-4` or `space-y-6` within cards

```typescript
// ✅ Good
<div className="space-y-8">
  <section>{/* Section 1 */}</section>
  <section>{/* Section 2 */}</section>
</div>

<form className="space-y-6">
  <div className="space-y-4">
    {/* Form fields */}
  </div>
</form>
```

### Responsive Breakpoints

Follow mobile-first approach with Tailwind breakpoints:

- **Mobile**: Default (no prefix)
- **Tablet**: `md:` (768px+)
- **Desktop**: `lg:` (1024px+)
- **Large Desktop**: `xl:` (1280px+)

```typescript
// ✅ Good - Mobile first
<div className="flex flex-col gap-4 md:flex-row md:gap-6 lg:gap-8">
  {/* Content */}
</div>

// ✅ Good - Hide on mobile, show on desktop
<nav className="hidden md:flex">
  {/* Navigation */}
</nav>
```

### Grid Systems

- Use **Flexbox** for one-dimensional layouts (rows or columns)
- Use **Grid** for two-dimensional layouts (rows and columns)
- Prefer flexbox for most layouts

```typescript
// ✅ Good - Flexbox for row layout
<div className="flex items-center gap-4">
  {/* Items */}
</div>

// ✅ Good - Grid for card layouts
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* Cards */}
</div>
```

## Design System

### Color Palette

The application uses a professional slate/navy palette with amber accents:

- **Primary**: Slate/navy `hsl(222 47% 20%)` - Main brand color
- **Accent**: Amber `hsl(38 92% 50%)` - Highlights and CTAs
- **Success**: Green `hsl(142 76% 36%)` - Success states
- **Warning**: Amber `hsl(38 92% 50%)` - Warning states
- **Destructive**: Red `hsl(0 84% 60%)` - Error states

**Always use semantic color tokens, never hardcoded colors:**

```typescript
// ✅ Good - Semantic tokens
<div className="bg-background text-foreground">
  <p className="text-primary">Primary text</p>
  <p className="text-muted-foreground">Muted text</p>
  <button className="bg-accent text-accent-foreground">Action</button>
</div>

// ❌ Bad - Hardcoded colors
<div className="bg-white text-black">
  <p className="text-blue-600">Text</p>
</div>
```

### Typography Scale

**Font Families:**
- **Display**: DM Sans (headings, titles)
- **Body**: Inter (body text, UI elements)

**Font Sizes:**
- `text-sm` - Small text, captions (14px)
- `text-base` - Body text (16px)
- `text-lg` - Large body text (18px)
- `text-xl` - Small headings (20px)
- `text-2xl` - Medium headings (24px)
- `text-3xl` - Large headings (30px)

**Font Weights:**
- `font-medium` - Medium weight (500)
- `font-semibold` - Semi-bold (600)
- `font-bold` - Bold (700)

```typescript
// ✅ Good
<h1 className="text-3xl font-display font-bold">Page Title</h1>
<p className="text-base text-muted-foreground">Body text</p>
<small className="text-sm text-muted-foreground">Caption</small>
```

### Spacing Scale

Use Tailwind spacing scale consistently:

**Gaps (between elements):**
- Small: `gap-2` (8px), `gap-3` (12px)
- Medium: `gap-4` (16px), `gap-6` (24px)
- Large: `gap-8` (32px)

**Padding (internal spacing):**
- Cards: `p-6` (24px)
- Page sections: `p-8` (32px)
- Small elements: `p-4` (16px)

**Margins (external spacing):**
- Use `space-y-*` for vertical spacing between children
- Use `mb-*`, `mt-*` sparingly for specific spacing needs

```typescript
// ✅ Good
<Card className="p-6">
  <div className="space-y-4">
    <h2 className="mb-2">Title</h2>
    <p>Content</p>
  </div>
</Card>
```

### Border Radius

Use theme radius tokens:

- `rounded-sm` - Small radius (4px)
- `rounded-md` - Medium radius (6px)
- `rounded-lg` - Large radius (10px) - Default

```typescript
// ✅ Good
<button className="rounded-lg">Button</button>
<div className="rounded-md border">Card</div>
```

### Shadows

Use semantic shadow tokens:

- `shadow-sm` - Subtle shadow for cards
- `shadow-md` - Medium shadow for elevated elements
- `shadow-lg` - Large shadow for modals/dialogs
- `shadow-glow` - Special glow effect for accents

```typescript
// ✅ Good
<Card className="shadow-sm">Content</Card>
<Dialog className="shadow-lg">Modal</Dialog>
```

### Animations

Available animation utilities:

- `animate-fade-in` - Fade in effect
- `animate-slide-up` - Slide up from bottom
- `animate-slide-down` - Slide down from top
- `animate-scale-in` - Scale in effect

```typescript
// ✅ Good
<div className="animate-fade-in">
  {/* Content appears with fade */}
</div>

<Alert className="animate-slide-down">
  {/* Alert slides down */}
</Alert>
```

## Component Design Patterns

### Card Components

Use the standard Card component structure:

```typescript
// ✅ Good
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Structure:**
- `Card` - Container with border, background, and shadow
- `CardHeader` - Header section with padding (p-6)
- `CardTitle` - Heading (text-2xl, font-semibold)
- `CardDescription` - Subtitle (text-sm, text-muted-foreground)
- `CardContent` - Main content area (p-6, pt-0)

### Form Layout

Use FormField wrapper for consistent form styling:

```typescript
// ✅ Good
<form className="space-y-6">
  <div className="space-y-4">
    <FormField label="Email" htmlFor="email" error={errors.email?.message}>
      <Input id="email" {...register('email')} />
    </FormField>
    
    <FormField label="Password" htmlFor="password" error={errors.password?.message}>
      <PasswordInput id="password" {...register('password')} />
    </FormField>
  </div>
  
  <Button type="submit">Submit</Button>
</form>
```

**Spacing:**
- Form container: `space-y-6`
- Form field groups: `space-y-4`
- Individual fields: Use FormField component

### Button Patterns

**Icon + Text:**
```typescript
// ✅ Good
<Button className="gap-2">
  <Save className="h-4 w-4" />
  Save Changes
</Button>
```

**Loading States:**
```typescript
// ✅ Good
<Button disabled={isSubmitting}>
  {isSubmitting ? (
    <LoadingSpinner size="sm" />
  ) : (
    <>
      <LogIn className="h-4 w-4" />
      Sign in
    </>
  )}
</Button>
```

**Variants:**
- `default` - Primary action
- `secondary` - Secondary action
- `outline` - Outlined button
- `ghost` - Minimal button
- `destructive` - Destructive action

### Icon Usage

Use consistent icon sizing:

- **Small**: `h-4 w-4` (16px) - Inline with text, buttons
- **Medium**: `h-5 w-5` (20px) - Card headers, larger buttons
- **Large**: `h-6 w-6` (24px) - Page headers, hero sections

```typescript
// ✅ Good
<Button className="gap-2">
  <Save className="h-4 w-4" />
  Save
</Button>

<CardTitle className="flex items-center gap-2">
  <User className="h-5 w-5 text-primary" />
  Profile
</CardTitle>
```

### Loading States

Use LoadingSpinner component consistently:

```typescript
// ✅ Good
{loading ? (
  <LoadingSpinner size="lg" text="Loading..." />
) : (
  <Content />
)}

<Button disabled={isSubmitting}>
  {isSubmitting ? (
    <LoadingSpinner size="sm" />
  ) : (
    'Submit'
  )}
</Button>
```

### Error Display

Use Alert component with AlertCircle icon:

```typescript
// ✅ Good
{error && (
  <Alert variant="destructive" className="animate-slide-down">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      {error.message || 'An error occurred'}
    </AlertDescription>
  </Alert>
)}
```

## Visual Hierarchy

### Headings

Use `font-display` for all headings and maintain proper size hierarchy:

```typescript
// ✅ Good
<h1 className="text-3xl font-display font-bold">Page Title</h1>
<h2 className="text-2xl font-display font-semibold">Section Title</h2>
<h3 className="text-xl font-display font-semibold">Subsection</h3>
```

**Hierarchy:**
- H1: `text-3xl font-bold` - Page titles
- H2: `text-2xl font-semibold` - Section titles
- H3: `text-xl font-semibold` - Subsections
- H4+: `text-lg font-semibold` - Minor headings

### Text Colors

Use semantic text color tokens:

- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary/muted text
- `text-destructive` - Error text
- `text-primary` - Primary brand color text
- `text-accent` - Accent color text

```typescript
// ✅ Good
<p className="text-foreground">Primary text</p>
<p className="text-muted-foreground">Secondary text</p>
<p className="text-destructive">Error message</p>
```

### Spacing Between Elements

Maintain consistent vertical rhythm:

- **Page sections**: `space-y-8` (32px)
- **Card sections**: `space-y-6` (24px)
- **Form groups**: `space-y-4` (16px)
- **Related items**: `gap-2` to `gap-4` (8-16px)

```typescript
// ✅ Good - Consistent vertical rhythm
<div className="space-y-8">
  <section className="space-y-4">
    <h2>Title</h2>
    <p>Content</p>
  </section>
</div>
```

### Focus States

Ensure visible focus rings for accessibility:

- Use default focus-visible styles from shadcn/ui components
- Focus rings use `ring-2 ring-ring ring-offset-2`
- All interactive elements should have visible focus states

```typescript
// ✅ Good - Button has built-in focus styles
<Button>Click me</Button>

// ✅ Good - Custom focus styles if needed
<input className="focus-visible:ring-2 focus-visible:ring-ring" />
```

## Error Handling

### Error Patterns

- Use try-catch for async operations
- Provide meaningful error messages
- Handle errors at the appropriate level
- Return error objects consistently

```typescript
// ✅ Good
const fetchUser = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return { error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: error as Error };
  }
};
```

### Error Display

- Show user-friendly error messages
- Use consistent error UI components
- Log detailed errors for debugging

```typescript
// ✅ Good
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      {error.message || 'An unexpected error occurred'}
    </AlertDescription>
  </Alert>
)}
```

## Type Safety

### Strict Typing

- Avoid `any` - use `unknown` if type is truly unknown
- Use type assertions sparingly and with caution
- Leverage TypeScript's type inference when appropriate
- Define types for API responses and data structures

```typescript
// ✅ Good
interface ApiResponse {
  data: User[];
  error: string | null;
}

const response: ApiResponse = await fetchUsers();

// ❌ Bad
const response: any = await fetchUsers();
```

### Form Validation

- Use Zod for runtime validation
- Infer TypeScript types from Zod schemas
- Validate on both client and server when possible

```typescript
// ✅ Good
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password too short'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

## Comments and Documentation

### When to Comment

- Explain "why" not "what" - code should be self-documenting
- Document complex algorithms or business logic
- Add JSDoc comments for public APIs
- Explain non-obvious workarounds or hacks

```typescript
// ✅ Good
// Calculate discount based on user tier and purchase history
// TCM users get 20% discount, regular users get 10% if they've made 5+ purchases
const calculateDiscount = (user: User, purchaseCount: number): number => {
  // ...
};

// ❌ Bad
// Set discount to 0.2
const discount = 0.2;
```

### JSDoc Comments

- Use JSDoc for exported functions and components
- Document parameters and return types
- Include examples for complex functions

```typescript
// ✅ Good
/**
 * Fetches user profile from the database
 * @param userId - The unique identifier for the user
 * @returns Promise resolving to user profile or null if not found
 * @throws {Error} If database connection fails
 */
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  // ...
};
```

## Code Formatting

### General Rules

- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Single quotes for strings
- **Semicolons**: Always use semicolons
- **Line Length**: Maximum 100 characters (soft limit)
- **Trailing Commas**: Use trailing commas in multi-line objects/arrays
- **Arrow Functions**: Use parentheses for single parameters when type annotations are needed

### Formatting Examples

```typescript
// ✅ Good
const user = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
};

const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  console.log('Clicked');
};

// ❌ Bad
const user = {
  id: "123",
  name: "John Doe",
  email: "john@example.com"
}

const handleClick = event => {
  console.log("Clicked")
}
```

### Prettier Configuration

This project uses Prettier for automatic code formatting. Run `npm run format` before committing code.

## Enforcement

### Automated Tools

- **Prettier**: Handles code formatting automatically
- **ESLint**: Catches code quality issues and enforces patterns
- **TypeScript**: Provides type checking

### Pre-commit Checks

Before committing:
1. Run `npm run format` to format code
2. Run `npm run lint` to check for issues
3. Run `npm run type-check` to verify types

### CI/CD

The build pipeline will:
- Check code formatting with `npm run format:check`
- Run linting with `npm run lint`
- Verify TypeScript types

## Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prettier Documentation](https://prettier.io/docs/en/)

---

**Remember**: The goal is consistency and maintainability. When in doubt, follow existing patterns in the codebase.
