import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { clsOptions } from 'src/configs/cls/cls-options';
import { GroupsReader } from 'src/domain/components/group/groups-reader';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { GroupsComponentModule } from 'src/modules/group/groups-component.module';
import {
  generateGroupEntity,
  generateGroupParticipationEntity,
  generateUserEntity,
} from 'test/helpers/generators';

describe('GroupsReader', () => {
  let groupsReader: GroupsReader;
  let db: PrismaService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        GroupsComponentModule,
        ClsModule.forRoot(clsOptions),
        PrismaModule,
      ],
    }).compile();

    groupsReader = app.get<GroupsReader>(GroupsReader);
    db = app.get<PrismaService>(PrismaService);
    db.onModuleInit();
  });

  afterEach(async () => {
    await db.report.deleteMany();
    await db.groupParticipation.deleteMany();
    await db.group.deleteMany();
    await db.user.deleteMany();
  });

  describe('그룹 목록 조회', () => {
    const me = generateUserEntity('me@test.com', 'mememem');
    const users = Array.from({ length: 5 }, (_, i) =>
      generateUserEntity(`test${i}@test.com`, `test${i}_id`),
    );
    const groups = Array.from({ length: 5 }, (_, i) =>
      generateGroupEntity(users[i].id),
    );
    const myGroupParticipations = Array.from({ length: 5 }, (_, i) =>
      generateGroupParticipationEntity(
        groups[i].id,
        me.id,
        new Date(),
        'ACCEPTED',
      ),
    );

    beforeEach(async () => {
      await db.user.createMany({ data: [me, ...users] });
      await db.group.createMany({ data: groups });
      await db.groupParticipation.createMany({ data: myGroupParticipations });
    });

    it('그룹 목록 조회 정상 동작.', async () => {
      const result = await groupsReader.read(me.id, {
        cursor: new Date(Date.now() + 10000).toISOString(),
        limit: 10,
      });
      const { groups } = result;

      expect(groups.length).toBe(myGroupParticipations.length);
    });

    it('신고 상태인 그룹은 조회되지 않는다.', async () => {
      await db.groupParticipation.update({
        where: { id: myGroupParticipations[0].id },
        data: { status: 'REPORTED' },
      });

      const result = await groupsReader.read(me.id, {
        cursor: new Date(Date.now() + 10000).toISOString(),
        limit: 10,
      });
      const { groups } = result;

      expect(groups.length).toBe(myGroupParticipations.length - 1);
    });
  });
});
