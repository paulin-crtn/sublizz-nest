import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONT_DOMAIN,
    credentials: true,
  });

  // Documentation
  const config = new DocumentBuilder()
    .setTitle('Sublizz')
    .setDescription('The Sublizz API documentation')
    .addBearerAuth({
      type: 'http',
      name: 'access_token',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .addCookieAuth('refresh_token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
