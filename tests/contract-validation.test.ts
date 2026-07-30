import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadOpenAPI() {
  const yaml = readFileSync(resolve(__dirname, '../packages/contracts/generated/openapi.yaml'), 'utf-8');
  return parse(yaml);
}

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failures.push(message);
    return;
  }
  console.log(`PASS: ${message}`);
}

const spec = loadOpenAPI();
const paths = spec.paths as Record<string, any>;
const schemas = spec.components?.schemas ?? {};
const expectedRoutes = [
  '/health',
  '/admin/setup',
  '/admin/settings',
  '/admin/event-types',
  '/admin/bookings',
  '/event-types',
  '/slots',
  '/bookings',
];

const expectedOperations = [
  'getHealth',
  'getAdminSetup',
  'completeAdminSetup',
  'getAdminSettings',
  'updateAdminSettings',
  'getAdminEventTypes',
  'createAdminEventType',
  'getAdminUpcomingBookings',
  'getPublicEventTypes',
  'getPublicSlots',
  'createPublicBooking',
];

console.log('\n=== 1. Route coverage ===');
for (const route of expectedRoutes) {
  assert(route in paths, `Route ${route} exists`);
}
const actualCount = Object.keys(paths).length;
assert(actualCount === expectedRoutes.length, `Route count: ${actualCount} === ${expectedRoutes.length}`);

console.log('\n=== 2. Operation IDs ===');
const actualOps = new Set<string>();
for (const [, methods] of Object.entries(paths)) {
  for (const [, op] of Object.entries(methods as Record<string, any>)) {
    if (op.operationId) actualOps.add(op.operationId);
  }
}
for (const opId of expectedOperations) {
  assert(actualOps.has(opId), `Operation ${opId} exists`);
}
assert(actualOps.size === expectedOperations.length, `Operation count: ${actualOps.size} === ${expectedOperations.length}`);

console.log('\n=== 3. Prohibited fields in CreateBookingRequest ===');
const createBookingReq = schemas['CreateBookingRequest'];
assert(createBookingReq != null, 'CreateBookingRequest schema exists');
const reqProps = Object.keys(createBookingReq.properties ?? {});
assert(!reqProps.includes('endAtUtc'), 'endAtUtc NOT in CreateBookingRequest');
assert(!reqProps.includes('endAt'), 'endAt NOT in CreateBookingRequest');
assert(!(createBookingReq.required ?? []).includes('endAtUtc'), 'endAtUtc not required in request');

console.log('\n=== 4. Prohibited: no auth/security scheme ===');
assert(spec.components?.securitySchemes == null, 'No security schemes defined');
assert(spec.security == null, 'No top-level security');

console.log('\n=== 5. ownerId absent in all request bodies ===');
// Request bodies are emitted as `{ $ref: '#/components/schemas/Name' }`. To actually verify
// anything, $refs must be resolved against components.schemas and walked recursively —
// including into nested properties, array items, and allOf/anyOf/oneOf branches — while
// guarding against cyclic schema references via the `seen` set of already-visited schema names.
function checkOwnerId(schema: any, path: string, seen: Set<string> = new Set()): boolean {
  if (schema == null || typeof schema !== 'object') return true;

  if (schema.$ref) {
    const refName = schema.$ref.replace(/^#\/components\/schemas\//, '');
    if (seen.has(refName)) return true; // cyclic reference already checked on this path
    const target = schemas[refName];
    if (target == null) return true;
    return checkOwnerId(target, `${path} -> ${refName}`, new Set(seen).add(refName));
  }

  let ok = true;

  if (schema.properties && 'ownerId' in schema.properties) {
    console.error(`FAIL: ownerId found in schema at ${path}`);
    ok = false;
  }

  if (schema.properties) {
    for (const [key, value] of Object.entries(schema.properties)) {
      if (!checkOwnerId(value, `${path}.properties.${key}`, seen)) ok = false;
    }
  }

  if (schema.items) {
    if (!checkOwnerId(schema.items, `${path}.items`, seen)) ok = false;
  }

  for (const combinator of ['allOf', 'anyOf', 'oneOf'] as const) {
    const list = schema[combinator];
    if (Array.isArray(list)) {
      list.forEach((sub: any, i: number) => {
        if (!checkOwnerId(sub, `${path}.${combinator}[${i}]`, seen)) ok = false;
      });
    }
  }

  return ok;
}
for (const [route, methods] of Object.entries(paths)) {
  for (const [, op] of Object.entries(methods as Record<string, any>)) {
    if (op.requestBody?.content?.['application/json']?.schema) {
      const ok = checkOwnerId(op.requestBody.content['application/json'].schema, `${route} requestBody`);
      assert(ok, `ownerId absent in request body of ${route}`);
    }
  }
}

console.log('\n=== 6. Error codes present in responses ===');
const expectedErrorCodes = [
  'VALIDATION_ERROR',
  'CALENDAR_NOT_CONFIGURED',
  'ONBOARDING_ALREADY_COMPLETED',
  'EVENT_TYPE_NOT_FOUND',
  'DUPLICATE_EVENT_TYPE_ID',
  'SLOT_UNAVAILABLE',
  'SLOT_OUTSIDE_WINDOW',
  'SLOT_NOT_ALIGNED',
  'DUPLICATE_BOOKING_ID',
  'GUEST_NAME_REQUIRED',
  'GUEST_EMAIL_REQUIRED',
];
const foundInResponses = new Set<string>();
for (const [, methods] of Object.entries(paths)) {
  for (const [, op] of Object.entries(methods as Record<string, any>)) {
    for (const [, resp] of Object.entries(op.responses ?? {}) as [string, any][]) {
      const schema = resp.content?.['application/json']?.schema;
      if (!schema) continue;
      const refs: string[] = [];
      if (schema.$ref) refs.push(schema.$ref.split('/').pop()!);
      if (schema.anyOf) {
        for (const item of schema.anyOf) {
          if (item.$ref) refs.push(item.$ref.split('/').pop()!);
        }
      }
      for (const ref of refs) {
        const model = schemas[ref];
        if (model?.properties?.code?.enum) {
          for (const code of model.properties.code.enum) {
            foundInResponses.add(code);
          }
        }
      }
    }
  }
}
for (const code of expectedErrorCodes) {
  assert(foundInResponses.has(code), `Error code ${code} referenced in responses`);
}

console.log('\n=== 7. No arbitrary from/to query params ===');
for (const [route, methods] of Object.entries(paths)) {
  for (const [, op] of Object.entries(methods as Record<string, any>)) {
    const params = op.parameters ?? [];
    for (const p of params) {
      const name = p.name ?? '';
      assert(!['from', 'to', 'fromUtc', 'toUtc', 'startDate', 'endDate'].includes(name),
        `No arbitrary date range param '${name}' in ${route}`);
    }
  }
}

console.log('\n=== 8. No 428 status codes (onboarding check uses 400 CALENDAR_NOT_CONFIGURED) ===');
for (const [route, methods] of Object.entries(paths)) {
  for (const [, op] of Object.entries(methods as Record<string, any>)) {
    const statuses = Object.keys(op.responses ?? {});
    assert(!statuses.includes('428'),
      `${route} ${op.operationId} does not use 428 — the contract intentionally signals ` +
      `owner-not-onboarded via 400 CALENDAR_NOT_CONFIGURED instead of 428 Precondition Required`);
  }
}

console.log('\n=== 9. Prohibited: no API surface beyond MVP ===');
for (const route of Object.keys(paths)) {
  assert(expectedRoutes.includes(route), `Route ${route} is within MVP scope`);
}

console.log('\n=== 10. Field constraints added in contract hardening ===');
for (const modelName of ['EventType', 'CreateEventTypeRequest']) {
  const durationProp = schemas[modelName]?.properties?.durationMinutes;
  assert(durationProp?.minimum === 1, `${modelName}.durationMinutes minimum === 1`);
  assert(durationProp?.maximum === 1440, `${modelName}.durationMinutes maximum === 1440`);
}

for (const modelName of ['CalendarSettings', 'SetupRequest', 'CalendarSettingsResponse']) {
  const model = schemas[modelName];
  const slotIntervalProp = model?.properties?.slotIntervalMinutes;
  assert(slotIntervalProp?.minimum === 15, `${modelName}.slotIntervalMinutes minimum === 15`);
  assert(slotIntervalProp?.maximum === 60, `${modelName}.slotIntervalMinutes maximum === 60`);

  const availabilityRulesProp = model?.properties?.availabilityRules;
  assert(availabilityRulesProp?.minItems === 1, `${modelName}.availabilityRules minItems === 1`);
}

const eventTypeIdParam = (paths['/slots']?.get?.parameters ?? []).find((p: any) => p.name === 'eventTypeId');
assert(eventTypeIdParam?.schema?.maxLength === 100, `getPublicSlots query param eventTypeId has schema.maxLength === 100`);

assert(schemas['ErrorResponse']?.properties?.code?.maxLength === 100, 'ErrorResponse.code has maxLength === 100');

assert(spec.info?.version !== '0.0.0', `info.version is not the placeholder '0.0.0' (got ${spec.info?.version})`);

console.log('\n=== SECURITY: String length constraints on user-input fields ===');
const userInputFields: Record<string, string[]> = {
  'GuestDetails': ['name', 'email', 'note'],
  'SetupRequest': ['displayName'],
  'CreateEventTypeRequest': ['id', 'name', 'description'],
  'CreateBookingRequest': ['eventTypeId'],
};
for (const [modelName, fields] of Object.entries(userInputFields)) {
  const model = schemas[modelName];
  if (!model) { console.warn(`WARN: Model ${modelName} not found`); continue; }
  for (const f of fields) {
    const prop = model.properties?.[f];
    if (!prop) { console.warn(`WARN: ${modelName}.${f} not found`); continue; }
    if (prop.type === 'string') {
      const hasMax = prop.maxLength != null;
      assert(hasMax, `${modelName}.${f} has maxLength`);
    }
  }
}
for (const [route, methods] of Object.entries(paths)) {
  for (const [, op] of Object.entries(methods as Record<string, any>)) {
    const params = op.parameters ?? [];
    for (const p of params) {
      if (p.in === 'query' && p.schema?.type === 'string') {
        assert(p.schema.maxLength != null, `Query param '${p.name}' in ${route} (${op.operationId}) has maxLength`);
      }
    }
  }
}

console.log('\n=== SECURITY: Email validation on GuestDetails.email ===');
const emailProp = schemas['GuestDetails']?.properties?.email;
assert(emailProp != null, 'GuestDetails.email exists');
assert(emailProp.pattern != null, 'GuestDetails.email has pattern');
assert(emailProp.pattern.includes('@'), 'Email pattern contains @');
assert(emailProp.minLength === 1, 'GuestDetails.email minLength=1');
assert(emailProp.maxLength === 320, 'GuestDetails.email maxLength=320');

console.log('\n=== INFO: Unbounded arrays (pagination) ===');
for (const [route, methods] of Object.entries(paths)) {
  for (const [, op] of Object.entries(methods as Record<string, any>)) {
    const responses = op.responses ?? {};
    for (const [, resp] of Object.entries(responses) as [string, any][]) {
      const schema = resp.content?.['application/json']?.schema;
      if (schema?.type === 'array') {
        console.log(`INFO: ${route} ${op.operationId} returns an unbounded array (no pagination) — accepted MVP limitation, not a check`);
      }
    }
  }
}

console.log('\n=== SECURITY: Error response message field presence ===');
for (const [name, schema] of Object.entries(schemas) as [string, any][]) {
  if (schema.allOf?.some((r: any) => r.$ref?.endsWith('/ErrorResponse'))) {
    assert(schema.properties?.code != null, `Error model ${name} has code field`);
    assert(schema.required?.includes('code') ?? false, `Error model ${name} requires code`);
  }
}

console.log('\n=== SECURITY: No PII in URL paths ===');
for (const route of Object.keys(paths)) {
  assert(!route.includes('{email}'), `No email in path: ${route}`);
  assert(!route.includes('{name}'), `No name in path: ${route}`);
  assert(!route.includes('{guest'), `No guest data in path: ${route}`);
}

console.log('\n=== SECURITY: Health endpoint minimal disclosure ===');
const healthResp = paths['/health']?.get?.responses?.['200']?.content?.['application/json']?.schema;
if (healthResp?.$ref) {
  const healthModel = schemas[healthResp.$ref.split('/').pop()!];
  if (healthModel?.properties?.status?.enum) {
    assert(healthModel.properties.status.enum.length === 1 &&
           healthModel.properties.status.enum[0] === 'ok',
           'Health response only returns {"status":"ok"}');
  }
}

if (failures.length > 0) {
  console.error(`\n❌ ${failures.length} contract validation check(s) failed:`);
  for (const message of failures) {
    console.error(`  - ${message}`);
  }
  process.exit(1);
}

console.log('\n✅ All contract validation checks passed');
