# Supabase Configuration

This directory contains configuration and migration files for the Supabase backend used by the DeepList AI application.

## Project Structure

- `config.toml` - Contains the Supabase project reference ID
- `migrations/` - Contains SQL migration scripts to set up the database schema

## Applying Migrations

To apply the migrations to your Supabase instance, follow the instructions in the [migrations/README.md](./migrations/README.md) file.

## Important Notes

- The application requires certain tables to be present in your Supabase instance, including the `admin_users` table for admin functionality.
- After applying migrations, you'll need to add at least one admin user to the `admin_users` table (see instructions in migrations README).
- Remember to update your TypeScript types after applying migrations to ensure your application code is aware of the database structure.

## Troubleshooting

If you encounter issues with the Supabase integration:

1. Verify that your environment variables are correctly set in your `.env` file:

   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

2. Ensure all migrations have been applied to your Supabase instance.

3. Check that your user has been added to the `admin_users` table if you're trying to access admin functionality.

4. If you're developing locally, you can use the Supabase CLI to start a local Supabase instance for development:
   ```bash
   npx supabase start
   ```
