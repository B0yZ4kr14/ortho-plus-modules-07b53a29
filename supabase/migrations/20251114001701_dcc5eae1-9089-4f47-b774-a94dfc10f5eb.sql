-- Fix security warnings: Add search_path to SECURITY DEFINER functions
-- FIXED: Exclude extensions that don't support SET SCHEMA

-- Fix all functions that are missing search_path
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT 
      n.nspname as schema_name,
      p.proname as function_name
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.prosecdef = true  -- SECURITY DEFINER
      AND pg_get_functiondef(p.oid) NOT ILIKE '%search_path%'
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I SET search_path = ''''',
      func_record.schema_name,
      func_record.function_name
    );
    
    RAISE NOTICE 'Fixed search_path for function: %.%', func_record.schema_name, func_record.function_name;
  END LOOP;
END $$;

-- Move extensions from public schema to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move only extensions that support SET SCHEMA
-- EXCLUDE: pg_net, pgsodium, supabase_vault (don't support SET SCHEMA)
DO $$
DECLARE
  ext_name TEXT;
  excluded_extensions TEXT[] := ARRAY['plpgsql', 'pg_net', 'pgsodium', 'supabase_vault', 'vault'];
BEGIN
  FOR ext_name IN
    SELECT extname FROM pg_extension 
    WHERE extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND extname != ALL(excluded_extensions)
  LOOP
    BEGIN
      EXECUTE format('ALTER EXTENSION %I SET SCHEMA extensions', ext_name);
      RAISE NOTICE 'Moved extension % to extensions schema', ext_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped extension % (does not support SET SCHEMA)', ext_name;
    END;
  END LOOP;
END $$;