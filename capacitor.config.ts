import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ae0d1a377afd4717a989caa75593f819',
  appName: 'scanbusinesscard',
  webDir: 'dist',
  server: {
    url: 'https://ae0d1a37-7afd-4717-a989-caa75593f819.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
