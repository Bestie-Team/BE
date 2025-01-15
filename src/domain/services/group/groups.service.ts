import { Inject, Injectable } from '@nestjs/common';
import { GroupsRepository } from 'src/domain/interface/group/groups.repository';
import { getGroupCursor } from 'src/domain/helpers/get-cursor';
import { PaginationInput } from 'src/shared/types';

@Injectable()
export class GroupsService {
  constructor(
    @Inject(GroupsRepository)
    private readonly groupsRepository: GroupsRepository,
  ) {}

  async getGroupsByUserId(userId: string, paginationInput: PaginationInput) {
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
}
