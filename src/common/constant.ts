export const IMAGE_BASE_URL = 'https://cdn.lighty.today';
export const GOOGLE_USER_INFO_URL =
  'https://www.googleapis.com/oauth2/v3/userinfo';

export const notificationTypes = {
  GATHERING_INVITATION_RECEIVED: 'GATHERING_INVITATION_RECEIVED',
  GATHERING_INVITATION_ACCEPTED: 'GATHERING_INVITATION_ACCEPTED',
  GROUP_INVITATION: 'GROUP_INVITATION',
  FRIEND_REQUEST: 'FRIEND_REQUEST',
  FRIEND_REQUEST_ACCEPTED: 'FRIEND_REQUEST_ACCEPTED',
  FEED_COMMENT: 'FEED_COMMENT',
};

export type NotificationTypes = keyof typeof notificationTypes;
