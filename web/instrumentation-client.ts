import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  ui_host: 'us.posthog.com',
  capture_pageleave: true,
  capture_pageview: false,
});
