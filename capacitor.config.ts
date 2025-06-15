import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ipick.driver.com',
  appName: 'iPick Driver',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000, // 3 seconds
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#999999"
    }
  }
};

export default config;
