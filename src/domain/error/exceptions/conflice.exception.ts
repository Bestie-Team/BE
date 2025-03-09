import { DomainException } from 'src/domain/error/exceptions/domain.exception';
import {
  FRIEND_ALREADY_EXIST_MESSAGE,
  FRIEND_REQUEST_ALREADY_EXIST_MESSAGE,
  GROUP_MEMBER_ALREADY_EXIST_MESSAGE,
} from 'src/domain/error/messages';

export class ConflictException extends DomainException {
  constructor(message: string, name = 'conflict') {
    super(message, name);
  }
}

export class AlreadyExistMemberException extends ConflictException {
  constructor() {
    super(GROUP_MEMBER_ALREADY_EXIST_MESSAGE);
  }
}

export class AlreadyFriendsException extends ConflictException {
  constructor() {
    super(FRIEND_ALREADY_EXIST_MESSAGE);
  }
}

export class AlreadyExistRequestException extends ConflictException {
  constructor() {
    super(FRIEND_REQUEST_ALREADY_EXIST_MESSAGE);
  }
}
