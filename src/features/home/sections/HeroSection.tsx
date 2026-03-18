import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { loginWithSupabase } from '../../../lib/auth';
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

const getFriendlyLoginError = (error: unknown) => {
  if (!(error instanceof Error) || !error.message.trim()) {
    return 'No se pudo iniciar sesion.';
  }

  const normalizedMessage = error.message.toLowerCase();

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Correo o contrasena incorrectos.';
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Confirma tu correo antes de iniciar sesion.';
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
  const closeTimeoutRef = useRef<number | null>(null);

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
    if (loginSubmitting) {
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
      setLoginError('Introduce tu correo y tu contrasena.');
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

  return (
    <>
      <section className="hero-startup-bg startup-font relative overflow-hidden pb-12 text-white sm:pb-16 section-padding">
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
              Iniciar sesion
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
                CONVIERTE LAS <span className="text-white">APUESTAS</span> DEPORTIVAS EN <span className="title-span-highlight title-span-highlight-reverse-green">INGRESOS REALES</span>
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
        disableClose={loginSubmitting}
        closeAriaLabel="Cerrar ventana de inicio de sesion"
      >
        <h3 className="mt-2 text-center text-2xl font-bold">Iniciar sesion</h3>
        <p className="mt-2 text-center text-sm text-slate-500">Accede con tu correo y contrasena.</p>

        <form className="mt-6 space-y-4" onSubmit={handleLoginSubmit}>
          <input
            type="email"
            value={loginEmail}
            onChange={(event) => setLoginEmail(event.target.value)}
            placeholder="Correo electronico"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300"
            autoComplete="email"
            disabled={loginSubmitting}
          />
          <div className="relative">
            <input
              type={showLoginPassword ? 'text' : 'password'}
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              placeholder="Contrasena"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300"
              autoComplete="current-password"
              disabled={loginSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowLoginPassword((value) => !value)}
              disabled={loginSubmitting}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
              aria-label={showLoginPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
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
            disabled={loginSubmitting}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loginSubmitting ? 'Entrando...' : 'Iniciar sesion'}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 block w-full text-center text-sm text-slate-500 transition hover:text-slate-700"
        >
          Has olvidado la contrasena?
        </button>
      </AppModal>
    </>
  );
}
