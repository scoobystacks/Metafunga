import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

const commitHash = (() => {
  try { return execSync('git rev-parse --short HEAD').toString().trim(); }
  catch { return 'unknown'; }
})();

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
    __BUILD_HASH__: JSON.stringify(commitHash),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
})
