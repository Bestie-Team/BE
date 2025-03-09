import { DomainException } from 'src/domain/error/exceptions/domain.exception';
import {
  CANT_INVITE_REPORTED_USER,
  GROUP_MEMBER_LIMIT_EXCEEDED_MESSAGE,
  GROUP_OWNER_CANT_LEAVE_MESSAGE,
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
