export interface FeedPrototype {
  readonly writerId: string;
  readonly gatheringId: string | null;
  readonly content: string;
}

export interface CreateGatheringFeedInput
  extends Pick<FeedPrototype, 'writerId' | 'content'> {
  readonly gatheringId: string;
}
