import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseApiClient } from '../core/supabaseClient';

export const getCurrentSession = async (): Promise<Session | null> => {
  const supabase = getSupabaseApiClient();
  const { data } = await supabase.auth.getSession();

  return data.session ?? null;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const supabase = getSupabaseApiClient();
  const { data } = await supabase.auth.getUser();

  return data.user ?? null;
};

export const watchAuthSession = (
  onSessionChange: (session: Session | null) => void,
) => {
  const supabase = getSupabaseApiClient();
  let isActive = true;

  void supabase.auth.getSession().then(({ data }) => {
    if (!isActive) {
      return;
    }

    onSessionChange(data.session ?? null);
  });

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!isActive) {
      return;
    }

    onSessionChange(session);
  });

  return () => {
    isActive = false;
    data.subscription.unsubscribe();
  };
};

export const signOutFromSession = async () => {
  const supabase = getSupabaseApiClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};
