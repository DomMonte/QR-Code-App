import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbuunonfaihoguqqufzi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idXVub25mYWlob2d1cXF1ZnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1MDQ3NDgsImV4cCI6MjA0NzA4MDc0OH0.M_GnHputaz86weIMBry_shK-_KhKTUS5uo-O52KDyzY';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

export const getPublicUrl = (path: string) => {
  const { data } = supabase.storage.from('photos').getPublicUrl(path);
  return data.publicUrl;
};

export type UserRole = 'global_admin' | 'standard_admin' | 'guest';

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return {
      ...user,
      role: profile?.role as UserRole
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

// Function to invite a new user
export const inviteUser = async (email: string, role: string) => {
  try {
    // Store the current session
    const { data: { session: currentSession } } = await supabase.auth.getSession();

    // Create admin client for user creation
    const adminClient = supabase.auth.admin;
    if (!adminClient) {
      throw new Error('Admin client not available');
    }

    // Generate a temporary password
    const tempPassword = 'temp' + Math.random().toString(36).slice(-8);

    // Create the user
    const { data, error: createError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: { role }
      }
    });

    if (createError) throw createError;

    // Send password reset email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`
      }
    );

    if (resetError) throw resetError;

    // If there was a previous session, restore it
    if (currentSession) {
      await supabase.auth.setSession({
        access_token: currentSession.access_token,
        refresh_token: currentSession.refresh_token,
      });
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Function to delete a user
export const deleteUser = async (userId: string) => {
  try {
    const { error } = await supabase.rpc('delete_user', {
      user_id: userId
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Function to update user role
export const updateUserRole = async (userId: string, role: UserRole) => {
  try {
    const { error } = await supabase.rpc('update_user_role', {
      user_id: userId,
      new_role: role
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};