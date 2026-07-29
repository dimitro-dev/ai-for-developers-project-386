import { createServer } from 'node:http';

// Smoke-сервер task-000: единственный endpoint /health по smoke-контракту
// packages/contracts/src/main.tsp. Прикладной backend будет реализован отдельной
// задачей и обязан валидировать transport input generated-схемами
// из @minical/backend-contract.

interface HealthResponse {
  status: 'ok';
  uptimeSeconds: number;
}

const startedAt = Date.now();

const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    const body: HealthResponse = {
      status: 'ok',
      uptimeSeconds: (Date.now() - startedAt) / 1000,
    };
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
    return;
  }

  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error: 'not_found' }));
});

const port = Number(process.env.PORT ?? 3001);
server.listen(port, () => {
  console.log(`MiniCal smoke API: http://localhost:${port}/health`);
});
