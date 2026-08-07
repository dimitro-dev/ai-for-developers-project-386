import express from 'express';
import type { Express } from 'express';

import type { Deps } from './http/handlers.ts';
import { handlers } from './http/handlers.ts';
import { errorMiddleware, notFoundHandler } from './http/errors.ts';
import { ROUTES } from './http/routes.ts';
import { BODY_LIMIT_BYTES, cors, securityHeaders } from './http/security.ts';

/**
 * Единственное место, где монтируются маршруты, и единственная точка вставки
 * middleware (Р8 back-001). Порядок цепочки значим: security-заголовки и CORS стоят до
 * парсера тела, иначе ответ `413` уйдёт без `Access-Control-Allow-Origin` и браузер не
 * даст клиенту прочитать даже код ошибки (task-infra-003, Р2).
 */
export function createApp(deps: Deps): Express {
  const app = express();

  app.use(securityHeaders);
  app.use(cors);
  app.use(express.json({ limit: BODY_LIMIT_BYTES }));

  for (const route of ROUTES) {
    const handler = handlers[route.operationId](deps);
    // switch, а не app[route.method]: у Express `get` перегружен чтением настроек,
    // и индексация union-типом методов не типизируется.
    switch (route.method) {
      case 'get':
        app.get(route.path, handler);
        break;
      case 'put':
        app.put(route.path, handler);
        break;
      case 'post':
        app.post(route.path, handler);
        break;
    }
  }

  app.use(notFoundHandler);
  app.use(errorMiddleware);

  return app;
}
