import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ocworldbuilder.app',
  appName: 'OC World Builder',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
