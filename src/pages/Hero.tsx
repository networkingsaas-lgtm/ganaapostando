import { Eye, EyeOff, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import PageReveal from '../components/shared/PageReveal';
import CasasCarrusel from '../components/hero/CasasCarrusel';
import HeaderTitle from '../components/ui/HeaderTitle';

interface Props {
  onVerResultados: () => void;
  onRegistrarse: () => void;
}

export default function Hero({ onVerResultados, onRegistrarse }: Props) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginClosing, setLoginClosing] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
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
    setLoginClosing(false);
    setLoginOpen(true);
  };

  const closeLoginModal = () => {
    setLoginClosing(true);
    closeTimeoutRef.current = window.setTimeout(() => {
      setLoginOpen(false);
      setLoginClosing(false);
      closeTimeoutRef.current = null;
    }, 200);
  };

  return (
    <>
      <section className="hero-startup-bg startup-font relative overflow-hidden text-white pb-12 sm:pb-16 section-padding">
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
          <div className="max-w-5xl mx-auto text-center space-y-8 sm:space-y-10">
            <PageReveal delay={100}>
              <HeaderTitle as="h1" className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[0.95]">
                CONVIERTE LAS <span className="text-white">APUESTAS</span> DEPORTIVAS EN <span className="title-span-highlight title-span-highlight-reverse-green">INGRESOS REALES</span>
              </HeaderTitle>
            </PageReveal>

            <PageReveal delay={180}>
              <p className="body-text text-white/90 max-w-3xl mx-auto">
                Aprende <span className="rebel-underline"> El Método.</span>
              </p>
            </PageReveal>

            <PageReveal delay={340}>
              <div className="inline-grid grid-cols-1 sm:flex sm:flex-row justify-center gap-4 pt-1">
                <button
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold bg-white text-blue-700 hover:bg-blue-50 border border-white/90 transform hover:scale-105 transition-all shadow-xl"
                >
                  Ver Cursos Disponibles
                </button>
                <button
                  onClick={onVerResultados}
                  className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold bg-white/20 hover:bg-white/30 text-white border-2 border-white/80 transform hover:scale-105 transition-all shadow-lg"
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

        <div className="absolute bottom-0 left-0 right-0 z-10 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
      </section>

      {loginOpen && (
        <div
          className={`${loginClosing ? 'modal-fade-out' : 'modal-fade-in'} fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/55 px-4 backdrop-blur-sm`}
          onClick={closeLoginModal}
        >
          <div
            className={`${loginClosing ? 'modal-pop-out' : 'modal-pop-in'} w-full max-w-md rounded-[28px] border border-slate-200 bg-white/90 p-6 text-slate-900 shadow-2xl backdrop-blur-md`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLoginModal}
              className="ml-auto flex text-slate-400 transition hover:text-slate-700"
              aria-label="Cerrar ventana de inicio de sesión"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="mt-2 text-2xl font-bold text-center">Iniciar sesión</h3>
            <p className="mt-2 text-sm text-slate-500 text-center">Accede con tu usuario y contraseña.</p>

            <form className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Usuario"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300"
              />
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="Contraseña"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  aria-label={showLoginPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Iniciar sesión
              </button>
            </form>

            <button
              type="button"
              className="mt-4 text-sm text-slate-500 transition hover:text-slate-700 text-center block w-full"
            >
              Has olvidado la contraseña?
            </button>
          </div>
        </div>
      )}
    </>
  );
}
