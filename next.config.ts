import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs/config';
const nextConfig: NextConfig = { serverExternalPackages: ['pdfkit'], outputFileTracingIncludes: { '/api/v1/offers/*/pdf': ['./assets/fonts/**/*'], '/api/v1/offers/*/publications': ['./assets/fonts/**/*'], '/api/v1/work-orders/*/corrections/*/publish': ['./assets/fonts/**/*'], '/api/v1/work-orders/*/handover/publish': ['./assets/fonts/**/*'] }, experimental: { serverActions: { bodySizeLimit: '4mb' } } };
// Sentry (KRA-73 M0.7): mapy źródeł wysyłane tylko przy SENTRY_AUTH_TOKEN (sekret hostingu); bez niego build działa jak dotąd.
export default withSentryConfig(nextConfig, {
  org: 'avero-bg',
  project: 'avero',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  telemetry: false,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN, deleteSourcemapsAfterUpload: true },
});
