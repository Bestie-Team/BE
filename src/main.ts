import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from 'src/configs/swagger/setup-swagger';
import { winstonLogger } from 'src/configs/winston/winston-options';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });
  app.enableCors();
  setupSwagger(app);
  await app.listen(8080);
}
bootstrap();
