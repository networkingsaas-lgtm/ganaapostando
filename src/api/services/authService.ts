import { getFriendlyRequestErrorMessage, postJson } from '../core/backendClient';
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
  session?: {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    expires_in?: number;
    token_type?: string;
  } | null;
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

const normalizeErrorMessage = (error: unknown, fallbackMessage: string) =>
  getFriendlyRequestErrorMessage(error, fallbackMessage);

export const getRegisterErrorMessage = (error: unknown) =>
  getFriendlyRequestErrorMessage(error, 'No se pudo completar el registro.');

export const getLoginErrorMessage = (error: unknown) => {
  const fallbackMessage = 'No se pudo iniciar sesión.';

  if (!(error instanceof Error) || !error.message.trim()) {
    return fallbackMessage;
  }

  const normalizedMessage = error.message.toLowerCase();

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.';
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Confirma tu correo antes de iniciar sesión.';
  }

  return getFriendlyRequestErrorMessage(error, fallbackMessage);
};

export const getAutoLoginErrorMessage = (error: unknown) => {
  const fallbackMessage = 'Registro completado, pero no se pudo iniciar sesión automáticamente.';

  if (!(error instanceof Error) || !error.message.trim()) {
    return fallbackMessage;
  }

  const normalizedMessage = error.message.toLowerCase();

  if (normalizedMessage.includes('invalid login credentials')) {
    return fallbackMessage;
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Registro completado. Confirma tu correo para iniciar sesión.';
  }

  return `Registro completado, pero no se pudo iniciar sesión automáticamente: ${getFriendlyRequestErrorMessage(error, fallbackMessage)}`;
};

export const registerRequiresEmailConfirmation = (response: RegisterResponse) =>
  response.session === null
  || (!response.session && response.user.emailConfirmedAt == null);

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
