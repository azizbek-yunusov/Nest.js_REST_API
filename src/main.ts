import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const config = new DocumentBuilder()
    .setTitle('NestJS REST API')
    .setDescription('API documentation for the NestJS REST API project')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('Authentication')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
  const blue = '\x1b[34m';
  const reset = '\x1b[0m';
  console.log(`${blue}🚀 Server running on http://localhost:3000${reset}`);
}
bootstrap();
