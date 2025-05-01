import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Auth functions
export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      // If we get a session error, clear the session locally
      if (error.message.includes('session')) {
        await supabase.auth.clearSession();
      }
      throw error;
    }
  } catch (error) {
    console.error('Error signing out:', error);
    // Always clear the session locally on error
    await supabase.auth.clearSession();
    throw error;
  }
};

// For demo purposes, we'll create a demo account if it doesn't exist
export const demoSignIn = async () => {
  const email = 'admin@example.com';
  const password = 'password123';
  
  // Check if demo user exists
  const { data: { user } } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (!user) {
    // Create demo user
    const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: 'Demo Admin',
          role: 'admin',
        },
      },
    });

    if (signUpError) throw signUpError;

    // Insert user profile
    if (newUser) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: newUser.id,
          name: 'Demo Admin',
          role: 'admin',
        });

      if (profileError) throw profileError;
    }

    // Sign in with new account
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  return { data: { user }, error: null };
};