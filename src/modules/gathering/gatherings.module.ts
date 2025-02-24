import { Module } from '@nestjs/common';
import { GatheringInvitationAcceptanceUseCase } from 'src/application/use-cases/gathering/gathering-invitation-acceptance.use-case';
import { NotificationsModule } from 'src/modules/notification/notifications.module';
import { UsersModule } from 'src/modules/user/users.module';
import { GatheringsController } from 'src/presentation/controllers/gathering/gatherings.controller';
import { GatheringsService } from 'src/domain/services/gatherings/gatherings.service';
import { GatheringsComponentModule } from 'src/modules/gathering/gatherings-component.module';
import { GatheringParticipationModules } from 'src/modules/gathering/gathering-participation.module';
import { GroupParticipationsModule } from 'src/modules/group/group-participations.module';

@Module({
  imports: [
    GroupParticipationsModule,
    GatheringsComponentModule,
    GatheringParticipationModules,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [GatheringsController],
  providers: [GatheringInvitationAcceptanceUseCase, GatheringsService],
})
export class GatheringsModule {}
