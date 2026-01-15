# Setup Guide

This guide will help you set up the Zone Guardian application for local development.

## Prerequisites

- **Node.js** 20.x or higher ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- **npm** (comes with Node.js)
- **Supabase account** ([sign up for free](https://supabase.com))

## Step 1: Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd zone-guardian
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Supabase

### 3.1 Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - **Name**: Zone Guardian (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to you
4. Click "Create new project"
5. Wait for the project to be created (this may take a few minutes)

### 3.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll need two values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys" → "anon public")

### 3.3 Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
   ```

   Replace:
   - `your-project-id` with your actual Supabase project ID
   - `your-anon-key-here` with your actual anon public key

### 3.4 Set Up the Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New query"
3. Open the file `supabase/schema.sql` from this repository
4. Copy the entire contents of `schema.sql`
5. Paste it into the SQL Editor
6. Click "Run" (or press `Ctrl+Enter` / `Cmd+Enter`)
7. You should see "Success. No rows returned"

This will create:
- The `profiles` table
- User roles enum type
- Row Level Security (RLS) policies
- Database functions and triggers

### 3.5 Verify Database Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see a `profiles` table
3. Click on it to verify it has the correct columns:
   - `id` (uuid, primary key)
   - `email` (text)
   - `full_name` (text)
   - `phone` (text, nullable)
   - `role` (user_roles enum)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

## Step 4: Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## Step 5: Create Your First User

1. Open the application in your browser
2. Click "Create account" or navigate to `/register`
3. Fill in the registration form:
   - **Full Name**: Your name
   - **Email**: Your email address
   - **Password**: At least 6 characters
4. Click "Create account"
5. Check your email for a confirmation link (if email confirmation is enabled)
6. After confirming, you can log in

### Setting Up an Admin User (TCM Role)

By default, new users are created with the `tcp` (Traffic Control Person) role. To create an admin user:

1. In Supabase dashboard, go to **Table Editor** → **profiles**
2. Find your user's profile (by email)
3. Click to edit the row
4. Change the `role` field to `tcm`
5. Save the changes

Now you'll have admin access and can manage users through the application!

## Troubleshooting

### Environment Variables Not Loading

- Make sure your `.env` file is in the root directory (same level as `package.json`)
- Restart the development server after creating/modifying `.env`
- Check that variable names start with `VITE_` (required for Vite)

### Database Connection Errors

- Verify your Supabase URL and key are correct in `.env`
- Check that your Supabase project is active (not paused)
- Ensure you've run the schema.sql script

### Type Errors

- Run `npm run type-check` to see detailed TypeScript errors
- Make sure all dependencies are installed: `npm install`

### Build Errors

- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check that you're using Node.js 20.x or higher

## Next Steps

- Read the [Development Guide](./DEVELOPMENT.md) for development workflows
- Check the [Architecture Overview](./ARCHITECTURE.md) to understand the codebase structure
- Review the [Style Guide](../guides/STYLE_GUIDE.md) for coding standards

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review the error messages in the browser console and terminal
3. Check Supabase logs in the dashboard (Settings → Logs)
4. Open an issue on GitHub with details about your problem
