import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface Props {
  onVolver: () => void;
}

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
        fill="#1877F2"
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

export default function Registro({ onVolver }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  return (
    <main
      className="relative min-h-screen bg-slate-950 bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/registro-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/20" aria-hidden="true" />

      <section className="relative z-10 min-h-screen">
        <div className="relative flex min-h-screen w-full lg:w-1/2 px-6 py-6 backdrop-blur-sm sm:px-10 lg:px-14">
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
                <span className="rebel-underline">El Método.</span>
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
                        onClick={() => setShowRegisterForm(true)}
                        className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
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
                        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                      >
                        <GoogleIcon />
                        Inicia sesión con Google
                      </button>

                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                      >
                        <FacebookIcon />
                        Inicia sesión con Facebook
                      </button>

                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                      >
                        <AppleIcon />
                        Inicia sesión con Apple
                      </button>
                    </div>
                  </div>

                  <div
                    className={`absolute inset-0 transition-all duration-500 ease-out ${
                      showRegisterForm ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-4'
                    }`}
                  >
                    <form className="space-y-4">
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-white outline-none placeholder:text-white/45 focus:border-white/35"
                      />
                      <input
                        type="email"
                        placeholder="Correo electrónico"
                        className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-white outline-none placeholder:text-white/45 focus:border-white/35"
                      />
                      <input
                        type="text"
                        placeholder="Usuario"
                        className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-white outline-none placeholder:text-white/45 focus:border-white/35"
                      />
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Contraseña"
                          className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3 pr-12 text-white outline-none placeholder:text-white/45 focus:border-white/35"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 transition hover:text-white"
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showRepeatPassword ? 'text' : 'password'}
                          placeholder="Repite la contraseña"
                          className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3 pr-12 text-white outline-none placeholder:text-white/45 focus:border-white/35"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRepeatPassword((value) => !value)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 transition hover:text-white"
                          aria-label={showRepeatPassword ? 'Ocultar contraseña repetida' : 'Mostrar contraseña repetida'}
                        >
                          {showRepeatPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                      >
                        Crear cuenta
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowRegisterForm(false)}
                        className="block w-full text-center text-sm text-white/75 transition hover:text-white"
                      >
                        Volver a las opciones
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
