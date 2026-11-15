import type { NextConfig } from 'next';
const nextConfig: NextConfig = { serverExternalPackages: ['pdfkit'], outputFileTracingIncludes: { '/api/v1/offers/*/pdf': ['./assets/fonts/**/*'], '/api/v1/offers/*/publications': ['./assets/fonts/**/*'], '/api/v1/work-orders/*/corrections/*/publish': ['./assets/fonts/**/*'], '/api/v1/work-orders/*/handover/publish': ['./assets/fonts/**/*'] }, experimental: { serverActions: { bodySizeLimit: '4mb' } } };
export default nextConfig;
