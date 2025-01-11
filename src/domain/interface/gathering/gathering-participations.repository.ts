import { GatheringParticipationEntity } from 'src/domain/entities/gathering/gathering-participation.entity';
import { GatheringInvitation } from 'src/domain/types/gathering.types';
import {
  GatheringParticipationStatus,
  PaginationInput,
} from 'src/shared/types';

export interface GatheringParticipationsRepository {
  save(data: GatheringParticipationEntity): Promise<void>;
  findOneByIdAndParticipantId(
    id: string,
    participantId: string,
  ): Promise<{ id: string } | null>;
  findReceivedByParticipantId(
    participantId: string,
    paginationInput: PaginationInput,
  ): Promise<GatheringInvitation[]>;
  updateStatus(
    invitationId: string,
    status: GatheringParticipationStatus,
  ): Promise<void>;
  delete(invitationId: string): Promise<void>;
}

export const GatheringParticipationsRepository = Symbol(
  'GatheringParticipationsRepository',
);
