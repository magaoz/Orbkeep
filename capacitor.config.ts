import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.orbkeep.game',
  appName: 'Orbkeep',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Preferences: {},
  },
}

export default config
