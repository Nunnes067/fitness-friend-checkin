
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.71f1e5debd7c48e89efacc5be3ca864c',
  appName: 'CheckMate Fitness',
  webDir: 'dist',
  server: {
    url: 'https://71f1e5de-bd7c-48e8-9efa-cc5be3ca864c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#f8fafc",
      showSpinner: true,
      spinnerColor: "#6366f1",
      androidSplashResourceName: "splash"
    }
  }
};

export default config;
