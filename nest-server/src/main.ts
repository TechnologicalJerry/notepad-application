import { NestFactory } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  Logger,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  app.setGlobalPrefix('api', {
    exclude: [{ path: 'healthcheck', method: RequestMethod.GET }],
  });
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Notepad API')
    .setDescription('Production-ready NestJS API for users, sessions, and todos')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  Logger.log(`Server running on port ${port}`, 'Bootstrap');
}
bootstrap();
