import { Module } from '@nestjs/common';
import { GatheringCreationUseCase } from 'src/application/use-cases/gathering/gathering-creation.use-case';
import { GatheringInvitationAcceptanceUseCase } from 'src/application/use-cases/gathering/gathering-invitation-acceptance-use-case';
import { GatheringsRepository } from 'src/domain/interface/gathering/gatherings.repository';
import { GatheringInvitationsReadService } from 'src/domain/services/gathering/gathering-invitations-read.service';
import { GatheringsReadService } from 'src/domain/services/gathering/gatherings-read.service';
import { GatheringsWriteService } from 'src/domain/services/gathering/gatherings-write.service';
import { GatheringsPrismaRepository } from 'src/infrastructure/repositories/gathering/gatherings-prisma.repository';
import { FriendsModule } from 'src/modules/friend/friends.module';
import { GatheringParticipationModules } from 'src/modules/gathering/gathering-participation.module';
import { GroupsModule } from 'src/modules/group/groups.module';
import { NotificationsModule } from 'src/modules/notification/notifications.module';
import { UsersModule } from 'src/modules/user/users.module';
import { GatheringsController } from 'src/presentation/controllers/gathering/gatherings.controller';

@Module({
  imports: [
    FriendsModule,
    GroupsModule,
    GatheringParticipationModules,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [GatheringsController],
  providers: [
    GatheringCreationUseCase,
    GatheringInvitationAcceptanceUseCase,
    GatheringsWriteService,
    GatheringsReadService,
    GatheringInvitationsReadService,
    { provide: GatheringsRepository, useClass: GatheringsPrismaRepository },
  ],
  exports: [
    GatheringsWriteService,
    { provide: GatheringsRepository, useClass: GatheringsPrismaRepository },
  ],
})
export class GatheringsModule {}
