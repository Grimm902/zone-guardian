# Zone Guardian

## Project info

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

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

**Before committing code, always run:**

```sh
# Format all code
npm run format

# Check code formatting (without modifying files)
npm run format:check

# Run linting
npm run lint

# Check TypeScript types
npm run type-check

# Or run format and lint together
npm run format:fix
```

### Editor Setup

For the best experience, configure your editor to:
- Format on save using Prettier
- Show ESLint errors inline
- Use the project's Prettier configuration

**VS Code**: Install the "Prettier - Code formatter" and "ESLint" extensions. The project's Prettier config will be automatically used.

## How can I deploy this project?

Deploy using your preferred hosting service.

## Can I connect a custom domain to my project?

Yes, you can!

To connect a domain, follow your hosting provider's instructions for custom domain setup.
