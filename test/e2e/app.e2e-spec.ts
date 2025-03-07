import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from 'src/app.module';
import { ListenersModule } from 'src/infrastructure/event/listeners/listeners.module';
import { EmptyModule } from 'test/helpers/empty.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(ListenersModule)
      .useModule(EmptyModule)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(() => {
    app.close();
  });

  it('헬스 체크', async () => {
    const response = await request(app.getHttpServer()).get('/health');
    const { status, text } = response;

    expect(status).toEqual(200);
    expect(text).toEqual('Running Server');
  });
});
