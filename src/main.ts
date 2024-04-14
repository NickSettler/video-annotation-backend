import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import * as pkg from '../package.json';

async function bootstrap() {
  config();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  app.use(helmet());

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.enableCors({
    origin: '*',
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },
    }),
  );

  const expressApp = app.getHttpAdapter().getInstance();

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: `${pkg.version}`,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: expressApp }),
      new ProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });

  app.use(Sentry.Handlers.requestHandler());

  app.use(Sentry.Handlers.tracingHandler());

  await app.listen(3000);

  app.use(Sentry.Handlers.errorHandler());
}

bootstrap();
