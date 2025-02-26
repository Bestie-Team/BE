import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { GroupsRepository } from 'src/domain/interface/group/groups.repository';
import { getGroupCursor } from 'src/domain/helpers/get-cursor';
import { PaginationInput } from 'src/shared/types';
import { NOT_FOUND_GROUP_MESSAGE } from 'src/domain/error/messages';

@Injectable()
export class GroupsReader {
  constructor(
    @Inject(GroupsRepository)
    private readonly groupsRepository: GroupsRepository,
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

  async readOne(groupId: string, ownerId: string) {
    const group = await this.groupsRepository.findOneByGroupAndOwnerId(
      groupId,
      ownerId,
    );

    return group;
  }

  async readOneById(id: string) {
    const group = await this.groupsRepository.findOneById(id);
    if (!group) {
      throw new NotFoundException(NOT_FOUND_GROUP_MESSAGE);
    }

    return group;
  }
}
