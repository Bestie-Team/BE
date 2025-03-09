import { DomainException } from 'src/domain/error/exceptions/domain.exception';
import {
  NOT_FOUND_FEED_MESSAGE,
  NOT_FOUND_FRIEND_MESSAGE,
  NOT_FOUND_GATHERING_MESSAGE,
  NOT_FOUND_GATHERING_PARTICIPATION,
  NOT_FOUND_GROUP_MESSAGE,
  NOT_FOUND_USER_MESSAGE,
} from 'src/domain/error/messages';

export class NotFoundException extends DomainException {
  constructor(message: string, name = 'not found') {
    super(message, name);
  }
}

export class GatheringNotFoundException extends NotFoundException {
  constructor() {
    super(NOT_FOUND_GATHERING_MESSAGE);
  }
}

export class GatheringParticipationNotFoundException extends NotFoundException {
  constructor() {
    super(NOT_FOUND_GATHERING_PARTICIPATION);
  }
}

export class FeedNotFoundException extends NotFoundException {
  constructor() {
    super(NOT_FOUND_FEED_MESSAGE);
  }
}

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super(NOT_FOUND_USER_MESSAGE);
  }
}

export class GroupNotFoundException extends NotFoundException {
  constructor() {
    super(NOT_FOUND_GROUP_MESSAGE);
  }
}

export class FriendNotFoundException extends NotFoundException {
  constructor() {
    super(NOT_FOUND_FRIEND_MESSAGE);
  }
}
