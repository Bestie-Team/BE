import { Gathering } from 'src/domain/types/gathering.types';

export const gatheringConverter = {
  toListDto: ({
    gatherings,
    nextCursor,
  }: {
    gatherings: Gathering[];
    nextCursor: string | null;
  }) => {
    return {
      gatherings: gatherings.map((gathering) => ({
        ...gathering,
        gatheringDate: gathering.gatheringDate.toISOString(),
      })),
      nextCursor,
    };
  },
};
