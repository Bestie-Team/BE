import { Inject, Injectable } from '@nestjs/common';
import { GroupsRepository } from 'src/domain/interface/group/groups.repository';
import { getGroupCursor } from 'src/domain/helpers/get-cursor';
import { PaginationInput } from 'src/shared/types';
import { GroupParticipationsRepository } from 'src/domain/interface/group/group-participations.repository';

@Injectable()
export class GroupsReader {
  constructor(
    @Inject(GroupsRepository)
    private readonly groupsRepository: GroupsRepository,
    @Inject(GroupParticipationsRepository)
    private readonly groupParticipationsRepository: GroupParticipationsRepository,
  ) {}

  async read(userId: string, paginationInput: PaginationInput) {
    const groups = await this.groupsRepository.findGroupsByUserId(
      userId,
      paginationInput,
    );
    const nextCursor = getGroupCursor(groups, paginationInput.limit);

    return {
      groups,
      nextCursor,
    };
  }

  async getParticipantsById(id: string) {
    const participations =
      await this.groupParticipationsRepository.findMembersByGroupId(id);
    return participations.map((participation) => participation.participantId);
  }
}
