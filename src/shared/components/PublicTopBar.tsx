import { Eye, EyeOff, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getLoginErrorMessage,
  loginWithEmailPassword,
  signInWithOAuth,
} from '../../api/services/authService';
import AppModal from './AppModal';

interface Props {
  onLoginSuccess: () => void;
  onRegistrarse: () => void;
}

const LOGIN_CLOSE_MS = 200;
const OAUTH_REDIRECT_PATH = '/dashboard/grupo-apuestas';

export default function PublicTopBar({
  onLoginSuccess,
  onRegistrarse,
}: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginClosing, setLoginClosing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen]);

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
      setLoginError('Introduce tu correo y tu contrasena.');
      return;
    }

    setLoginSubmitting(true);

    try {
      await loginWithEmailPassword(loginEmail, loginPassword);

      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      setLoginOpen(false);
      setLoginClosing(false);
      setShowLoginPassword(false);
      onLoginSuccess();
    } catch (error) {
      setLoginError(getLoginErrorMessage(error));
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError(null);
    setGoogleSubmitting(true);

    try {
      await signInWithOAuth('google', {
        redirectTo: `${window.location.origin}${OAUTH_REDIRECT_PATH}`,
      });
    } catch (error) {
      setLoginError(getLoginErrorMessage(error));
      setGoogleSubmitting(false);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleMobileNavigate = (path: string) => {
    navigate(path);
    closeMobileMenu();
  };

  const isSidebarRouteActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    return location.pathname === path;
  };

  const getSidebarButtonClassName = (path: string) => {
    const baseClassName = 'w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition';

    if (isSidebarRouteActive(path)) {
      return `${baseClassName} border-blue-300 bg-blue-50 text-blue-700 shadow-sm`;
    }

    return `${baseClassName} border-slate-200 text-slate-800 hover:bg-slate-50`;
  };

  return (
    <>
      <div className="fixed left-1/2 top-0 z-30 w-screen -translate-x-1/2 border-b border-white/20 bg-[#081a63]/55 backdrop-blur-md">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex items-center gap-1.5 px-2 py-2 sm:hidden">
            <button
              type="button"
              onClick={openLoginModal}
              className="flex-1 rounded-full px-3 py-2 text-xs font-semibold text-white transition-all"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={onRegistrarse}
              className="flex-1 rounded-full border border-white/90 bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50"
            >
              Registrarse
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? 'Cerrar menu de navegacion' : 'Abrir menu de navegacion'}
              aria-expanded={mobileMenuOpen}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white transition hover:bg-white/20"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="hidden items-center justify-end gap-2 px-2 py-3 sm:flex sm:gap-3 sm:px-6 sm:py-3 lg:px-8">
            <button
              type="button"
              onClick={openLoginModal}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={onRegistrarse}
              className="rounded-full border border-white/90 bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50"
            >
              Registrarse
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? 'Cerrar menu de navegacion' : 'Abrir menu de navegacion'}
              aria-expanded={mobileMenuOpen}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white transition hover:bg-white/20"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <button
          type="button"
          onClick={closeMobileMenu}
          className="absolute inset-0 bg-slate-950/55"
          aria-label="Cerrar menu lateral"
        />

        <aside
          className={`absolute right-0 top-0 flex h-full w-[min(84vw,22rem)] flex-col border-l border-slate-200 bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.35)] transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu lateral"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Menu</p>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100"
              aria-label="Cerrar menu lateral"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-6 space-y-2">
            <button
              type="button"
              onClick={() => handleMobileNavigate('/')}
              className={getSidebarButtonClassName('/')}
              aria-current={isSidebarRouteActive('/') ? 'page' : undefined}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleMobileNavigate('/grupoapuestas')}
              className={getSidebarButtonClassName('/grupoapuestas')}
              aria-current={isSidebarRouteActive('/grupoapuestas') ? 'page' : undefined}
            >
              Grupo Apuestas
            </button>
            <button
              type="button"
              onClick={() => handleMobileNavigate('/resultados')}
              className={getSidebarButtonClassName('/resultados')}
              aria-current={isSidebarRouteActive('/resultados') ? 'page' : undefined}
            >
              Ver resultados
            </button>
            <button
              type="button"
              onClick={() => handleMobileNavigate('/terminos-del-servicio')}
              className={getSidebarButtonClassName('/terminos-del-servicio')}
              aria-current={isSidebarRouteActive('/terminos-del-servicio') ? 'page' : undefined}
            >
              Terminos y condiciones
            </button>
          </nav>

          <div className="mt-auto space-y-2 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                openLoginModal();
              }}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Iniciar sesion
            </button>
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                onRegistrarse();
              }}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Registrarse
            </button>
          </div>
        </aside>
      </div>

      <AppModal
        open={loginOpen}
        isClosing={loginClosing}
        onRequestClose={closeLoginModal}
        disableClose={hasPendingLogin}
        maxWidthClassName="max-w-[34rem] lg:max-w-[31rem]"
        panelClassName="bg-white/95 backdrop-blur-md p-7 sm:p-8"
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
            placeholder="Correo electronico"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300"
            autoComplete="email"
            disabled={hasPendingLogin}
          />
          <div className="relative">
            <input
              type={showLoginPassword ? 'text' : 'password'}
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              placeholder="Contrasena"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300"
              autoComplete="current-password"
              disabled={hasPendingLogin}
            />
            <button
              type="button"
              onClick={() => setShowLoginPassword((value) => !value)}
              disabled={hasPendingLogin}
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
