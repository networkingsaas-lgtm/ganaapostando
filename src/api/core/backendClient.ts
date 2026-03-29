import { getRequiredClientEnv, trimTrailingSlash } from '../../lib/env';

const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
} as const;

export class ApiError extends Error {
  status: number;
  retryAfterSeconds: number | null;

  constructor(message: string, status: number, retryAfterSeconds: number | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const getBackendApiBaseUrl = () => trimTrailingSlash(getRequiredClientEnv('VITE_BACKEND_URL'));

export const buildBackendApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBackendApiBaseUrl()}${normalizedPath}`;
};

export const getResponseErrorMessage = async (response: Response) => {
  if (response.status === 429) {
    return 'Demasiadas solicitudes en poco tiempo. Espera un momento antes de volver a intentarlo.';
  }

  try {
    const payload: unknown = await response.json();

    if (isRecord(payload)) {
      const message = 'message' in payload ? payload.message : null;
      const error = 'error' in payload ? payload.error : null;

      if (typeof message === 'string' && message.trim()) {
        return message;
      }

      if (typeof error === 'string' && error.trim()) {
        return error;
      }
    }
  } catch {
    return `Error ${response.status} al procesar la solicitud.`;
  }

  return `Error ${response.status} al procesar la solicitud.`;
};

const parseRetryAfterSeconds = (value: string | null) => {
  if (!value) {
    return null;
  }

  const seconds = Number.parseInt(value, 10);

  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds;
  }

  const retryAtMs = Date.parse(value);

  if (!Number.isFinite(retryAtMs)) {
    return null;
  }

  return Math.max(0, Math.ceil((retryAtMs - Date.now()) / 1000));
};

const formatRetryAfterLabel = (retryAfterSeconds: number | null) => {
  if (retryAfterSeconds === null) {
    return null;
  }

  if (retryAfterSeconds < 60) {
    return `${retryAfterSeconds} s`;
  }

  const minutes = Math.ceil(retryAfterSeconds / 60);
  return `${minutes} min`;
};

export const getFriendlyRequestErrorMessage = (
  error: unknown,
  fallbackMessage: string,
) => {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      const retryAfterLabel = formatRetryAfterLabel(error.retryAfterSeconds);

      return retryAfterLabel
        ? `Demasiadas solicitudes en poco tiempo. Vuelve a intentarlo en ${retryAfterLabel}.`
        : 'Demasiadas solicitudes en poco tiempo. Espera un momento antes de volver a intentarlo.';
    }

    return error.message.trim() || fallbackMessage;
  }

  if (error instanceof TypeError) {
    return 'No se pudo conectar con el backend. Revisa que el dominio del frontend esté permitido por CORS y que la URL del backend sea correcta.';
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};

export const ensureOk = async (response: Response) => {
  if (response.ok) {
    return response;
  }

  throw new ApiError(
    await getResponseErrorMessage(response),
    response.status,
    parseRetryAfterSeconds(response.headers.get('Retry-After')),
  );
};

export const getJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(buildBackendApiUrl(path), {
    ...init,
    headers: {
      Accept: JSON_HEADERS.Accept,
      ...(init?.headers ?? {}),
    },
  });

  await ensureOk(response);
  return response.json() as Promise<T>;
};

export const postJson = async <TResponse, TBody>(
  path: string,
  body: TBody,
  init?: Omit<RequestInit, 'body' | 'method'>,
): Promise<TResponse> => {
  const response = await fetch(buildBackendApiUrl(path), {
    method: 'POST',
    ...init,
    headers: {
      ...JSON_HEADERS,
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });

  await ensureOk(response);
  return response.json() as Promise<TResponse>;
};
