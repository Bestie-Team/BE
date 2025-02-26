import { Module } from '@nestjs/common';
import { GatheringInvitationAcceptanceUseCase } from 'src/application/use-cases/gathering/gathering-invitation-acceptance.use-case';
import { GatheringsController } from 'src/presentation/controllers/gathering/gatherings.controller';
import { GatheringsService } from 'src/domain/services/gatherings/gatherings.service';
import { GatheringsComponentModule } from 'src/modules/gathering/gatherings-component.module';
import { GatheringParticipationModules } from 'src/modules/gathering/gathering-participation.module';
import { GroupParticipationsModule } from 'src/modules/group/group-participations.module';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';
import { NotificationsManagerModule } from 'src/modules/notification/notifications-manager.module';
import { NotificationsModule } from 'src/modules/notification/notifications.module';

@Module({
  imports: [
    GroupParticipationsModule,
    GatheringsComponentModule,
    GatheringParticipationModules,
    UsersComponentModule,
    NotificationsModule,
    NotificationsManagerModule,
  ],
  controllers: [GatheringsController],
  providers: [GatheringInvitationAcceptanceUseCase, GatheringsService],
})
export class GatheringsModule {}
