# Zone Guardian

A modern traffic control management application built with React, TypeScript, and Supabase.

## Quick Start

### Prerequisites

- **Node.js** 20.x or higher ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- **npm** (comes with Node.js)
- **Supabase account** ([sign up for free](https://supabase.com))

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd zone-guardian
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Supabase credentials
   ```

4. **Set up the database**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from Settings → API
   - Add them to your `.env` file
   - Run the schema: Copy `supabase/schema.sql` and run it in Supabase SQL Editor

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:8080`

📖 **For detailed setup instructions, see [docs/SETUP.md](docs/SETUP.md)**

## Documentation

- **[Setup Guide](docs/SETUP.md)** - Detailed setup instructions for local development
- **[Development Guide](docs/DEVELOPMENT.md)** - Development workflows and best practices
- **[Architecture Overview](docs/ARCHITECTURE.md)** - Codebase structure and design decisions
- **[Style Guide](guides/STYLE_GUIDE.md)** - Coding standards and conventions

## Tech Stack

### Core
- **[React](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Vite](https://vitejs.dev/)** - Build tool and dev server

### UI & Styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Component library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Icon library

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend as a Service
  - Authentication
  - PostgreSQL database
  - Row Level Security (RLS)

### State Management & Data Fetching
- **[React Query](https://tanstack.com/query)** - Server state management
- **[React Router](https://reactrouter.com/)** - Client-side routing

### Forms & Validation
- **[React Hook Form](https://react-hook-form.com/)** - Form management
- **[Zod](https://zod.dev/)** - Schema validation

### Development Tools
- **[Vitest](https://vitest.dev/)** - Unit testing
- **[React Testing Library](https://testing-library.com/react)** - Component testing
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting

## Code Style Guide

This project follows a comprehensive style guide to ensure consistency and maintainability. **All code must follow the style guide.**

### Style Guide Documentation

See [`guides/STYLE_GUIDE.md`](guides/STYLE_GUIDE.md) for the complete style guide covering:
- TypeScript and React patterns
- File organization and naming conventions
- Import statement organization
- Component structure
- Tailwind CSS usage
- Error handling patterns
- Type safety practices
- Code formatting rules

### Code Formatting

This project uses [Prettier](https://prettier.io/) for automatic code formatting and [ESLint](https://eslint.org/) for code quality checks.

## Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run type-check    # Check TypeScript types
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
npm run format:fix    # Format and lint together
```

### Testing
```bash
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
```

**Before committing code, always run:**
```bash
npm run format:fix && npm run type-check && npm run test:run
```

### Editor Setup

For the best experience, configure your editor to:
- Format on save using Prettier
- Show ESLint errors inline
- Use the project's Prettier configuration

**VS Code**: Install the "Prettier - Code formatter" and "ESLint" extensions. The project's Prettier config will be automatically used.

## Project Structure

```
src/
├── components/       # React components
│   ├── auth/        # Authentication components
│   ├── forms/       # Form components
│   ├── layout/      # Layout components
│   └── ui/          # UI components (shadcn/ui)
├── contexts/         # React contexts
├── hooks/            # Custom React hooks
│   └── queries/     # React Query hooks
├── integrations/     # Third-party integrations
│   └── supabase/    # Supabase client and types
├── lib/              # Utility functions
├── pages/            # Page components
├── services/         # API service layer
├── test/             # Test utilities
└── types/            # TypeScript type definitions
```

## Features

- ✅ **Authentication** - Email/password auth with Supabase
- ✅ **Role-Based Access Control** - Multiple user roles (TCM, SM, DC, FS, TWS, TCP)
- ✅ **Protected Routes** - Route protection based on authentication and roles
- ✅ **User Management** - Admin panel for user management (TCM only)
- ✅ **Profile Management** - User profile editing
- ✅ **Dark Mode** - Theme switching support
- ✅ **Form Validation** - Zod schema validation with React Hook Form
- ✅ **Error Handling** - Comprehensive error boundaries and handling
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Testing** - Vitest and React Testing Library setup

## Contributing

1. Follow the [Style Guide](guides/STYLE_GUIDE.md)
2. Write tests for new features
3. Ensure all checks pass before submitting PRs
4. Update documentation as needed

## License

[Add your license here]
