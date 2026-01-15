# Development Guide

This guide covers development workflows, best practices, and common tasks.

## Development Workflow

### Starting Development

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open the application**
   - Navigate to `http://localhost:8080`
   - The app will hot-reload on file changes

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the [Style Guide](../guides/STYLE_GUIDE.md)
   - Write tests for new features
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run test:run
   npm run type-check
   npm run lint
   ```

4. **Format your code**
   ```bash
   npm run format:fix
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

### Code Quality Checks

Before committing, ensure all checks pass:

```bash
# Format and lint
npm run format:fix

# Type check
npm run type-check

# Run tests
npm run test:run
```

## Testing

### Running Tests

```bash
# Watch mode (recommended during development)
npm run test

# Run once
npm run test:run

# With UI
npm run test:ui

# With coverage
npm run test:coverage
```

### Writing Tests

- Place test files next to the code they test: `Component.test.tsx`
- Or in a `__tests__` directory
- Use the custom `render` from `@/test/utils` for components that need providers

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Button } from './button';

describe('Button', () => {
  it('should render', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

## API Development

### Using React Query Hooks

The app uses React Query for data fetching. Use the provided hooks:

```typescript
import { useProfile, useUpdateProfile } from '@/hooks/queries/useProfile';

function MyComponent() {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();

  const handleUpdate = async () => {
    await updateProfile.mutateAsync({ full_name: 'New Name' });
  };

  // ...
}
```

### Creating New Service Functions

1. Add the function to `src/services/supabase.ts`
2. Create a React Query hook in `src/hooks/queries/`
3. Add query keys to `src/hooks/queries/queryKeys.ts`

Example:
```typescript
// services/supabase.ts
export const myService = {
  async getData(): Promise<{ data: Data[] | null; error: Error | null }> {
    const { data, error } = await supabase.from('table').select('*');
    return handleSupabaseError(data, error);
  },
};

// hooks/queries/useMyData.ts
export const useMyData = () => {
  return useQuery({
    queryKey: queryKeys.myData.all,
    queryFn: async () => {
      const { data, error } = await myService.getData();
      if (error) throw error;
      return data;
    },
  });
};
```

## Error Handling

### Using Error Utilities

```typescript
import { getErrorMessage, handleSupabaseError } from '@/lib/errors';

// In service functions
const { data, error } = await supabase.from('table').select('*');
return handleSupabaseError(data, error);

// In components
try {
  // ...
} catch (error) {
  const message = getErrorMessage(error);
  // Show user-friendly message
}
```

### Logging

```typescript
import { logger } from '@/lib/logger';

logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
```

## Environment Variables

### Adding New Environment Variables

1. Add to `.env.example`:
   ```env
   VITE_NEW_VARIABLE=default-value
   ```

2. Add validation to `src/lib/env.ts`:
   ```typescript
   const envSchema = z.object({
     // ... existing
     VITE_NEW_VARIABLE: z.string().min(1),
   });
   ```

3. Use in code:
   ```typescript
   import { env } from '@/lib/env';
   const value = env.VITE_NEW_VARIABLE;
   ```

## Database Changes

### Making Schema Changes

1. **Update the schema file**
   - Edit `supabase/schema.sql`
   - Make changes idempotent (use `IF NOT EXISTS`, etc.)

2. **Test locally**
   - Run the SQL in Supabase SQL Editor
   - Verify the changes work

3. **Update TypeScript types**
   - Regenerate types from Supabase (if using Supabase CLI)
   - Or manually update `src/integrations/supabase/types.ts`

4. **Update service functions**
   - Update relevant functions in `src/services/supabase.ts`
   - Update React Query hooks if needed

## Common Tasks

### Adding a New Page

1. Create the page component in `src/pages/`
2. Add the route in `src/App.tsx`
3. Add navigation link if needed

### Adding a New UI Component

1. Use shadcn/ui CLI if it's a standard component:
   ```bash
   npx shadcn-ui@latest add [component-name]
   ```

2. Or create custom component in `src/components/ui/`

### Adding a New Form

1. Create Zod schema in `src/lib/validations.ts`
2. Use React Hook Form with `zodResolver`
3. Use `FormField` component for inputs
4. Follow patterns from existing forms

## Debugging

### Browser DevTools

- React DevTools for component inspection
- Network tab for API requests
- Console for logs and errors

### Supabase Dashboard

- Check database tables in Table Editor
- View logs in Settings → Logs
- Test queries in SQL Editor

### TypeScript Errors

```bash
npm run type-check
```

Shows all TypeScript errors with file locations.

## Performance

### React Query Best Practices

- Use appropriate `staleTime` for queries
- Invalidate queries after mutations
- Use `queryClient.setQueryData` for optimistic updates

### Code Splitting

- Use React.lazy for route-based code splitting
- Lazy load heavy components

## Git Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring

### Commit Messages

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

Example: `feat: add user profile editing`

## Troubleshooting

### Vite Optimize Dep Errors

If you encounter "504 (Outdated Optimize Dep)" errors, this means Vite's dependency pre-bundling cache is stale. This can happen after:

- Dependency updates
- Node modules changes
- Vite version updates
- Cache corruption

**Solution:**

1. **Clear the Vite cache and restart:**
   ```bash
   npm run dev:clean
   ```

2. **Or clear cache manually:**
   ```bash
   npm run clean:cache
   npm run dev
   ```

3. **If the issue persists:**
   - Stop the dev server
   - Delete `node_modules/.vite` directory manually
   - Restart the dev server

The `clean:cache` script removes Vite's optimization cache, forcing it to re-bundle dependencies on the next start.

### Other Common Issues

**Port already in use:**
- Change the port in `vite.config.ts` or kill the process using port 8080

**Type errors after dependency updates:**
- Run `npm run type-check` to see all TypeScript errors
- Ensure all dependencies are properly installed: `npm install`

**Build errors:**
- Clear cache: `npm run clean:cache`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run type-check`

## Getting Help

- Check existing documentation
- Review similar code in the codebase
- Check Supabase documentation
- Open an issue on GitHub
