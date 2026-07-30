import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadOpenAPI() {
  const yaml = readFileSync(resolve(__dirname, '../packages/contracts/generated/openapi.yaml'), 'utf-8');
  return parse(yaml);
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
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
for (const [path, methods] of Object.entries(paths)) {
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
function checkOwnerId(schema: any, path: string): boolean {
  if (schema == null || typeof schema !== 'object') return true;
  if (schema.properties && 'ownerId' in schema.properties) {
    console.error(`FAIL: ownerId found in schema at ${path}`);
    return false;
  }
  if (schema.$ref) return true;
  return Object.keys(schema).every(key => {
    if (['required', 'description', 'enum', 'format', 'pattern', 'title', 'type', 'default', 'example', 'deprecated', 'readOnly', 'writeOnly', 'nullable', 'discriminator', 'xml', 'externalDocs'].includes(key)) return true;
    if (typeof schema[key] === 'object' && schema[key] !== null) return checkOwnerId(schema[key], `${path}.${key}`);
    return true;
  });
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
for (const [route, methods] of Object.entries(paths)) {
  for (const [, op] of Object.entries(methods as Record<string, any>)) {
    for (const [status, resp] of Object.entries(op.responses ?? {})) {
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

console.log('\n=== 8. 428 status code not present (onboarding check via 400) ===');
for (const [route, methods] of Object.entries(paths)) {
  for (const [, op] of Object.entries(methods as Record<string, any>)) {
    for (const status of Object.keys(op.responses ?? {})) {
      if (status === '428') {
        console.warn(`WARN: 428 found in ${route} — check if intentional (owner-not-onboarded pattern)`);
      }
    }
  }
}

console.log('\n=== 9. Prohibited: no API surface beyond MVP ===');
const mvpRoutes = ['/health', '/admin/setup', '/admin/settings', '/admin/event-types', '/admin/bookings', '/event-types', '/slots', '/bookings'];
for (const route of Object.keys(paths)) {
  assert(mvpRoutes.includes(route), `Route ${route} is within MVP scope`);
}

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

console.log('\n=== SECURITY: Email validation on GuestDetails.email ===');
const emailProp = schemas['GuestDetails']?.properties?.email;
assert(emailProp != null, 'GuestDetails.email exists');
assert(emailProp.pattern != null, 'GuestDetails.email has pattern');
assert(emailProp.pattern.includes('@'), 'Email pattern contains @');
assert(emailProp.minLength === 1, 'GuestDetails.email minLength=1');
assert(emailProp.maxLength === 320, 'GuestDetails.email maxLength=320');

console.log('\n=== SECURITY: Unbounded arrays (pagination) ===');
for (const [route, methods] of Object.entries(paths)) {
  for (const [, op] of Object.entries(methods as Record<string, any>)) {
    const responses = op.responses ?? {};
    for (const [status, resp] of Object.entries(responses)) {
      const schema = resp.content?.['application/json']?.schema;
      if (schema?.type === 'array') {
        console.warn(`WARN: ${route} ${op.operationId} returns unbounded array (no pagination) — MVP scope`);
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

console.log('\n✅ All contract validation checks passed');
