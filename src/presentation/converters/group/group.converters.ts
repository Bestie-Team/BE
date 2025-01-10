import { Group } from 'src/domain/types/group.types';
import { GroupListResponse } from 'src/presentation/dto';

export const toListDto = ({
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
};
