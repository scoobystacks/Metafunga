import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Bump this manually with each release:
//   patch (x.x.1): bug fixes, minor tweaks
//   minor (x.1.0): new features, dataset additions
//   major (2.0.0): major redesigns or architecture changes
const APP_VERSION = "2.2";

const buildDate = new Date().toLocaleString('en-US', {
  timeZone: 'America/New_York',
  month: 'short', day: 'numeric', year: 'numeric',
  hour: 'numeric', minute: '2-digit',
  timeZoneName: 'short',
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/Metafunga/",
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
})
