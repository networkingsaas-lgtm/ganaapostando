export type TelegramInviteStatus =
  | 'not_linked'
  | 'invited'
  | 'joined'
  | 'removed'
  | 'left'
  | 'blocked_bot';

export interface TelegramLinkedAccount {
  telegramUserId: number | null;
  telegramUsername: string | null;
  inviteStatus: TelegramInviteStatus;
  linkedAt: string;
}

export interface TelegramBotStatus {
  configured: boolean;
  botUsername: string | null;
}

export interface TelegramMeResponse {
  userId: string;
  activeSubscription: boolean;
  expiresAt?: string | null;
  endsAt?: string | null;
  subscriptionExpiresAt?: string | null;
  entitlementEndsAt?: string | null;
  telegram: TelegramLinkedAccount | null;
  bot: TelegramBotStatus;
}

export interface TelegramLinkTokenResponse {
  linked: boolean;
  activeSubscription: boolean;
  linkToken: string;
  expiresAt: string;
  botUsername: string | null;
  botStartUrl: string | null;
  note: string;
}
