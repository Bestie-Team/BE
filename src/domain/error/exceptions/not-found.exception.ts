import {
  NOT_FOUND_FEED_MESSAGE,
  NOT_FOUND_GATHERING_MESSAGE,
  NOT_FOUND_GATHERING_PARTICIPATION,
} from 'src/domain/error/messages';

class NotFoundException extends Error {
  constructor(message: string) {
    super(message);
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
