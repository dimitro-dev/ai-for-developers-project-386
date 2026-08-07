import express from 'express';
import type { Express } from 'express';

import type { Deps } from './http/handlers.ts';
import { handlers } from './http/handlers.ts';
import { errorMiddleware, notFoundHandler } from './http/errors.ts';
import { ROUTES } from './http/routes.ts';

/**
 * Единственное место, где монтируются маршруты, и единственная точка вставки
 * middleware. CORS, helmet и лимит тела запроса — работа `task-infra-003`; их место —
 * начало этой функции, до цикла монтирования (Р8).
 */
export function createApp(deps: Deps): Express {
  const app = express();

  app.use(express.json());

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
