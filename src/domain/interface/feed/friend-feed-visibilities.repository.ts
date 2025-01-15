import { FriendFeedVisibilityEntity } from 'src/domain/entities/feed/friend-feed-visibility.entity';

export interface FriendFeedVisibilitiesRepository {
  saveMany(data: FriendFeedVisibilityEntity[]): Promise<void>;
}

export const FriendFeedVisibilitiesRepository = Symbol(
  'FriendFeedVisibilitiesRepository',
);
