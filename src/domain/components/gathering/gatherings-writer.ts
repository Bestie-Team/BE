import { Inject, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { GatheringEntity } from 'src/domain/entities/gathering/gathering.entity';
import {
  GatheringPrototype,
  UpdateInput,
} from 'src/domain/types/gathering.types';
import { GatheringsRepository } from 'src/domain/interface/gathering/gatherings.repository';
import { FriendsChecker } from 'src/domain/components/friend/friends-checker';

@Injectable()
export class GatheringsWriter {
  constructor(
    @Inject(GatheringsRepository)
    private readonly gatheringsRepository: GatheringsRepository,
    private readonly friendsChecker: FriendsChecker,
  ) {}

  async create(gathering: GatheringEntity) {
    await this.gatheringsRepository.save(gathering);
  }

  async checkIsFriend(userId: string, friendUserIds: string[]) {
    await this.friendsChecker.checkIsFriendAll(userId, friendUserIds);
  }

  createGathering(prototype: GatheringPrototype) {
    const stdDate = new Date();
    return GatheringEntity.create(prototype, v4, stdDate);
  }

  async update(id: string, input: UpdateInput) {
    const stdDate = new Date();
    const gatheringDate = new Date(input.gatheringDate);
    await this.gatheringsRepository.update(id, {
      ...input,
      gatheringDate,
      updatedAt: stdDate,
    });
  }

  async delete(id: string) {
    await this.gatheringsRepository.delete(id);
  }
}
