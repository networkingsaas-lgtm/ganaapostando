import { useEffect, useState } from 'react';
import { getCurrentUser } from '../../../api/services/sessionService';
import { getAuthenticatedUserLabel } from '../utils';

export const useAuthUserLabel = () => {
  const [authUserLabel, setAuthUserLabel] = useState('Cargando...');

  useEffect(() => {
    let isMounted = true;

    const loadUserLabel = async () => {
      try {
        const user = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        setAuthUserLabel(getAuthenticatedUserLabel(user));
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
