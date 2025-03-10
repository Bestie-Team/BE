import { GroupParticipationEntity } from 'src/domain/entities/group/group-participation';
import { GroupParticipationStatus } from 'src/shared/types';

export interface GroupParticipationsRepository {
  save(data: GroupParticipationEntity): Promise<void>;
  saveMany(data: GroupParticipationEntity[]): Promise<void>;
  findByUserIds(
    userIds: string[],
  ): Promise<{ id: string; status: GroupParticipationStatus }[]>;
  /**
   * 그룹장을 포함한 모든 멤버 조회.
   */
  findMembersByGroupId(groupId: string): Promise<{ participantId: string }[]>;
  delete(groupId: string, participantId: string): Promise<void>;
  countMember(groupId: string): Promise<number>;
  update(
    groupId: string,
    participantId: string,
    data: Partial<GroupParticipationEntity>,
  ): Promise<void>;
}

export const GroupParticipationsRepository = Symbol(
  'GroupParticipationsRepository',
);
