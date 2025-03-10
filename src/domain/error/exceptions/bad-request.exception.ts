import { DomainException } from 'src/domain/error/exceptions/domain.exception';
import { REQUIRED_GROUP_OR_FRIEND_MESSAGE } from 'src/domain/error/messages';

export class BadRequestException extends DomainException {
  constructor(message: string, name = 'bad request') {
    super(message, name);
  }
}

export class GroupOrFriendRequiredException extends BadRequestException {
  constructor() {
    super(REQUIRED_GROUP_OR_FRIEND_MESSAGE);
  }
}
