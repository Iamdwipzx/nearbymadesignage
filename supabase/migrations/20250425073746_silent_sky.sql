/*
  # Add short preview URLs to playlists table

  1. Changes
    - Add short_preview_url column to playlists table
    - Add function to generate random 8-digit codes
    - Add trigger to automatically generate short preview URLs

  2. Security
    - Maintains existing RLS policies
    - Ensures unique preview URLs
*/

-- Add short_preview_url column
ALTER TABLE playlists
ADD COLUMN short_preview_url text UNIQUE;

-- Function to generate random 8-digit codes
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS text AS $$
DECLARE
  chars text[] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z}';
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure unique short codes
CREATE OR REPLACE FUNCTION generate_unique_short_code()
RETURNS text AS $$
DECLARE
  new_code text;
BEGIN
  LOOP
    new_code := generate_short_code();
    IF NOT EXISTS (SELECT 1 FROM playlists WHERE short_preview_url = new_code) THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically generate short preview URLs
CREATE OR REPLACE FUNCTION set_short_preview_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.preview_url IS NOT NULL AND NEW.short_preview_url IS NULL THEN
    NEW.short_preview_url := generate_unique_short_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_short_preview_url
  BEFORE INSERT OR UPDATE ON playlists
  FOR EACH ROW
  EXECUTE FUNCTION set_short_preview_url();