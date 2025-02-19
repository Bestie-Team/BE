import { Inject } from '@nestjs/common';
import {
  getReceivedGatheringInvitationCursor,
  getSentGatheringInvitationCursor,
} from 'src/domain/helpers/get-cursor';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import { PaginatedDateRangeInput } from 'src/shared/types';

export class GatheringInvitationsReadService {
  constructor(
    @Inject(GatheringParticipationsRepository)
    private readonly gatheringParticipationsRepository: GatheringParticipationsRepository,
  ) {}

  async getReceivedInvitations(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ) {
    const invitations =
      await this.gatheringParticipationsRepository.findReceivedByParticipantId(
        userId,
        paginatedDateRangeInput,
      );

    const nextCursor = getReceivedGatheringInvitationCursor(
      invitations,
      paginatedDateRangeInput.limit,
    );
    return {
      invitations,
      nextCursor,
    };
  }

  async getSentInvitations(
    userId: string,
    paginatedDateRangeInput: PaginatedDateRangeInput,
  ) {
    const invitations =
      await this.gatheringParticipationsRepository.findSentBySenderId(
        userId,
        paginatedDateRangeInput,
      );

    const nextCursor = getSentGatheringInvitationCursor(
      invitations,
      paginatedDateRangeInput.limit,
    );
    return {
      invitations,
      nextCursor,
    };
  }
}
