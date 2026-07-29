import "@typespec/http";

using Http;

/**
 * Smoke-контракт для проверки generation pipeline (task-000).
 * Не содержит доменной спецификации MiniCal: продуктовый API описывает task-002.
 */
@service(#{ title: "MiniCal Smoke API" })
namespace MiniCalSmoke;

/** Ответ health-проверки smoke-сервера. */
model HealthResponse {
  status: "ok";
  uptimeSeconds: float64;
}

@route("/health")
@get
op getHealth(): HealthResponse;
