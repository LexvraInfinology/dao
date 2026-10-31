-- Initialization script for PostgreSQL container
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'neondb_owner') THEN
        CREATE ROLE neondb_owner WITH LOGIN SUPERUSER PASSWORD 'npg_1fOkpFHAZx2e';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN
        CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';
    END IF;
END $$;

SELECT 'CREATE DATABASE neondb OWNER neondb_owner'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'neondb')\gexec

SELECT 'CREATE DATABASE equora_db OWNER neondb_owner'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'equora_db')\gexec

GRANT ALL PRIVILEGES ON DATABASE neondb TO neondb_owner;
GRANT ALL PRIVILEGES ON DATABASE equora_db TO neondb_owner;
ALTER ROLE neondb_owner WITH SUPERUSER CREATEDB CREATEROLE REPLICATION;
