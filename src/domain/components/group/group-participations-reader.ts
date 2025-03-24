import { Inject, Injectable } from '@nestjs/common';
import { GroupParticipationsRepository } from 'src/domain/interface/group/group-participations.repository';

@Injectable()
export class GroupParticipationsReader {
  constructor(
    @Inject(GroupParticipationsRepository)
    private readonly groupParticipationsRepository: GroupParticipationsRepository,
  ) {}

  async readMulti(groupId: string, userIds: string[]) {
    return this.groupParticipationsRepository.findByUserIds(groupId, userIds);
  }

  async readParticipants(groupId: string) {
    const participations =
      await this.groupParticipationsRepository.findMembersByGroupId(groupId);
    return participations.map((participation) => participation.participantId);
  }

  async getMemberCount(groupId: string) {
    return await this.groupParticipationsRepository.countMember(groupId);
  }
}
