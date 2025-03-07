import { Module } from '@nestjs/common';
import { GroupParticipationsReader } from 'src/domain/components/group/group-participations-reader';
import { GroupParticipationsWriter } from 'src/domain/components/group/group-participations-writer';
import { GroupParticipationsRepository } from 'src/domain/interface/group/group-participations.repository';
import { GroupParticipationsPrismaRepository } from 'src/infrastructure/repositories/group/group-participations-prisma.repository';

@Module({
  providers: [
    GroupParticipationsWriter,
    GroupParticipationsReader,
    {
      provide: GroupParticipationsRepository,
      useClass: GroupParticipationsPrismaRepository,
    },
  ],
  exports: [GroupParticipationsReader, GroupParticipationsWriter],
})
export class GroupParticipationsModule {}
