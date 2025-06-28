# Contributing to CodeCollab AI

Thank you for your interest in contributing to CodeCollab AI! This guide will help you get set up with the development environment and understand our workflow.

## Development Setup

### 1. Environment Setup

We use Supabase for authentication, database, and real-time features. To set up your local environment:

#### Automated Setup (Recommended)

Run our setup wizard:

```bash
npm run setup-env
```

This interactive wizard will guide you through configuring your local environment.

#### Manual Setup

Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Start Development

```bash
npm run dev
```

## GitHub Workflow

### Setting Up Repository Secrets

If you're a maintainer or setting up your own fork for deployment, you'll need to add these GitHub secrets:

1. Go to your repository Settings > Secrets and variables > Actions
2. Add the following secrets:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
   - `NETLIFY_SITE_ID`: Your Netlify site ID

These secrets will be used by the GitHub Actions workflow for building and deploying your application.

## Database Migrations

The `supabase/migrations` directory contains SQL scripts for database setup. These are automatically applied during CI/CD deployment.

To apply migrations locally:

```bash
npx supabase db reset
```

This requires the Supabase CLI to be installed and configured.

## Code Style

We use ESLint and Prettier for code formatting. Please ensure your code passes linting before submitting a PR:

```bash
npm run lint
```

## Testing

Run the test suite before submitting a PR:

```bash
npm test
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and ensure they pass
4. Submit a pull request to `main`
5. Wait for code review and address any feedback

## Questions?

If you have any questions about contributing, please open an issue or reach out to the maintainers.

Thank you for contributing to CodeCollab AI!