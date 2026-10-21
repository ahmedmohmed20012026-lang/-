import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bakery.manager',
  appName: 'إدارة المخبز',
  webDir: 'dist',
  android: { allowMixedContent: false },
};

export default config;
