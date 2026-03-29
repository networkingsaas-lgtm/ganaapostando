import { getRequiredClientEnv, trimTrailingSlash } from '../../lib/env';

const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
} as const;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
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

export const ensureOk = async (response: Response) => {
  if (response.ok) {
    return response;
  }

  throw new ApiError(await getResponseErrorMessage(response), response.status);
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
