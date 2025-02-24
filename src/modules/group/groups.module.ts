import { Module } from '@nestjs/common';
import { GroupCreationUseCase } from 'src/application/use-cases/group/group-creation.use-case';
import { GroupParticipationsRepository } from 'src/domain/interface/group/group-participations.repository';
import { GroupsRepository } from 'src/domain/interface/group/groups.repository';
import { GroupsWriter } from 'src/domain/components/group/groups-writer';
import { GroupsReader } from 'src/domain/components/group/groups-reader';
import { GroupParticipationsPrismaRepository } from 'src/infrastructure/repositories/group/group-participations-prisma.repository';
import { GroupsPrismaRepository } from 'src/infrastructure/repositories/group/groups-prisma.repository';
import { NotificationsModule } from 'src/modules/notification/notifications.module';
import { UsersModule } from 'src/modules/user/users.module';
import { GroupsController } from 'src/presentation/controllers/group/groups.controller';
import { FriendsCheckerModule } from 'src/modules/friend/friends-chcker.module';
import { GroupsService } from 'src/domain/services/groups/groups.service';
import { GroupParticipationsWriter } from 'src/domain/components/group/group-participations-writer';
import { GroupParticipationsReader } from 'src/domain/components/group/group-participations-reader';

@Module({
  imports: [UsersModule, NotificationsModule, FriendsCheckerModule],
  controllers: [GroupsController],
  providers: [
    GroupCreationUseCase,
    GroupsWriter,
    GroupsReader,
    GroupsService,
    GroupParticipationsWriter,
    GroupParticipationsReader,
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
