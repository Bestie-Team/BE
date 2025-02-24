import { Module } from '@nestjs/common';
import { GatheringInvitationAcceptanceUseCase } from 'src/application/use-cases/gathering/gathering-invitation-acceptance.use-case';
import { GatheringParticipationModules } from 'src/modules/gathering/gathering-participation.module';
import { GroupsModule } from 'src/modules/group/groups.module';
import { NotificationsModule } from 'src/modules/notification/notifications.module';
import { UsersModule } from 'src/modules/user/users.module';
import { GatheringsController } from 'src/presentation/controllers/gathering/gatherings.controller';
import { GatheringsService } from 'src/domain/services/gatherings/gatherings.service';
import { GatheringsComponentModule } from 'src/modules/gathering/gatherings-component.module';

@Module({
  imports: [
    GroupsModule,
    GatheringsComponentModule,
    GatheringParticipationModules,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [GatheringsController],
  providers: [GatheringInvitationAcceptanceUseCase, GatheringsService],
  exports: [],
})
export class GatheringsModule {}
