# Architecture Overview

This document provides an overview of the Zone Guardian application architecture.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Application                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Pages      │  │  Components  │  │    Hooks      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘ │
│         │                 │                  │           │
│  ┌──────▼─────────────────▼──────────────────▼────────┐ │
│  │           React Query (State Management)            │ │
│  └──────────────────────┬─────────────────────────────┘ │
│                         │                                 │
│  ┌──────────────────────▼─────────────────────────────┐ │
│  │              Service Layer                          │ │
│  │  (Supabase query abstractions)                      │ │
│  └──────────────────────┬─────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    Supabase Backend                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Auth        │  │  Database     │  │   Storage    │ │
│  │  (Users)     │  │  (PostgreSQL) │  │   (Files)    │ │
│  └──────────────┘  └───────────────┘  └──────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleRoute.tsx
│   ├── forms/          # Form components
│   │   ├── FormField.tsx
│   │   └── PasswordInput.tsx
│   ├── layout/         # Layout components
│   │   ├── AppLayout.tsx
│   │   └── AuthLayout.tsx
│   └── ui/             # Reusable UI components (shadcn/ui)
│       ├── button.tsx
│       ├── input.tsx
│       └── ...
│
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication state
│
├── hooks/              # Custom React hooks
│   ├── queries/        # React Query hooks
│   │   ├── queryKeys.ts
│   │   └── useProfile.ts
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── integrations/       # Third-party integrations
│   └── supabase/
│       ├── client.ts   # Supabase client instance
│       └── types.ts    # Generated TypeScript types
│
├── lib/                # Utility functions
│   ├── env.ts         # Environment variable validation
│   ├── errors.ts      # Error handling utilities
│   ├── logger.ts      # Logging utilities
│   ├── utils.ts       # General utilities
│   └── validations.ts # Zod validation schemas
│
├── pages/              # Page components (routes)
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Profile.tsx
│   └── ...
│
├── services/           # API service layer
│   └── supabase.ts    # Database query abstractions
│
├── test/               # Test utilities
│   ├── setup.ts       # Test configuration
│   └── utils.tsx      # Test helpers
│
└── types/              # TypeScript type definitions
    └── auth.ts         # Authentication types
```

## Data Flow

### Authentication Flow

```
1. User logs in
   ↓
2. AuthContext.signIn() called
   ↓
3. Supabase auth.signInWithPassword()
   ↓
4. Auth state change listener fires
   ↓
5. AuthContext loads user profile
   ↓
6. Profile data stored in context
   ↓
7. Protected routes check auth state
```

### Data Fetching Flow

```
1. Component uses React Query hook
   ↓
2. Hook calls service function
   ↓
3. Service function queries Supabase
   ↓
4. Data returned and cached by React Query
   ↓
5. Component re-renders with data
```

### Mutation Flow

```
1. User action triggers mutation
   ↓
2. React Query mutation hook called
   ↓
3. Service function updates Supabase
   ↓
4. On success: invalidate related queries
   ↓
5. Queries refetch automatically
   ↓
6. UI updates with fresh data
```

## Key Concepts

### Authentication

- **AuthContext**: Centralized authentication state
- **ProtectedRoute**: Wraps routes requiring authentication
- **RoleRoute**: Wraps routes requiring specific roles
- **Session Management**: Handled by Supabase with localStorage persistence

### State Management

- **React Query**: Server state (data from API)
- **React Context**: Global client state (auth, theme)
- **Local State**: Component-specific state (useState)

### Error Handling

- **Error Boundary**: Catches React component errors
- **Error Utilities**: Centralized error message mapping
- **Logger**: Structured logging with error tracking integration point

### Type Safety

- **TypeScript**: Full type coverage
- **Zod**: Runtime validation for forms and env vars
- **Generated Types**: Supabase types from database schema

### Security

- **Row Level Security (RLS)**: Database-level access control
- **Role-Based Access**: Application-level role checks
- **Environment Variables**: Validated at runtime

## Component Patterns

### Page Components

- Default exports
- Use layout components (AppLayout, AuthLayout)
- Handle loading and error states

### UI Components

- Named exports
- Composable and reusable
- Follow shadcn/ui patterns

### Form Components

- Use React Hook Form with Zod
- Use FormField wrapper
- Show validation errors inline

## Service Layer Pattern

Services abstract Supabase queries:

```typescript
// Service function
export const profileService = {
  async getById(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    return handleSupabaseError(data, error);
  },
};

// React Query hook
export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.profiles.current(),
    queryFn: () => profileService.getById(user.id),
  });
};
```

## Testing Strategy

- **Unit Tests**: Utility functions, hooks
- **Component Tests**: UI components with React Testing Library
- **Integration Tests**: Service functions with mocked Supabase
- **E2E Tests**: (Future) Full user flows

## Build & Deployment

### Development

- Vite dev server with HMR
- TypeScript type checking
- ESLint for code quality

### Production

- Vite build for optimized bundle
- Environment variable validation
- Error tracking integration ready

## Future Considerations

- **Code Splitting**: Route-based lazy loading
- **Caching Strategy**: React Query cache configuration
- **Offline Support**: Service worker integration
- **Real-time**: Supabase real-time subscriptions
- **File Uploads**: Supabase storage integration
- **Analytics**: User behavior tracking
- **Monitoring**: Error tracking service (Sentry) integration
