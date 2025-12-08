#!/bin/bash

# Script para aplicar la migración de token_base64_encoded a la tabla credentials
# Este script es seguro ejecutarlo múltiples veces (idempotent)

echo "🔄 Aplicando migración: token_base64_encoded a tabla credentials..."

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    echo "📄 Loading environment variables from .env file..."
    set -a  # automatically export all variables
    source .env
    set +a  # stop automatically exporting
fi

# Database connection parameters (with environment variable support)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-cpo_ocpi}"
DB_USER="${DB_USER:-cpo_user}"
DB_PASSWORD="${DB_PASSWORD:-cpo_password}"

# Set PGPASSWORD to avoid interactive password prompt
export PGPASSWORD="$DB_PASSWORD"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Execute migration script
echo "📊 Applying migration..."
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$SCRIPT_DIR/migrate_add_token_base64_encoded.sql"; then
    echo "✅ Migración aplicada exitosamente!"
    echo ""
    echo "📊 Verificando columna..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
        SELECT 
            column_name, 
            data_type, 
            is_nullable, 
            column_default
        FROM information_schema.columns 
        WHERE table_name = 'credentials' 
            AND column_name = 'token_base64_encoded';
    "
else
    echo "❌ Error aplicando migración!"
    echo "   Por favor verifica que PostgreSQL esté corriendo y accesible."
    echo "   Detalles de conexión: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
    exit 1
fi

