/*
  # Initial Schema Setup for Digital Signage CMS

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Maps to auth.users
      - `name` (text) - User's display name
      - `role` (text) - User's role (admin/user)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `screens`
      - `id` (uuid, primary key)
      - `name` (text) - Screen name
      - `aspect_ratio` (text) - Screen aspect ratio (16:9 or 9:16)
      - `created_by` (uuid) - Reference to users.id
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `playlists`
      - `id` (uuid, primary key)
      - `name` (text) - Playlist name
      - `screen_id` (uuid) - Reference to screens.id
      - `created_by` (uuid) - Reference to users.id
      - `preview_url` (text) - Optional preview URL
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `playlist_contents`
      - `id` (uuid, primary key)
      - `playlist_id` (uuid) - Reference to playlists.id
      - `type` (text) - Content type (image, video, youtube, canva, html)
      - `content` (text) - Content URL or HTML
      - `position_x` (integer) - X position on canvas
      - `position_y` (integer) - Y position on canvas
      - `width` (integer) - Content width
      - `height` (integer) - Content height
      - `settings` (jsonb) - Content settings (autoplay, loop, etc.)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Screens table
CREATE TABLE IF NOT EXISTS screens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  aspect_ratio text NOT NULL CHECK (aspect_ratio IN ('16:9', '9:16')),
  created_by uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE screens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all screens"
  ON screens
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create screens"
  ON screens
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own screens"
  ON screens
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own screens"
  ON screens
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  screen_id uuid REFERENCES screens(id) NOT NULL,
  created_by uuid REFERENCES users(id) NOT NULL,
  preview_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all playlists"
  ON playlists
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create playlists"
  ON playlists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own playlists"
  ON playlists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own playlists"
  ON playlists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Playlist contents table
CREATE TABLE IF NOT EXISTS playlist_contents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id uuid REFERENCES playlists(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('image', 'video', 'youtube', 'canva', 'html')),
  content text NOT NULL,
  position_x integer NOT NULL,
  position_y integer NOT NULL,
  width integer NOT NULL,
  height integer NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE playlist_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all playlist contents"
  ON playlist_contents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage playlist contents"
  ON playlist_contents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_contents.playlist_id
      AND playlists.created_by = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_screens_updated_at
  BEFORE UPDATE ON screens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON playlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_playlist_contents_updated_at
  BEFORE UPDATE ON playlist_contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();