-- Initialize database for CPO OCPI 2.2 application
-- This script creates the database and user

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE cpo_ocpi'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'cpo_ocpi')\gexec

-- Create user if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'cpo_user') THEN
        CREATE USER cpo_user WITH PASSWORD 'cpo_password';
    END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cpo_ocpi TO cpo_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO cpo_user;

