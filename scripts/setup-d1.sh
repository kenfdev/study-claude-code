#!/bin/bash

# Create D1 database
echo "Creating D1 database..."
wrangler d1 create todo-app-db

echo ""
echo "Please update wrangler.toml with the database_id from above output"
echo ""

# Execute schema
echo "Executing database schema..."
wrangler d1 execute todo-app-db --file=./schema.sql

echo "D1 database setup complete!"