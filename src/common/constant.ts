export const IMAGE_BASE_URL = 'https://cdn.lighty.today';
export const GOOGLE_USER_INFO_URL =
  'https://www.googleapis.com/oauth2/v3/userinfo';
export const KAKAO_USER_INFO_URL =
  'https://kapi.kakao.com/v2/user/me?secure_resource=true';
export const APPLE_KEYS_URL = 'https://appleid.apple.com/auth/keys';

export const notificationTypes = {
  GATHERING_INVITATION_RECEIVED: 'GATHERING_INVITATION_RECEIVED',
  GATHERING_INVITATION_ACCEPTED: 'GATHERING_INVITATION_ACCEPTED',
  GROUP_INVITATION: 'GROUP_INVITATION',
  FRIEND_REQUEST: 'FRIEND_REQUEST',
  FRIEND_REQUEST_ACCEPTED: 'FRIEND_REQUEST_ACCEPTED',
  FEED_COMMENT: 'FEED_COMMENT',
  FEED_COMMENT_MENTIONED: 'FEED_COMMENT_MENTIONED',
};

export type NotificationTypes = keyof typeof notificationTypes;

export const APP_NAME = 'LIGHTY';

export const BUCKET_IMAGE_PATH = {
  FEED: 'feed/image',
  USER: 'user/profile',
  GATHERING: 'gathering/invitation',
  GROUP: 'group/cover',
};
