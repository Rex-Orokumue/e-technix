import type { NextConfig } from "next";
// @ts-ignore — next-pwa ships CJS without types
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: { document: '/hub/login' },
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
