import {
  ReceivedGatheringInvitation,
  SentGatheringInvitation,
} from 'src/domain/types/gathering.types';
import { ReceivedGatheringInvitationListResponse } from 'src/presentation/dto/gathering/response/received-gathering-invitation-list.response';
import { SentGatheringInvitationListResponse } from 'src/presentation/dto/gathering/response/sent-gathering-invitation-list.response';
import { DateIdCursor } from 'src/shared/types';

export const gatheringInvitationConverter = {
  toRecevedListDto: ({
    invitations,
    nextCursor,
  }: {
    invitations: ReceivedGatheringInvitation[];
    nextCursor: DateIdCursor | null;
  }): ReceivedGatheringInvitationListResponse => {
    return {
      invitations: invitations.map((invitation) => ({
        ...invitation,
        gatheringDate: invitation.gatheringDate.toISOString(),
        createdAt: invitation.createdAt.toISOString(),
      })),
      nextCursor,
    };
  },

  toSentListDto: ({
    invitations,
    nextCursor,
  }: {
    invitations: SentGatheringInvitation[];
    nextCursor: DateIdCursor | null;
  }): SentGatheringInvitationListResponse => {
    return {
      invitations: invitations.map((invitation) => ({
        ...invitation,
        gatheringDate: invitation.gatheringDate.toISOString(),
        createdAt: invitation.createdAt.toISOString(),
      })),
      nextCursor,
    };
  },
};
