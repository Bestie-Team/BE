import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { setupSwagger } from 'src/configs/swagger/setup-swagger';
import { winstonLogger } from 'src/configs/winston/winston-options';

import './configs/sentry/instrument';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });
  app.use(cookieParser());
  app.enableCors({
    origin: true,
    credentials: true,
  });
  setupSwagger(app);
  await app.listen(8080);
}
bootstrap();
