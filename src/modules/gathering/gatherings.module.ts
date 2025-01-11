import { Module } from '@nestjs/common';
import { GatheringParticipationsRepository } from 'src/domain/interface/gathering/gathering-participations.repository';
import { GatheringsRepository } from 'src/domain/interface/gathering/gatherings.repository';
import { GatheringInvitationsReadService } from 'src/domain/services/gathering/gathering-invitations-read.service';
import { GatheringsWriteService } from 'src/domain/services/gathering/gatherings-write.service';
import { GatheringParticipationsPrismaRepository } from 'src/infrastructure/repositories/gathering/gathering-participations-prisma.repository';
import { GatheringsPrismaRepository } from 'src/infrastructure/repositories/gathering/gatherings-prisma.repository';
import { FriendsModule } from 'src/modules/friend/friends.module';
import { GroupsModule } from 'src/modules/group/groups.module';
import { GatheringsController } from 'src/presentation/controllers/gathering/gatherings.controller';

@Module({
  imports: [FriendsModule, GroupsModule],
  controllers: [GatheringsController],
  providers: [
    GatheringsWriteService,
    GatheringInvitationsReadService,
    { provide: GatheringsRepository, useClass: GatheringsPrismaRepository },
    {
      provide: GatheringParticipationsRepository,
      useClass: GatheringParticipationsPrismaRepository,
    },
  ],
  exports: [
    { provide: GatheringsRepository, useClass: GatheringsPrismaRepository },
  ],
})
export class GatheringsModule {}
