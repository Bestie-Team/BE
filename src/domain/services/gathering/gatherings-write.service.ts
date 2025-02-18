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
import { FriendsRepository } from 'src/domain/interface/friend/friends.repository';
import {
  GatheringPrototype,
  UpdateInput,
} from 'src/domain/types/gathering.types';
import { GatheringsRepository } from 'src/domain/interface/gathering/gatherings.repository';
import { GatheringParticipationEntity } from 'src/domain/entities/gathering/gathering-participation.entity';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import { checkIsFriendAll } from 'src/domain/helpers/check-is-friend';

@Injectable()
export class GatheringsWriteService {
  constructor(
    @Inject(GatheringsRepository)
    private readonly gatheringsRepository: GatheringsRepository,
    @Inject(GatheringParticipationsRepository)
    private readonly gatheringParticipationsRepository: GatheringParticipationsRepository,
    @Inject(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
  ) {}

  async checkIsFriend(userId: string, friendUserIds: string[]) {
    await checkIsFriendAll(this.friendsRepository, userId, friendUserIds);
  }

  @Transactional()
  async createTransaction(
    gathering: GatheringEntity,
    participations: GatheringParticipationEntity[],
  ) {
    await this.gatheringsRepository.save(gathering);
    await this.gatheringParticipationsRepository.saveMany(participations);
  }

  createGathering(prototype: GatheringPrototype) {
    const stdDate = new Date();
    return GatheringEntity.create(prototype, v4, stdDate);
  }

  async accept(invitationId: string, userId: string) {
    await this.checkIsParticipant(invitationId, userId);
    await this.gatheringParticipationsRepository.updateStatus(
      invitationId,
      'ACCEPTED',
    );
  }

  async reject(invitationId: string, userId: string) {
    await this.checkIsParticipant(invitationId, userId);
    await this.gatheringParticipationsRepository.delete(invitationId);
  }

  private async checkIsParticipant(invitationId: string, userId: string) {
    const participation =
      await this.gatheringParticipationsRepository.findOneByIdAndParticipantId(
        invitationId,
        userId,
      );
    if (!participation) {
      throw new ForbiddenException(FORBIDDEN_MESSAGE);
    }
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
    await this.gatheringParticipationsRepository.deleteAllByGatheringId(
      gatheringId,
    );
  }
}
