# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/bef2138c-10fa-4727-8c64-95e9272e45b3

## Environment Variables Setup

This application uses environment variables for configuration. Follow these steps to set up your environment:

1. Create a `.env` file in the root directory of the project
2. Copy the contents from `.env.example` to your `.env` file
3. Replace the placeholder values with your actual API keys and configuration

### Required Environment Variables

- `VITE_OPENROUTER_API_KEY`: Your OpenRouter API key for the chat functionality
- `VITE_OPENROUTER_MODEL_NAME`: The model name to use with OpenRouter (e.g., "anthropic/claude-3-sonnet" or other supported models)

The application uses a centralized API key stored in environment variables instead of requiring users to input their own keys.

### Other Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `VITE_STORAGE_URL`: Your storage URL
- `VITE_SITE_URL`: Your site URL (used instead of window.location.origin)
- `VITE_ADMIN_EMAIL`: Admin email address

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up your environment variables as described above.

3. Start the development server:

   ```bash
   npm run dev
   ```

## Contributing

Please ensure you have all environment variables properly configured before submitting any changes.

## License

This project is private and confidential. All rights reserved.
