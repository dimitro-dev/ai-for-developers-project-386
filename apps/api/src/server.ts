import { createServer } from 'node:http';

// Сервер реализует только GET /health из общего контракта MiniCal
// (packages/contracts/src/operations/health.tsp). Прикладной backend
// (Event Type, Slot, Booking) будет реализован отдельной задачей и обязан
// валидировать transport input generated-схемами из @minical/backend-contract.

interface HealthResponse {
  status: 'ok';
}

const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    const body: HealthResponse = {
      status: 'ok',
    };
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
    return;
  }

  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ code: 'NOT_FOUND', message: 'Route not found' }));
});

const port = Number(process.env.PORT ?? 3001);
server.listen(port, () => {
  console.log(`MiniCal smoke API: http://localhost:${port}/health`);
});
