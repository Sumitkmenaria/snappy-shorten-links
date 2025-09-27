/*
  # Add Row Level Security policies for links table

  1. Security
    - Enable RLS on `links` table
    - Add policy for public link creation (anyone can create)
    - Add policy for authenticated users to read their own links
    - Add policy for authenticated users to update their own links
    - Add policy for authenticated users to delete their own links
    - Add policy for public redirect access (anyone can read for redirects)

  2. Changes
    - Enable RLS on links table
    - Create policies for proper access control
*/

-- Enable RLS on links table
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can create links (both authenticated and anonymous users)
CREATE POLICY "Anyone can create links"
  ON links
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy 2: Anyone can read links for redirect purposes (needed for the redirect page)
CREATE POLICY "Anyone can read links for redirects"
  ON links
  FOR SELECT
  TO public
  USING (true);

-- Policy 3: Authenticated users can update only their own links
CREATE POLICY "Users can update own links"
  ON links
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Authenticated users can delete only their own links
CREATE POLICY "Users can delete own links"
  ON links
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);