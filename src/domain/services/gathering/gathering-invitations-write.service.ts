import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { GatheringParticipationEntity } from 'src/domain/entities/gathering/gathering-participation.entity';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import { FORBIDDEN_MESSAGE } from 'src/domain/error/messages';

@Injectable()
export class GatheringInvitationsWriteService {
  constructor(
    @Inject(GatheringParticipationsRepository)
    private readonly gatheringParticipationsRepository: GatheringParticipationsRepository,
  ) {}

  createGatheringInvitations(gatheringId: string, userIds: string[]) {
    const stdDate = new Date();
    return userIds.map((participantId) =>
      GatheringParticipationEntity.create(
        {
          gatheringId,
          participantId,
        },
        v4,
        stdDate,
      ),
    );
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

  async createMany(participations: GatheringParticipationEntity[]) {
    await this.gatheringParticipationsRepository.saveMany(participations);
  }
}
