import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Create a process.env object with REACT_APP_ variables and NODE_ENV
  const processEnv: Record<string, string> = {};
  Object.keys(env).forEach(key => {
    if (key.startsWith('REACT_APP_') || key === 'NODE_ENV') {
      processEnv[key] = env[key];
    }
  });
  
  // Define PUBLIC_URL for compatibility
  processEnv['PUBLIC_URL'] = env['PUBLIC_URL'] || '';

  return {
    define: {
      'process.env': processEnv,
    },
    plugins: [react(), tsconfigPaths()],
    server: {
      open: true,
      port: 3000,
    },
    build: {
      outDir: 'build',
    },
  };
});
