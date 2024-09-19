# ProxyLink

# Database Management

This directory contains files for managing the Firestore database schema and initialization.

## Files:

- `schema.ts`: Defines collection names and document interfaces
- `init.ts`: Handles database initialization

## Usage:

1. Update `schema.ts` when adding new collections or fields
2. Run initialization during app deployment or setup

## Migration Strategy:

We use schema versioning. When making schema changes:

1. Increment `CURRENT_SCHEMA_VERSION` in `schema.ts`
2. Create a migration script in a new `migrations` folder
3. Run the migration script during deployment

For any questions, contact the development team.
