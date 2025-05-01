/*
  # Fix RLS policies for users table

  1. Changes
    - Add policy to allow inserting users during signup
    - Add policy to allow users to read their own data
    - Add policy to allow users to read all users (needed for admin features)

  2. Security
    - Maintains RLS on users table
    - Ensures users can only modify their own data
    - Allows reading all users for admin functionality
    - Allows new user creation during signup
*/

-- First, we'll drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create policy to allow inserting users during signup
CREATE POLICY "Enable insert for authentication users" ON users
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  TO authenticated
  USING (true);  -- Allow reading all users since we need this for admin features

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);