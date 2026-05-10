import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { platform } from 'node:os';

const workerName = process.env.WORKER_NAME || 'zjmf-monitor';
const databaseName = process.env.D1_DATABASE_NAME || `${workerName}-d1`;
const npx = platform() === 'win32' ? 'npx.cmd' : 'npx';

function runWrangler(args) {
  return execFileSync(npx, ['wrangler@latest', ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function parseD1ListJson(output) {
  try {
    const parsed = JSON.parse(output);
    const list = Array.isArray(parsed) ? parsed : parsed.result || [];
    return list.find((db) => db.name === databaseName)?.uuid || '';
  } catch {
    return '';
  }
}

function parseD1ListTable(output) {
  const line = output.split(/\r?\n/).find((row) => row.includes(databaseName));
  return line?.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0] || '';
}

function findDatabaseId() {
  try {
    return parseD1ListJson(runWrangler(['d1', 'list', '--json']));
  } catch {
    return parseD1ListTable(runWrangler(['d1', 'list']));
  }
}

function createDatabase() {
  const output = runWrangler(['d1', 'create', databaseName]);
  const fromToml = output.match(/database_id\s*=\s*"([^"]+)"/)?.[1];
  const fromUuid = output.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0];
  return fromToml || fromUuid || '';
}

function patchWranglerToml(databaseId) {
  const path = 'wrangler.toml';
  let toml = readFileSync(path, 'utf8');
  toml = toml.replace(/^name = ".*"$/m, `name = "${workerName}"`);
  toml = toml.replace(/^database_name = ".*"$/m, `database_name = "${databaseName}"`);
  toml = toml.replace(/^database_id = ".*"$/m, `database_id = "${databaseId}"`);
  writeFileSync(path, toml);
}

let databaseId = findDatabaseId();
if (!databaseId) databaseId = createDatabase();
if (!databaseId) throw new Error(`Cannot resolve D1 database id for ${databaseName}`);

patchWranglerToml(databaseId);
console.log(`Worker name: ${workerName}`);
console.log(`D1 database: ${databaseName}`);
console.log(`D1 database id: ${databaseId}`);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `worker_name=${workerName}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `database_name=${databaseName}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `database_id=${databaseId}\n`);
}
