
-- Function to increment a counter in a table
CREATE OR REPLACE FUNCTION increment_counter(row_id UUID, count INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_value INTEGER;
  new_value INTEGER;
BEGIN
  -- Get the current value
  SELECT businessesFound INTO current_value FROM scraper_runs WHERE id = row_id;
  
  -- Calculate the new value
  IF current_value IS NULL THEN
    new_value := count;
  ELSE
    new_value := current_value + count;
  END IF;
  
  -- Return the new value
  RETURN new_value;
END;
$$;

-- Create the scraper_runs table if it doesn't exist
CREATE TABLE IF NOT EXISTS scraper_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(50) NOT NULL, -- 'running', 'completed', 'failed'
  location VARCHAR(255) NOT NULL,
  businessesFound INTEGER DEFAULT 0,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure the businesses table has the necessary columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'source_id'
  ) THEN
    ALTER TABLE businesses ADD COLUMN source_id VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'external_id'
  ) THEN
    ALTER TABLE businesses ADD COLUMN external_id VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'phone'
  ) THEN
    ALTER TABLE businesses ADD COLUMN phone VARCHAR(255);
  END IF;
END $$;

-- Add unique constraint to avoid duplicate businesses from same source
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'businesses_source_external_id_key'
  ) THEN
    ALTER TABLE businesses ADD CONSTRAINT businesses_source_external_id_key 
      UNIQUE (source_id, external_id);
  END IF;
EXCEPTION
  WHEN duplicate_table THEN
    -- Do nothing, the constraint already exists
  WHEN others THEN
    RAISE;
END $$;
