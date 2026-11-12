import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Server-side AI Assistant Endpoint Middleware
 * Securely processes RAG pipeline and calls server-side LLM provider without exposing API keys to client bundle.
 */
function sahayakAssistantPlugin(): Plugin {
  return {
    name: 'sahayak-assistant-api',
    configureServer(server) {
      server.middlewares.use('/api/assistant/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const { processAssistantQuery } = await server.ssrLoadModule(
              path.resolve(__dirname, './src/features/assistant/assistantService.ts')
            );
            const result = await processAssistantQuery(
              data.message,
              data.conversationHistory,
              data.requestedProviderId
            );

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            console.error('Error in /api/assistant/chat middleware:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: err.message || 'Internal assistant server error',
              })
            );
          }
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Populate process.env so server-side middleware and SSR modules can access server-only keys securely
  Object.assign(process.env, env);

  return {
    plugins: [react(), sahayakAssistantPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      open: false,
    },
  };
});
