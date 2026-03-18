import type { User } from '@supabase/supabase-js';

export const getAuthenticatedUserLabel = (user: User | null) => {
  if (!user) {
    return 'Sin usuario';
  }

  const metadata = user.user_metadata ?? {};
  const username = typeof metadata.username === 'string' ? metadata.username.trim() : '';
  const fullName = typeof metadata.full_name === 'string' ? metadata.full_name.trim() : '';
  const name = username || fullName;

  if (name) {
    return name;
  }

  const email = user.email?.trim() ?? '';

  if (!email) {
    return 'Usuario autenticado';
  }

  return email.includes('@') ? email.split('@')[0] : email;
};
