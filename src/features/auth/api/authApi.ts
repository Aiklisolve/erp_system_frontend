import { supabase } from '../../../lib/supabaseClient';
import { handleApiError } from '../../../lib/errorHandler';

export async function login(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data.user;
  } catch (error) {
    handleApiError('auth.login', error);
    throw error;
  }
}

export async function register(email: string, password: string, fullName: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) throw error;
    return data.user;
  } catch (error) {
    handleApiError('auth.register', error);
    throw error;
  }
}

export async function logout() {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    handleApiError('auth.logout', error);
  }
}

export async function getCurrentUser() {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  } catch (error) {
    handleApiError('auth.getCurrentUser', error);
    return null;
  }
}


