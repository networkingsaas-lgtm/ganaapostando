import { getJson, postJson } from '../../../api/core/backendClient';
import type { TelegramLinkTokenResponse, TelegramMeResponse } from '../types';

const buildAuthorizedHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
});

export const fetchTelegramVipStatus = (accessToken: string) =>
  getJson<TelegramMeResponse>('/telegram/me', {
    headers: buildAuthorizedHeaders(accessToken),
  });

export const createTelegramLinkToken = (accessToken: string) =>
  postJson<TelegramLinkTokenResponse, Record<string, never>>(
    '/telegram/link-token',
    {},
    {
      headers: buildAuthorizedHeaders(accessToken),
    },
  );
