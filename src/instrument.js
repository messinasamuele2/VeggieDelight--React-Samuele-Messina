import * as Sentry from '@sentry/react'

const sentryDsn = import.meta.env.VITE_SENTRY_DSN

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
  })
}
