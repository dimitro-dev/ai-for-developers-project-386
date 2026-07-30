# MiniCal API Server

Серверная часть MiniCal. На данный момент здесь только smoke-сервер (`GET /health`, порт 3001);
ответ соответствует контрактной модели `HealthResponse` из `packages/contracts`.

Прикладной backend появится в отдельной задаче.
Подробности реализации — в [`backend-agent.md`](.opencode/agents/backend-agent.md) (файл доступен только локально, не хранится в git).
