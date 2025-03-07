import * as Sentry from '@sentry/nestjs';

if (process.env.NODE_ENV !== 'test') {
  Sentry.init({
    dsn: process.env.DSN,
    tracesSampleRate: 1.0,
  });
}
