import { useCallback, useEffect, useRef, useState } from 'react';
import { getFriendlyRequestErrorMessage } from '../../../api/core/backendClient';
import { fetchLessonVideoAccess } from '../services/lessonVideoService';
import type { LessonVideoAccess, LessonVideoAccessResponse } from '../types';

export interface LessonVideoPlaybackState {
  lessonId: number | null;
  isLoading: boolean;
  video: LessonVideoAccess | null;
  reason: string | null;
  errorMessage: string | null;
}

export interface LessonVideoPlaybackResult extends LessonVideoPlaybackState {
  retry: () => void;
}

const INITIAL_STATE: LessonVideoPlaybackState = {
  lessonId: null,
  isLoading: false,
  video: null,
  reason: null,
  errorMessage: null,
};

const getRetryDelayMs = (expiresAt: string | null) => {
  if (!expiresAt) {
    return null;
  }

  const expiresAtMs = Date.parse(expiresAt);

  if (!Number.isFinite(expiresAtMs)) {
    return null;
  }

  if (expiresAtMs <= Date.now()) {
    return null;
  }

  const leadTimeMs = 1000;
  return Math.max(1000, expiresAtMs - Date.now() - leadTimeMs);
};

const normalizeLessonVideoState = (
  response: LessonVideoAccessResponse | null,
): Pick<LessonVideoPlaybackState, 'video' | 'reason' | 'errorMessage'> => {
  if (!response) {
    return {
      video: null,
      reason: null,
      errorMessage: 'No se pudo cargar el video de la leccion.',
    };
  }

  if (!response.canAccess || !response.video?.playbackUrl) {
    return {
      video: response.video ?? null,
      reason: response.reason,
      errorMessage: null,
    };
  }

  return {
    video: response.video,
    reason: null,
    errorMessage: null,
  };
};

export const useLessonVideoPlayback = (lessonId: number | null): LessonVideoPlaybackResult => {
  const [state, setState] = useState<LessonVideoPlaybackState>(INITIAL_STATE);
  const [retrySeed, setRetrySeed] = useState(0);
  const refreshTimerRef = useRef<number | null>(null);
  const cacheRef = useRef<
    Map<number, Pick<LessonVideoPlaybackState, 'video' | 'reason' | 'errorMessage'>>
  >(new Map());

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const retry = useCallback(() => {
    setRetrySeed((current) => current + 1);
  }, []);

  useEffect(() => {
    clearRefreshTimer();

    if (lessonId === null) {
      setState(INITIAL_STATE);
      return;
    }

    const controller = new AbortController();
    let isActive = true;
    const cachedState = cacheRef.current.get(lessonId);

    const scheduleRefresh = (expiresAt: string | null) => {
      const delayMs = getRetryDelayMs(expiresAt);

      if (delayMs === null) {
        return;
      }

      refreshTimerRef.current = window.setTimeout(() => {
        if (isActive) {
          setRetrySeed((current) => current + 1);
        }
      }, delayMs);
    };

    const hasValidCachedVideo = Boolean(
      cachedState?.video?.playbackUrl && getRetryDelayMs(cachedState.video.expiresAt) !== null,
    );
    const canReuseCache = retrySeed === 0 && Boolean(cachedState) && (
      hasValidCachedVideo
      || cachedState?.reason !== null
      || cachedState?.errorMessage !== null
    );

    if (canReuseCache && cachedState) {
      setState({
        lessonId,
        isLoading: false,
        video: cachedState.video,
        reason: cachedState.reason,
        errorMessage: cachedState.errorMessage,
      });

      if (hasValidCachedVideo) {
        scheduleRefresh(cachedState.video?.expiresAt ?? null);
      }

      return () => {
        isActive = false;
        controller.abort();
        clearRefreshTimer();
      };
    }

    setState((current) =>
      current.lessonId === lessonId
        ? {
            ...current,
            isLoading: true,
            reason: null,
            errorMessage: null,
          }
        : {
            lessonId,
            isLoading: true,
            video: null,
            reason: null,
            errorMessage: null,
          },
    );

    const loadVideo = async () => {
      const response = await fetchLessonVideoAccess(lessonId, controller.signal);

      if (!isActive) {
        return;
      }

      const nextState = normalizeLessonVideoState(response);
      cacheRef.current.set(lessonId, nextState);

      setState({
        lessonId,
        isLoading: false,
        ...nextState,
      });

      if (response?.canAccess && response.video?.playbackUrl) {
        scheduleRefresh(response.video.expiresAt);
      }
    };

    void loadVideo().catch((error: unknown) => {
      if (!isActive || (error instanceof Error && error.name === 'AbortError')) {
        return;
      }

      const nextErrorMessage = getFriendlyRequestErrorMessage(
        error,
        'No se pudo cargar el video de la leccion.',
      );

      cacheRef.current.set(lessonId, {
        video: null,
        reason: null,
        errorMessage: nextErrorMessage,
      });

      setState({
        lessonId,
        isLoading: false,
        video: null,
        reason: null,
        errorMessage: nextErrorMessage,
      });
    });

    return () => {
      isActive = false;
      controller.abort();
      clearRefreshTimer();
    };
  }, [clearRefreshTimer, lessonId, retrySeed]);

  return {
    ...state,
    retry,
  };
};
