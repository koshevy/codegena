import * as session from 'express-session';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(session({
      resave: true,
      saveUninitialized: true,
      secret: 'S2D0MK1DV',
      cookie: {
          credentials: true,
          secure: false,
          maxAge: 600000,
      },
  }));
  app.enableCors({
      credentials: true,
      maxAge: 600000,
      methods: ['DELETE', 'GET', 'PATCH', 'POST', 'PUT', 'OPTIONS'].join(','),
      origin: [
          'http://localhost:4200'
      ].join(','),
      preflightContinue: false,
      optionsSuccessStatus: 200
  });
  await app.listen(3000);
}
bootstrap();
