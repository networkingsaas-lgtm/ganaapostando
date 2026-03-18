import { useEffect, useState } from 'react';
import { getSupabaseClient } from '../../../lib/supabase';
import { getAuthenticatedUserLabel } from '../utils';

export const useAuthUserLabel = () => {
  const [authUserLabel, setAuthUserLabel] = useState('Cargando...');

  useEffect(() => {
    let isMounted = true;

    const loadUserLabel = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.getUser();

        if (!isMounted || error) {
          return;
        }

        setAuthUserLabel(getAuthenticatedUserLabel(data.user ?? null));
      } catch {
        if (isMounted) {
          setAuthUserLabel('Usuario autenticado');
        }
      }
    };

    void loadUserLabel();

    return () => {
      isMounted = false;
    };
  }, []);

  return authUserLabel;
};
