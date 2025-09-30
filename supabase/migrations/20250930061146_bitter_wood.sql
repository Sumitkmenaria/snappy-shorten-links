/*
  # Create notes table for note sharing functionality

  1. New Tables
    - `notes`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - the short URL identifier
      - `content` (text) - the note content
      - `title` (text, optional) - note title
      - `click_count` (integer, default 0) - view count
      - `user_id` (uuid, nullable) - creator (null for anonymous)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `notes` table
    - Add policies for public creation and reading
    - Add policies for authenticated users to manage their own notes
*/

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  title text,
  click_count integer DEFAULT 0,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create notes (anonymous and authenticated)
CREATE POLICY "Allow note creation for all users"
  ON notes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to read notes (needed for note viewing)
CREATE POLICY "Allow note reading"
  ON notes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to update their own notes
CREATE POLICY "Users can update their own notes"
  ON notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own notes
CREATE POLICY "Users can delete their own notes"
  ON notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_notes_updated_at'
  ) THEN
    CREATE TRIGGER update_notes_updated_at
      BEFORE UPDATE ON notes
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;