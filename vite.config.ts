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

/**
 * Server-side Scheme Admin Management Endpoint Middleware
 * Enforces server-side role validation, audit trails, and data integrity
 * so public citizens cannot create or mutate official government scheme records.
 */
function sahayakAdminPlugin(): Plugin {
  return {
    name: 'sahayak-admin-api',
    configureServer(server) {
      server.middlewares.use('/api/admin/action', async (req, res) => {
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
            const { action, payload, actor } = data;
            const {
              isAuthorizedAdmin,
              createScheme,
              updateScheme,
              deactivateScheme,
              reactivateScheme,
              updatePublicationStatus,
            } = await server.ssrLoadModule(
              path.resolve(__dirname, './src/features/admin/adminService.ts')
            );

            // 1. Strict Server-Side Role Enforcement
            if (!isAuthorizedAdmin(actor)) {
              res.statusCode = 403;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error:
                    'FORBIDDEN: Server-side validation rejected request. Only authorized administrators with verified credentials can modify official government welfare scheme records.',
                  status: 403,
                })
              );
              return;
            }

            // 2. Dispatch Authorized Mutation
            let result: any;
            if (action === 'CREATE_SCHEME') {
              result = await createScheme(payload, actor);
            } else if (action === 'UPDATE_SCHEME') {
              result = await updateScheme(payload.id, payload, actor, payload.changeSummary);
            } else if (action === 'UPDATE_STATUS') {
              result = await updatePublicationStatus(
                payload.id,
                payload.status,
                payload.reviewerName,
                actor,
                payload.notes
              );
            } else if (action === 'DEACTIVATE_SCHEME') {
              result = await deactivateScheme(payload.id, payload.reason, actor);
            } else if (action === 'REACTIVATE_SCHEME') {
              result = await reactivateScheme(payload.id, actor);
            } else {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: `Unknown action "${action}"` }));
              return;
            }

            if (result.error) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: result.error.message || String(result.error),
                  validation: result.validation,
                })
              );
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            console.error('Error in /api/admin/action middleware:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: err.message || 'Internal admin server error',
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
    plugins: [react(), sahayakAssistantPlugin(), sahayakAdminPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      open: false,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge'],
            'vendor-data': ['@supabase/supabase-js', 'zod'],
          },
        },
      },
    },
  };
});
