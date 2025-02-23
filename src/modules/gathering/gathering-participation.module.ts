import { Module } from '@nestjs/common';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import { GatheringInvitationsWriter } from 'src/domain/services/gathering/gathering-invitations-writer';
import { GatheringParticipationsPrismaRepository } from 'src/infrastructure/repositories/gathering/gathering-participations-prisma.repository';

@Module({
  providers: [
    GatheringInvitationsWriter,
    {
      provide: GatheringParticipationsRepository,
      useClass: GatheringParticipationsPrismaRepository,
    },
  ],
  exports: [
    GatheringInvitationsWriter,
    {
      provide: GatheringParticipationsRepository,
      useClass: GatheringParticipationsPrismaRepository,
    },
  ],
})
export class GatheringParticipationModules {}
