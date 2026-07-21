import type { CapacitorConfig } from '@capacitor/cli';

// No `server` block on purpose: the app loads the assets bundled from webDir
// ('dist') on the device. A `server.url` here would make the native app fetch
// its web content from a remote origin at runtime — that used to point at
// Lovable, which would have broken the app once Lovable was cancelled.
// Add `server.url` only as a temporary live-reload convenience during local
// development, and never commit it.
const config: CapacitorConfig = {
  appId: 'app.scanbusinesscard.com',
  appName: 'ScanBusinessCard',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
  },
};

export default config;
