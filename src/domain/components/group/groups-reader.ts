import { Inject, Injectable } from '@nestjs/common';
import { GroupsRepository } from 'src/domain/interface/group/groups.repository';
import { getGroupCursor } from 'src/domain/helpers/get-cursor';
import { PaginationInput } from 'src/shared/types';
import { GroupNotFoundException } from 'src/domain/error/exceptions/not-found.exception';

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

  async readDetail(id: string) {
    const group = await this.groupsRepository.findDetailById(id);
    if (!group) {
      throw new GroupNotFoundException();
    }

    return group;
  }

  async readOne(groupId: string, ownerId: string) {
    const group = await this.groupsRepository.findOneByGroupAndOwnerId(
      groupId,
      ownerId,
    );
    if (!group) {
      throw new GroupNotFoundException();
    }

    return group;
  }

  async readOneById(id: string) {
    const group = await this.groupsRepository.findOneById(id);
    if (!group) {
      throw new GroupNotFoundException();
    }

    return group;
  }
}
