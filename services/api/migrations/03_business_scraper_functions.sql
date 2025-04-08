
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
