#!/bin/bash

# Get the project reference from config.toml
PROJECT_REF=$(grep -o 'project_id = "[^"]*"' "$(dirname "$0")/config.toml" | cut -d '"' -f 2)

if [ -z "$PROJECT_REF" ]; then
  echo "Error: Could not find project_id in config.toml"
  exit 1
fi

echo "Updating TypeScript types for project: $PROJECT_REF"

# Generate TypeScript types
npx supabase gen types typescript --project-id "$PROJECT_REF" --schema public > "$(dirname "$0")/../src/integrations/supabase/types.ts"

echo "TypeScript types updated successfully!"