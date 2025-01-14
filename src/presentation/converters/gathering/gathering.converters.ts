import { Gathering, GatheringDetail } from 'src/domain/types/gathering.types';
import { GatheringDetailResponse } from 'src/presentation/dto/gathering/response/gathering-detail.response';

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

  toDto: (gatheringDetail: GatheringDetail): GatheringDetailResponse => {
    return {
      ...gatheringDetail,
      gatheringDate: gatheringDetail.gatheringDate.toISOString(),
    };
  },
};
