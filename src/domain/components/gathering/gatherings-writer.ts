import {
  ForbiddenException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { v4 } from 'uuid';
import { GatheringEntity } from 'src/domain/entities/gathering/gathering.entity';
import {
  CANT_DELETE_END_GATHERING,
  FORBIDDEN_MESSAGE,
} from 'src/domain/error/messages';
import {
  GatheringPrototype,
  UpdateInput,
} from 'src/domain/types/gathering.types';
import { GatheringsRepository } from 'src/domain/interface/gathering/gatherings.repository';
import { GatheringInvitationsWriter } from 'src/domain/components/gathering/gathering-invitations-writer';
import { FriendsChecker } from 'src/domain/components/friend/friends-checker';

@Injectable()
export class GatheringsWriter {
  constructor(
    @Inject(GatheringsRepository)
    private readonly gatheringsRepository: GatheringsRepository,
    private readonly gatheringParticiationsWriter: GatheringInvitationsWriter,
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

  async update(id: string, input: UpdateInput, ownerId: string) {
    const gathering = await this.gatheringsRepository.findOneByIdAndHostId(
      id,
      ownerId,
    );

    if (!gathering) {
      throw new ForbiddenException(FORBIDDEN_MESSAGE);
    }

    const stdDate = new Date();
    const gatheringDate = new Date(input.gatheringDate);
    await this.gatheringsRepository.update(id, {
      ...input,
      gatheringDate,
      updatedAt: stdDate,
    });
  }

  async delete(id: string, userId: string) {
    const gathering = await this.gatheringsRepository.findOneByIdAndHostId(
      id,
      userId,
    );

    if (!gathering) {
      throw new ForbiddenException(FORBIDDEN_MESSAGE);
    }
    if (gathering.endedAt) {
      throw new UnprocessableEntityException(CANT_DELETE_END_GATHERING);
    }

    await this.deleteTransaction(id);
  }

  @Transactional()
  async deleteTransaction(gatheringId: string) {
    await this.gatheringsRepository.delete(gatheringId);
    await this.gatheringParticiationsWriter.deleteMany(gatheringId);
  }
}
