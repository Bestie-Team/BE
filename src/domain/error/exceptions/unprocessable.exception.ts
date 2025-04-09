import { DomainException } from 'src/domain/error/exceptions/domain.exception';
import {
  CANT_INVITE_REPORTED_USER,
  CANT_MENTIONED_SELF,
  CANT_REQUEST_REPORTED_FRIEND_MESSAGE,
  FEED_CREATION_PERIOD_EXCEEDED_MESSAGE,
  GATHERING_CREATION_PAST_DATE_MESSAGE,
  GROUP_MEMBER_LIMIT_EXCEEDED_MESSAGE,
  GROUP_OWNER_CANT_LEAVE_MESSAGE,
  IS_NOT_DONE_GATHERING_MESSAGE,
  IS_NOT_FRIEND_RELATION_MESSAGE,
} from 'src/domain/error/messages';

export class UnprocessableException extends DomainException {
  constructor(message: string, name = 'unprocessable') {
    super(message, name);
  }
}

export class GroupOwnerCannotLeaveException extends UnprocessableException {
  constructor() {
    super(GROUP_OWNER_CANT_LEAVE_MESSAGE);
  }
}

export class ReportedUserCannotInviteException extends UnprocessableException {
  constructor() {
    super(CANT_INVITE_REPORTED_USER);
  }
}

export class GroupMemberLimitExceededException extends UnprocessableException {
  constructor() {
    super(GROUP_MEMBER_LIMIT_EXCEEDED_MESSAGE);
  }
}

export class FriendshipRequiredException extends UnprocessableException {
  constructor() {
    super(IS_NOT_FRIEND_RELATION_MESSAGE);
  }
}

export class ReportedUserCannotRequestException extends UnprocessableException {
  constructor() {
    super(CANT_REQUEST_REPORTED_FRIEND_MESSAGE);
  }
}

export class GatheringNotCompletedException extends UnprocessableException {
  constructor() {
    super(IS_NOT_DONE_GATHERING_MESSAGE);
  }
}

export class FeedCreationPeriodExceededException extends UnprocessableException {
  constructor() {
    super(FEED_CREATION_PERIOD_EXCEEDED_MESSAGE);
  }
}

export class GatheringCreationPastDateException extends UnprocessableException {
  constructor() {
    super(GATHERING_CREATION_PAST_DATE_MESSAGE);
  }
}

export class CannotMentionSelfException extends UnprocessableException {
  constructor() {
    super(CANT_MENTIONED_SELF);
  }
}
