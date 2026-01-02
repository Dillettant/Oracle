-- Oracle Database Initialization Script
-- This script runs on first PostgreSQL container startup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TimescaleDB extension (already included in timescale/timescaledb image)
-- CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create schemas for better organization
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS trading;
CREATE SCHEMA IF NOT EXISTS market;

-- Grant permissions (adjust as needed for production)
GRANT ALL ON SCHEMA auth TO oracle;
GRANT ALL ON SCHEMA trading TO oracle;
GRANT ALL ON SCHEMA market TO oracle;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Oracle database initialized successfully';
END $$;
