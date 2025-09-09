#!/bin/bash

# Master script to set up the CPO OCPI 2.2 database
# This script creates tables and populates them with sample data

echo "🚀 Starting CPO OCPI 2.2 database setup..."

# Database connection parameters (with environment variable support)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-cpo_ocpi}"
DB_USER="${DB_USER:-cpo_user}"
DB_PASSWORD="${DB_PASSWORD:-cpo_password}"

# Wait for PostgreSQL to be ready (with timeout)
echo "⏳ Waiting for PostgreSQL to be ready..."
TIMEOUT=60
ELAPSED=0
until psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" >/dev/null 2>&1; do
    if [ $ELAPSED -ge $TIMEOUT ]; then
        echo "❌ Timeout waiting for PostgreSQL to be ready!"
        echo "   Please check that PostgreSQL is running and accessible."
        echo "   Connection details: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
        exit 1
    fi
    echo "PostgreSQL is not ready yet, waiting... (${ELAPSED}s/${TIMEOUT}s)"
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

echo "✅ PostgreSQL is ready!"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Execute scripts in order with error checking
echo "📊 Creating database tables..."
if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$SCRIPT_DIR/init_database.sql"; then
    echo "❌ Error creating database tables!"
    echo "   Please check that PostgreSQL is running and accessible."
    echo "   Connection details: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
    exit 1
fi

echo "🗃️ Populating database with complete dataset..."
if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -v OCPI_TOKEN="${OCPI_TOKEN:-ocpi_token_ipd_2024_secure_key}" \
  -v OCPI_PARTY_ID="${OCPI_PARTY_ID:-IPD}" \
  -v OCPI_COUNTRY_CODE="${OCPI_COUNTRY_CODE:-ES}" \
  -f "$SCRIPT_DIR/complete_database_setup.sql"; then
    echo "❌ Error populating database!"
    echo "   Please check that the tables were created successfully."
    exit 1
fi

echo "✅ Database setup completed successfully!"
echo ""
echo "📊 Summary:"
echo "   - Tables created and configured"
echo "   - Complete dataset populated (locations, EVSEs, tariffs, tokens)"
echo "   - Locations across Spain and Portugal"
echo "   - EVSEs distributed with realistic specifications"
echo "   - Tariffs and tokens configured"
echo ""
echo "🌐 You can now start the application!"
