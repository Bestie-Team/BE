export interface CreateGatheringFeedInput {
  readonly writerId: string;
  readonly gatheringId: string;
  readonly content: string;
}

export interface FeedPrototype {
  readonly writerId: string;
  readonly gatheringId: string | null;
  readonly content: string;
}
