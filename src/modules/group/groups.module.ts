import { Module } from '@nestjs/common';
import { GroupCreationUseCase } from 'src/application/use-cases/group/group-creation.use-case';
import { GroupParticipationsRepository } from 'src/domain/interface/group/group-participations.repository';
import { GroupsRepository } from 'src/domain/interface/group/groups.repository';
import { GroupsWriter } from 'src/domain/services/group/groups-writer';
import { GroupsReader } from 'src/domain/services/group/groups-reader';
import { GroupParticipationsPrismaRepository } from 'src/infrastructure/repositories/group/group-participations-prisma.repository';
import { GroupsPrismaRepository } from 'src/infrastructure/repositories/group/groups-prisma.repository';
import { FriendsModule } from 'src/modules/friend/friends.module';
import { NotificationsModule } from 'src/modules/notification/notifications.module';
import { UsersModule } from 'src/modules/user/users.module';
import { GroupsController } from 'src/presentation/controllers/group/groups.controller';

@Module({
  imports: [FriendsModule, UsersModule, NotificationsModule],
  controllers: [GroupsController],
  providers: [
    GroupCreationUseCase,
    GroupsWriter,
    GroupsReader,
    { provide: GroupsRepository, useClass: GroupsPrismaRepository },
    {
      provide: GroupParticipationsRepository,
      useClass: GroupParticipationsPrismaRepository,
    },
  ],
  exports: [
    GroupsReader,
    { provide: GroupsRepository, useClass: GroupsPrismaRepository },
    {
      provide: GroupParticipationsRepository,
      useClass: GroupParticipationsPrismaRepository,
    },
  ],
})
export class GroupsModule {}
