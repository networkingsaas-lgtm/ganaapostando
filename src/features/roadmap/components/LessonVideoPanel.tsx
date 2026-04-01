import { CircleAlert, LoaderCircle, Lock, RefreshCw } from 'lucide-react';
import type { LessonVideoPlaybackResult } from '../hooks/useLessonVideoPlayback';

interface Props {
  lessonTitle: string;
  playbackState: LessonVideoPlaybackResult;
  accessReason?: string | null;
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const formatDateTime = (value: string | null) => {
  if (!value) {
    return 'No disponible';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'No disponible';
  }

  return DATE_TIME_FORMATTER.format(parsedDate);
};

export default function LessonVideoPanel({ lessonTitle, playbackState, accessReason }: Props) {
  const playbackUrl = playbackState.video?.playbackUrl ?? null;
  const hasPlayableVideo = Boolean(playbackUrl);
  const resolvedReason = playbackState.reason ?? accessReason ?? null;
  const hasAccess =
    resolvedReason === 'entitled'
    || resolvedReason === 'preview'
    || resolvedReason === null;
  const showLoadingSkeleton = playbackState.isLoading && !hasPlayableVideo;
  const showRefreshingOverlay = playbackState.isLoading && hasPlayableVideo;

  return (
    <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-slate-200 bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.26)]">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          
          <p className="mt-1 truncate text-lg font-black text-white">{lessonTitle}</p>
        </div>

        {hasAccess && (
          <button
            type="button"
            onClick={playbackState.retry}
            className="inline-flex items-center gap-2 rounded-xl border border-white/14 bg-white/8 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/14"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        )}
      </div>

      {showLoadingSkeleton && (
        <div className="flex min-h-[280px] items-center justify-center bg-[linear-gradient(180deg,#0b1220_0%,#050816_100%)] px-4 text-center">
          <div className="flex flex-col items-center gap-3">
            <LoaderCircle className="h-10 w-10 animate-spin text-cyan-200" />
            <p className="text-sm font-medium text-slate-300">Preparando el enlace de reproduccion...</p>
          </div>
        </div>
      )}

      {!playbackState.isLoading && playbackState.errorMessage && !hasPlayableVideo && !hasAccess && (
        <div className="flex min-h-[280px] items-center justify-center bg-[linear-gradient(180deg,#0b1220_0%,#050816_100%)] px-4 text-center">
          <div className="max-w-[28rem]">
            <Lock className="mx-auto h-16 w-16 text-slate-200" />
            <p className="mt-4 text-xl font-bold text-white">No tienes acceso</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Compra esta capa para ver el video.
            </p>
          </div>
        </div>
      )}

      {!playbackState.isLoading && playbackState.errorMessage && !hasPlayableVideo && hasAccess && (
        <div className="flex min-h-[280px] items-center justify-center bg-[linear-gradient(180deg,#0b1220_0%,#050816_100%)] px-4 text-center">
          <div className="max-w-[26rem]">
            <CircleAlert className="mx-auto h-10 w-10 text-rose-300" />
            <p className="mt-4 text-lg font-bold text-white">
              No se ha podido cargar el video.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Vuelve a cargar el video porque el token se ha caducado.
            </p>
          </div>
        </div>
      )}

      {!playbackState.isLoading && !playbackState.errorMessage && !hasAccess && !hasPlayableVideo && (
        <div className="flex min-h-[280px] items-center justify-center bg-[linear-gradient(180deg,#0b1220_0%,#050816_100%)] px-4 text-center">
          <div className="max-w-[28rem]">
            <Lock className="mx-auto h-16 w-16 text-slate-200" />
            <p className="mt-4 text-xl font-bold text-white">No tienes acceso</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Esta leccion esta bloqueada para tu cuenta en este momento.
            </p>
          </div>
        </div>
      )}

      {hasPlayableVideo && (
        <div className="relative bg-black">
          {showRefreshingOverlay && (
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 bg-black/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
              <span>Actualizando enlace firmado</span>
              <LoaderCircle className="h-4 w-4 animate-spin" />
            </div>
          )}

          <iframe
            key={playbackUrl}
            src={playbackUrl ?? undefined}
            title={`Video de ${lessonTitle}`}
            className="block aspect-video w-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />

          <div className="flex flex-wrap items-center gap-3 border-t border-white/10 px-4 py-3 text-xs text-slate-300 sm:px-5">
            <span>Caduca: {formatDateTime(playbackState.video?.expiresAt ?? null)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
