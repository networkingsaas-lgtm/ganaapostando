import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { loginWithSupabase } from '../../../lib/auth';
import { getSupabaseClient } from '../../../lib/supabase';
import AppModal from '../../../shared/components/AppModal';
import HeaderTitle from '../../../shared/components/HeaderTitle';
import PageReveal from '../../../shared/components/PageReveal';
import CasasCarrusel from '../components/CasasCarrusel';

interface Props {
  onLoginSuccess: () => void;
  onVerResultados: () => void;
  onRegistrarse: () => void;
}

const LOGIN_CLOSE_MS = 200;
const OAUTH_REDIRECT_PATH = '/dashboard/ajustes';

const getFriendlyLoginError = (error: unknown) => {
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

export default function HeroSection({ onLoginSuccess, onVerResultados, onRegistrarse }: Props) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginClosing, setLoginClosing] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const hasPendingLogin = loginSubmitting || googleSubmitting;

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const openLoginModal = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setLoginEmail('');
    setLoginPassword('');
    setLoginError(null);
    setShowLoginPassword(false);
    setLoginClosing(false);
    setLoginOpen(true);
  };

  const closeLoginModal = () => {
    if (hasPendingLogin) {
      return;
    }

    setLoginClosing(true);
    closeTimeoutRef.current = window.setTimeout(() => {
      setLoginOpen(false);
      setLoginClosing(false);
      setLoginError(null);
      closeTimeoutRef.current = null;
    }, LOGIN_CLOSE_MS);
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Introduce tu correo y tu contraseña.');
      return;
    }

    setLoginSubmitting(true);

    try {
      await loginWithSupabase(loginEmail, loginPassword);

      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      setLoginOpen(false);
      setLoginClosing(false);
      setShowLoginPassword(false);
      onLoginSuccess();
    } catch (error) {
      setLoginError(getFriendlyLoginError(error));
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError(null);
    setGoogleSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${OAUTH_REDIRECT_PATH}`,
          scopes: 'email profile',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setLoginError(getFriendlyLoginError(error));
      setGoogleSubmitting(false);
    }
  };

  return (
    <>
      <section className="heroSection hero-startup-bg startup-font relative overflow-hidden pb-12 text-white sm:pb-16 section-padding">
        <div
          className="pointer-events-none absolute inset-0 bg-center bg-cover opacity-[0.20]"
          style={{
            backgroundImage: "url('/estudiante-bg-optimized.jpg')",
            transform: 'scaleX(-1)',
          }}
          aria-hidden="true"
        />

        <div className="fixed left-1/2 top-0 z-30 w-screen -translate-x-1/2 border-b border-white/20 bg-[#081a63]/55 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-end gap-2 px-2 py-3 sm:gap-3 sm:px-6 sm:py-3 lg:px-8">
            <button
              type="button"
              onClick={openLoginModal}
              className="flex-1 rounded-full px-4 py-2.5 text-xs font-semibold text-white transition-all sm:flex-none sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={onRegistrarse}
              className="flex-1 rounded-full border border-white/90 bg-white px-4 py-2.5 text-xs font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50 sm:flex-none sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Registrarse
            </button>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl pt-24 sm:pt-32">
          <div className="mx-auto max-w-5xl space-y-8 text-center sm:space-y-10">
            <PageReveal delay={100}>
              <HeaderTitle as="h1" className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[0.95]">
                CONVIERTE LAS <span className="text-white">APUESTAS</span> DEPORTIVAS EN <span className="title-span-highlight title-span-highlight-reverse">INGRESOS REALES</span>
              </HeaderTitle>
            </PageReveal>

            <PageReveal delay={180}>
              <p className="body-text mx-auto max-w-3xl text-white/90">
                Aprende <span className="rebel-underline"> El Metodo.</span>
              </p>
            </PageReveal>

            <PageReveal delay={340}>
              <div className="inline-grid grid-cols-1 justify-center gap-4 pt-1 sm:flex sm:flex-row">
                <button
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="rounded-full border border-white/90 bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-xl transition-all transform hover:scale-105 hover:bg-blue-50 sm:px-7 sm:py-3.5 sm:text-base"
                >
                  Ver Cursos Disponibles
                </button>
                <button
                  onClick={onVerResultados}
                  className="rounded-full border-2 border-white/80 bg-white/20 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all transform hover:scale-105 hover:bg-white/30 sm:px-7 sm:py-3.5 sm:text-base"
                >
                  Ver Todos Los Casos Reales
                </button>
              </div>
            </PageReveal>
          </div>

          <PageReveal delay={420}>
            <CasasCarrusel />
          </PageReveal>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      </section>

      <AppModal
        open={loginOpen}
        isClosing={loginClosing}
        onRequestClose={closeLoginModal}
        disableClose={hasPendingLogin}
        closeAriaLabel="Cerrar ventana de inicio de sesión"
      >
        <h3 className="mt-2 text-center text-2xl font-bold">Iniciar sesión</h3>
        <p className="mt-2 text-center text-sm text-slate-500">Accede con tu correo y contraseña.</p>

        <button
          type="button"
          onClick={() => void handleGoogleLogin()}
          disabled={hasPendingLogin}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
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
          {googleSubmitting ? 'Conectando...' : 'Iniciar sesión con Google'}
        </button>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs uppercase tracking-[0.18em] text-slate-400">o</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleLoginSubmit}>
          <input
            type="email"
            value={loginEmail}
            onChange={(event) => setLoginEmail(event.target.value)}
            placeholder="Correo electrónico"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300"
            autoComplete="email"
            disabled={hasPendingLogin}
          />
          <div className="relative">
            <input
              type={showLoginPassword ? 'text' : 'password'}
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              placeholder="Contraseña"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300"
              autoComplete="current-password"
              disabled={hasPendingLogin}
            />
            <button
              type="button"
              onClick={() => setShowLoginPassword((value) => !value)}
              disabled={hasPendingLogin}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
              aria-label={showLoginPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {loginError && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={hasPendingLogin}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loginSubmitting ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 block w-full text-center text-sm text-slate-500 transition hover:text-slate-700"
        >
          Has olvidado la contraseña?
        </button>
      </AppModal>
    </>
  );
}
