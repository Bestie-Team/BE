import { DomainException } from 'src/domain/error/exceptions/domain.exception';
import {
  DUPLICATE_GATHERING_FEED,
  FRIEND_ALREADY_EXIST_MESSAGE,
  FRIEND_REQUEST_ALREADY_EXIST_MESSAGE,
  GROUP_MEMBER_ALREADY_EXIST_MESSAGE,
} from 'src/domain/error/messages';
import { UserInfo } from 'src/domain/types/user.types';

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

export class DuplicateFeedException extends ConflictException {
  constructor() {
    super(DUPLICATE_GATHERING_FEED);
  }
}

export class DuplicateEmailException extends ConflictException {
  constructor() {
    super('이미 존재하는 이메일입니다.');
  }
}

export class DuplicateAccountIdException extends ConflictException {
  constructor() {
    super('이미 존재하는 아이디입니다.');
  }
}

export class RegisterdOtherPlatformException extends ConflictException {
  readonly body: UserInfo;

  constructor(data: UserInfo) {
    super('이미 다른 플랫폼으로 가입된 이메일입니다.');
    this.body = data;
  }
}
