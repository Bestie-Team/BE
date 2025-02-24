import { Module } from '@nestjs/common';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import { GatheringInvitationsWriter } from 'src/domain/components/gathering/gathering-invitations-writer';
import { GatheringParticipationsPrismaRepository } from 'src/infrastructure/repositories/gathering/gathering-participations-prisma.repository';
import { GatheringInvitationsReader } from 'src/domain/components/gathering/gathering-invitations-reader';

@Module({
  providers: [
    GatheringInvitationsWriter,
    GatheringInvitationsReader,
    {
      provide: GatheringParticipationsRepository,
      useClass: GatheringParticipationsPrismaRepository,
    },
  ],
  exports: [GatheringInvitationsWriter, GatheringInvitationsReader],
})
export class GatheringParticipationModules {}
