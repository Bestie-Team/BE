export const NOT_FOUND_USER_MESSAGE = '존재하지 않는 회원 정보입니다.';
export const NOT_FOUND_FRIEND_MESSAGE = '존재하지 않는 친구 혹은 요청입니다.';
export const NOT_FOUND_GATHERING_MESSAGE = '존재하지 않는 모임입니다.';
export const NOT_FOUND_GATHERING_PARTICIPATION = '존재하지 않는 초대입니다.';
export const NOT_FOUND_GROUP_MESSAGE = '존재하지 않는 그룹입니다.';
export const NOT_FOUND_COMMENT_MESSAGE = '존재하지 않는 댓글입니다.';
export const NOT_FOUND_FEED_MESSAGE = '존재하지 않는 피드입니다.';
export const NOT_FOUND_REFRESH_TOKEN = '리프레시 토큰이 없습니다.';
export const INVALID_TOKEN_MESSAGE = '유효하지 않은 토큰입니다.';
export const FRIEND_REQUEST_ALREADY_EXIST_MESSAGE = `이미 존재하는 요청입니다.`;
export const FRIEND_ALREADY_EXIST_MESSAGE = '이미 친구인 회원입니다.';
export const CANT_REQUEST_REPORTED_FRIEND_MESSAGE =
  '신고한 회원에게 친구 요청을 보낼 수 없습니다.';
export const FORBIDDEN_MESSAGE = '권한이 없습니다.';
export const IS_NOT_FRIEND_RELATION_MESSAGE = '친구 관계가 아닙니다.';
export const GROUP_OWNER_CANT_LEAVE_MESSAGE =
  '그룹장은 그룹을 떠날 수 없습니다.';
export const GROUP_GATHERING_REQUIRED_GROUPID_MESSAGE =
  '그룹 타입의 모임에 그룹 번호는 필수입니다.';
export const MINIMUM_FRIENDS_REQUIRED_MESSAGE =
  '친구가 최소 1명은 있어야합니다.';
export const DUPLICATE_ACCOUNT_ID_MESSAGE = '이미 존재하는 계정 아이디입니다.';
export const ACCOUNT_ID_CHANGE_COOLDOWN_MESSAGE = (days: number) =>
  `계정 아이디는 ${days}일 후에 변경 가능합니다.`;
export const IS_NOT_DONE_GATHERING_MESSAGE =
  '완료되지 않은 모임에는 피드를 기록할 수 없습니다.';
export const DUPLICATE_GATHERING_FEED = '이미 작성한 피드가 존재합니다.';
export const FEED_CREATION_PERIOD_EXCEEDED_MESSAGE =
  '모임 완료 후 30일이 지나 피드를 작성할 수 없습니다.';
export const CANT_INVITE_REPORTED_USER =
  '그룹을 신고한 회원은 초대할 수 없습니다.';
export const GROUP_MEMBER_ALREADY_EXIST_MESSAGE =
  '이미 존재하는 그룹 멤버입니다.';
export const CANT_DELETE_END_GATHERING = '완료된 모임은 삭제할 수 없습니다.';

export const REQUIRED_GROUP_OR_FRIEND_MESSAGE =
  '그룹 번호 또는 친구 번호는 필수로 제공되어야 합니다.';
export const CONFLICT_GROUP_AND_FRIEND_MESSAGE =
  '그룹 번호와 친구 번호는 동시에 제공될 수 없습니다.';
export const GATHERING_CREATION_PAST_DATE_MESSAGE =
  '현재보다 이전의 모임은 생성할 수 없습니다.';
export const MUST_HAVE_DEVICE_ID_MESSAGE = '디바이스 식별 값이 없습니다.';
export const GROUP_MEMBER_LIMIT_EXCEEDED_MESSAGE =
  '그룹 멤버는 최대 10명까지 가능합니다.';
export const CANT_MENTIONED_SELF = '자신을 맨션할 수 없습니다.';
