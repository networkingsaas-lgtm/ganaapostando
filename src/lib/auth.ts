import { getRequiredClientEnv, trimTrailingSlash } from './env';
import { getSupabaseClient } from './supabase';

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    emailConfirmedAt?: string | null;
  };
  linkage?: {
    authProvider?: string;
    trigger?: string;
    usersTableLinked?: boolean;
  };
}

const getBackendUrl = () => trimTrailingSlash(getRequiredClientEnv('VITE_BACKEND_URL'));

const getResponseErrorMessage = async (response: Response) => {
  try {
    const payload = await response.json();

    if (payload && typeof payload === 'object') {
      const message = 'message' in payload ? payload.message : null;
      const error = 'error' in payload ? payload.error : null;

      if (typeof message === 'string' && message.trim()) {
        return message;
      }

      if (typeof error === 'string' && error.trim()) {
        return error;
      }
    }
  } catch {
    return `Error ${response.status} al procesar la solicitud.`;
  }

  return `Error ${response.status} al procesar la solicitud.`;
};

export const loginWithSupabase = async (email: string, password: string) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const logoutFromSupabase = async () => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

export const registerWithBackend = async (
  payload: RegisterPayload,
): Promise<RegisterResponse> => {
  const response = await fetch(`${getBackendUrl()}/auth/register`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getResponseErrorMessage(response));
  }

  return response.json() as Promise<RegisterResponse>;
};
