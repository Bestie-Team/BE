import { Module } from '@nestjs/common';
import { GroupCreationUseCase } from 'src/application/use-cases/group/group-creation.use-case';
import { NotificationsModule } from 'src/modules/notification/notifications.module';
import { GroupsController } from 'src/presentation/controllers/group/groups.controller';
import { FriendsCheckerModule } from 'src/modules/friend/friends-chcker.module';
import { GroupsService } from 'src/domain/services/groups/groups.service';
import { GroupsComponentModule } from 'src/modules/group/groups-component.module';
import { GroupParticipationsModule } from 'src/modules/group/group-participations.module';
import { UsersComponentModule } from 'src/modules/user/usesr.component.module';
import { S3Module } from 'src/infrastructure/aws/s3/s3.module';

@Module({
  imports: [
    S3Module,
    GroupsComponentModule,
    GroupParticipationsModule,
    UsersComponentModule,
    NotificationsModule,
    FriendsCheckerModule,
  ],
  controllers: [GroupsController],
  providers: [GroupCreationUseCase, GroupsService],
})
export class GroupsModule {}
