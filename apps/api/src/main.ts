import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Cookie parser
  app.use(cookieParser(configService.get('COOKIE_SECRET')));

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:4000').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('The Swagger API')
    .setDescription(
      'Project management platform for design & construction teams.\n\n' +
        '> Auth uses HTTP-only cookies. Click **Authorize** and enter your JWT if testing manually.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('auth', 'Authentication & session management')
    .addTag('users', 'User management')
    .addTag('projects', 'Project CRUD & overview')
    .addTag('milestones', 'Project milestones')
    .addTag('tasks', 'Task management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'The Swagger – API Docs',
  });

  const port = configService.get<number>('PORT', 4200);
  await app.listen(port);

  console.log(`\n🚀 API running on: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger docs:   http://localhost:${port}/api/docs\n`);
}

bootstrap();
