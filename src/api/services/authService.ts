import { postJson } from '../core/backendClient';
import { getSupabaseApiClient } from '../core/supabaseClient';

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

export type AuthProvider = 'google' | 'facebook' | 'apple';

interface OAuthOptions {
  redirectTo: string;
}

const OAUTH_PROVIDER_CONFIG: Record<
  AuthProvider,
  { label: string; scopes: string; queryParams?: Record<string, string> }
> = {
  google: {
    label: 'Google',
    scopes: 'email profile',
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
  facebook: {
    label: 'Facebook',
    scopes: 'email public_profile',
  },
  apple: {
    label: 'Apple',
    scopes: 'name email',
  },
};

const normalizeErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};

export const getRegisterErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'No se pudo completar el registro.';
};

export const getLoginErrorMessage = (error: unknown) => {
  if (!(error instanceof Error) || !error.message.trim()) {
    return 'No se pudo iniciar sesión.';
  }

  const normalizedMessage = error.message.toLowerCase();

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.';
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Confirma tu correo antes de iniciar sesión.';
  }

  return error.message;
};

export const getAutoLoginErrorMessage = (error: unknown) => {
  if (!(error instanceof Error) || !error.message.trim()) {
    return 'Registro completado, pero no se pudo iniciar sesión automáticamente.';
  }

  const normalizedMessage = error.message.toLowerCase();

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Registro completado, pero no se pudo iniciar sesión automáticamente.';
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Registro completado. Confirma tu correo para iniciar sesión.';
  }

  return `Registro completado, pero no se pudo iniciar sesión automáticamente: ${error.message}`;
};

export const loginWithEmailPassword = async (email: string, password: string) => {
  const supabase = getSupabaseApiClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> =>
  postJson<RegisterResponse, RegisterPayload>('/auth/register', payload);

export const signInWithOAuth = async (provider: AuthProvider, options: OAuthOptions) => {
  const supabase = getSupabaseApiClient();
  const providerConfig = OAUTH_PROVIDER_CONFIG[provider];
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: options.redirectTo,
      scopes: providerConfig.scopes,
      queryParams: providerConfig.queryParams,
    },
  });

  if (error) {
    throw new Error(
      normalizeErrorMessage(error, `No se pudo continuar con ${providerConfig.label}.`),
    );
  }
};
