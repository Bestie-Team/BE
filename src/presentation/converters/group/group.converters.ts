import { Group } from 'src/domain/types/group.types';
import { GroupDetailResponse, GroupListResponse } from 'src/presentation/dto';

export const groupConverter = {
  toListDto: ({
    groups,
    nextCursor,
  }: {
    groups: Group[];
    nextCursor: string | null;
  }): GroupListResponse => {
    return {
      groups: groups.map((group) => ({
        ...group,
        joinDate: group.joinDate.toISOString(),
      })),
      nextCursor,
    };
  },

  toDto: (group: Group): GroupDetailResponse => {
    return {
      ...group,
      joinDate: group.joinDate.toISOString(),
    };
  },
};
