import { Module } from '@nestjs/common';
import { GroupCreationUseCase } from 'src/application/use-cases/group/group-creation.use-case';
import { NotificationsModule } from 'src/modules/notification/notifications.module';
import { UsersModule } from 'src/modules/user/users.module';
import { GroupsController } from 'src/presentation/controllers/group/groups.controller';
import { FriendsCheckerModule } from 'src/modules/friend/friends-chcker.module';
import { GroupsService } from 'src/domain/services/groups/groups.service';
import { GroupsComponentModule } from 'src/modules/group/groups-component.module';
import { GroupParticipationsModule } from 'src/modules/group/group-participations.module';

@Module({
  imports: [
    GroupsComponentModule,
    GroupParticipationsModule,
    UsersModule,
    NotificationsModule,
    FriendsCheckerModule,
  ],
  controllers: [GroupsController],
  providers: [GroupCreationUseCase, GroupsService],
})
export class GroupsModule {}
