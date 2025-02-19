import { Module } from '@nestjs/common';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import { GatheringInvitationsWriteService } from 'src/domain/services/gathering/gathering-invitations-write.service';
import { GatheringParticipationsPrismaRepository } from 'src/infrastructure/repositories/gathering/gathering-participations-prisma.repository';

@Module({
  providers: [
    GatheringInvitationsWriteService,
    {
      provide: GatheringParticipationsRepository,
      useClass: GatheringParticipationsPrismaRepository,
    },
  ],
  exports: [
    GatheringInvitationsWriteService,
    {
      provide: GatheringParticipationsRepository,
      useClass: GatheringParticipationsPrismaRepository,
    },
  ],
})
export class GatheringParticipationModules {}
