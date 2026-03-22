import { Eye, EyeOff } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { loginWithSupabase, registerWithBackend } from '../lib/auth';
import { getSupabaseClient } from '../lib/supabase';

interface Props {
  onVolver: () => void;
  onRegistroExitoso: () => void;
}

interface RegisterFormState {
  username: string;
  email: string;
  password: string;
}

type SocialProvider = 'google' | 'facebook' | 'apple';

const INITIAL_FORM: RegisterFormState = {
  username: '',
  email: '',
  password: '',
};

const OAUTH_REDIRECT_PATH = '/dashboard/ajustes';

const OAUTH_PROVIDER_CONFIG: Record<
  SocialProvider,
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

const getFriendlyRegisterError = (error: unknown) => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'No se pudo completar el registro.';
};

const getFriendlyAutoLoginError = (error: unknown) => {
  if (!(error instanceof Error) || !error.message.trim()) {
    return 'Registro completado, pero no se pudo iniciar sesion automaticamente.';
  }

  const normalizedMessage = error.message.toLowerCase();

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Registro completado, pero no se pudo iniciar sesion automaticamente.';
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Registro completado. Confirma tu correo para iniciar sesion.';
  }

  return `Registro completado, pero no se pudo iniciar sesion automaticamente: ${error.message}`;
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M21.35 11.1H12v2.98h5.38c-.23 1.52-1.14 2.8-2.43 3.66v2.28h3.93c2.3-2.12 3.63-5.24 3.63-8.92 0-.76-.07-1.49-.16-2.2Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.93-2.28c-1.09.73-2.49 1.16-4.05 1.16-3.11 0-5.75-2.1-6.69-4.93H.88v2.35A9.99 9.99 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M3.94 13.51A6 6 0 0 1 3.56 12c0-.52.09-1.03.24-1.51V8.14H.88A9.99 9.99 0 0 0 0 12c0 1.61.39 3.14 1.08 4.49l2.86-2.98Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.56c1.47 0 2.79.5 3.83 1.48l2.87-2.87C16.95 2.55 14.69 1.56 12 1.56A9.99 9.99 0 0 0 .88 8.14l2.92 2.35C4.74 7.66 7.39 5.56 12 5.56Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.12 11.93v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.69 4.54-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07Z"
        fill="currentColor"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M16.37 12.3c.03 2.6 2.29 3.47 2.31 3.48-.02.06-.36 1.25-1.18 2.47-.71 1.05-1.45 2.1-2.61 2.12-1.14.02-1.51-.68-2.82-.68-1.31 0-1.72.66-2.8.7-1.12.04-1.98-1.12-2.7-2.16-1.47-2.12-2.59-6-1.08-8.63.75-1.31 2.1-2.14 3.56-2.16 1.11-.02 2.15.75 2.82.75.66 0 1.91-.93 3.21-.79.54.02 2.06.22 3.03 1.64-.08.05-1.81 1.05-1.74 3.26ZM14.82 4.66c.6-.73 1-1.74.89-2.75-.87.03-1.93.58-2.56 1.31-.56.65-1.06 1.68-.92 2.67.97.08 1.98-.49 2.59-1.23Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Registro({ onVolver, onRegistroExitoso }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialSubmitting, setSocialSubmitting] = useState<SocialProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const hasPendingRequest = isSubmitting || socialSubmitting !== null;

  const handleSocialLogin = async (provider: SocialProvider) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSocialSubmitting(provider);

    try {
      const supabase = getSupabaseClient();
      const providerConfig = OAUTH_PROVIDER_CONFIG[provider];
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${OAUTH_REDIRECT_PATH}`,
          scopes: providerConfig.scopes,
          queryParams: providerConfig.queryParams,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : `No se pudo continuar con ${OAUTH_PROVIDER_CONFIG[provider].label}.`;
      setErrorMessage(message);
    } finally {
      setSocialSubmitting(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const username = form.username.trim();
    const email = form.email.trim();
    const password = form.password;

    if (!username || !email || !password) {
      setErrorMessage('Completa usuario, correo y contrasena.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contrasena debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await registerWithBackend({ username, email, password });
      setSuccessMessage(response.message || 'Usuario registrado correctamente.');

      try {
        await loginWithSupabase(email, password);
        setForm(INITIAL_FORM);
        setShowPassword(false);
        onRegistroExitoso();
      } catch (loginError) {
        setErrorMessage(getFriendlyAutoLoginError(loginError));
      }
    } catch (error) {
      setErrorMessage(getFriendlyRegisterError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="relative min-h-screen bg-slate-950 bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/registro-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/20" aria-hidden="true" />

      <section className="relative z-10 min-h-screen">
        <div className="relative flex min-h-screen w-full px-6 py-6 backdrop-blur-sm sm:px-10 lg:w-1/2 lg:px-14">
          <div className="hero-startup-bg absolute inset-0 opacity-80" aria-hidden="true" />

          <div className="relative z-10 flex w-full max-w-xl flex-1 flex-col">
            <div className="flex items-center justify-between gap-4 pt-1">
              <button
                type="button"
                onClick={onVolver}
                className="inline-flex items-center text-sm font-medium text-white/80 transition hover:text-white"
              >
                Volver al inicio
              </button>
              <p className="text-lg font-semibold text-white">
                <span className="rebel-underline">El Metodo.</span>
              </p>
            </div>

            <div className="flex flex-1 flex-col pt-10 sm:pt-12">
              <h1 className="text-center text-4xl font-bold leading-tight sm:text-5xl">
                Crea tu cuenta.
              </h1>

              <div className="mx-auto mt-8 w-full max-w-md">
                <div className="relative min-h-[420px] lg:min-h-[440px]">
                  <div
                    className={`absolute inset-0 transition-all duration-300 ${
                      showRegisterForm ? 'pointer-events-none opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
                    }`}
                  >
                    <div className="space-y-4 lg:space-y-5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowRegisterForm(true);
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        disabled={hasPendingRequest}
                        className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-white/80"
                      >
                        Registrarse
                      </button>

                      <div className="flex items-center gap-3 py-1">
                        <div className="h-px flex-1 bg-white/15" />
                        <span className="text-xs uppercase tracking-[0.18em] text-white/50">o</span>
                        <div className="h-px flex-1 bg-white/15" />
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleSocialLogin('google')}
                        disabled={hasPendingRequest}
                        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <GoogleIcon />
                        {socialSubmitting === 'google' ? 'Conectando...' : 'Registrate con Google'}
                      </button>

                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-2xl border border-slate-500/40 bg-slate-600/40 px-4 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-600/55"
                      >
                        <FacebookIcon />
                        Registrate con Facebook
                      </button>

                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-2xl border border-slate-500/40 bg-slate-600/40 px-4 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-600/55"
                      >
                        <AppleIcon />
                        Registrate con Apple
                      </button>
                    </div>
                  </div>

                  <div
                    className={`absolute inset-0 transition-all duration-500 ease-out ${
                      showRegisterForm ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-4'
                    }`}
                  >
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            username: event.target.value,
                          }))
                        }
                        placeholder="Usuario"
                        className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-white outline-none placeholder:text-white/45 focus:border-white/35"
                        autoComplete="username"
                        disabled={hasPendingRequest}
                      />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        placeholder="Correo electronico"
                        className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-white outline-none placeholder:text-white/45 focus:border-white/35"
                        autoComplete="email"
                        disabled={hasPendingRequest}
                      />
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={form.password}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              password: event.target.value,
                            }))
                          }
                          placeholder="Contrasena"
                          className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3 pr-12 text-white outline-none placeholder:text-white/45 focus:border-white/35"
                          autoComplete="new-password"
                          disabled={hasPendingRequest}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          disabled={hasPendingRequest}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 transition hover:text-white disabled:cursor-not-allowed disabled:text-white/40"
                          aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>

                      {errorMessage && (
                        <p className="rounded-2xl border border-red-300/35 bg-red-500/12 px-4 py-3 text-sm text-red-100">
                          {errorMessage}
                        </p>
                      )}

                      {successMessage && (
                        <p className="rounded-2xl border border-emerald-300/35 bg-emerald-500/12 px-4 py-3 text-sm text-emerald-100">
                          {successMessage}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={hasPendingRequest}
                        className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-white/80"
                      >
                        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowRegisterForm(false);
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        disabled={hasPendingRequest}
                        className="block w-full text-center text-sm text-white/75 transition hover:text-white disabled:cursor-not-allowed disabled:text-white/50"
                      >
                        Volver a las opciones
                      </button>
                    </form>
                  </div>
                </div>

                {!showRegisterForm && errorMessage && (
                  <p className="mt-4 rounded-2xl border border-red-300/35 bg-red-500/12 px-4 py-3 text-sm text-red-100">
                    {errorMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
