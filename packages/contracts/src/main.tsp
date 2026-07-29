import "@typespec/http";
import "./models/common.tsp";
import "./models/errors.tsp";
import "./models/owner.tsp";
import "./models/event-type.tsp";
import "./models/booking.tsp";
import "./operations/health.tsp";
import "./operations/admin.tsp";
import "./operations/public.tsp";

using Http;

@service(#{ title: "MiniCal API" })
namespace MiniCal;
