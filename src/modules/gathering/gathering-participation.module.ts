import { Module } from '@nestjs/common';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import { GatheringParticipationsPrismaRepository } from 'src/infrastructure/repositories/gathering/gathering-participations-prisma.repository';

@Module({
  providers: [
    {
      provide: GatheringParticipationsRepository,
      useClass: GatheringParticipationsPrismaRepository,
    },
  ],
  exports: [
    {
      provide: GatheringParticipationsRepository,
      useClass: GatheringParticipationsPrismaRepository,
    },
  ],
})
export class GatheringParticipationModules {}
