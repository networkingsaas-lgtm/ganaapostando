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

export interface TelegramGroupInfo {
  configured: boolean;
  memberCount: number | null;
  memberCountUpdatedAt: string | null;
  recentActivityAt: string | null;
}

export interface TelegramSubscriptionInfo {
  status?: string | null;
  productId?: number | null;
  product_id?: number | null;
  cancelAtPeriodEnd?: boolean | null;
  currentPeriodEnd?: string | null;
  expiresAt?: string | null;
  endsAt?: string | null;
  subscriptionExpiresAt?: string | null;
  entitlementEndsAt?: string | null;
}

export interface TelegramMeResponse {
  userId: string;
  activeSubscription: boolean;
  productId?: number | null;
  product_id?: number | null;
  subscriptionStatus?: string | null;
  cancelAtPeriodEnd?: boolean | null;
  currentPeriodEnd?: string | null;
  expiresAt?: string | null;
  endsAt?: string | null;
  subscriptionExpiresAt?: string | null;
  entitlementEndsAt?: string | null;
  subscription?: TelegramSubscriptionInfo | null;
  group?: TelegramGroupInfo | null;
  groupMemberCount?: number | null;
  recentActivityAt?: string | null;
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
