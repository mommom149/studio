import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.NewBridge',
  appName: 'New Bridge',
  webDir: 'public',
  server: {
    url: 'https://New-Bridge.com',
    cleartext: true
  }
};

export default config;
