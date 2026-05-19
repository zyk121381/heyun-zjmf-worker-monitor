import { runMonitorOnce } from './monitor.js';
import { KVRepository } from './kv-repository.js';
import { handleRequest } from './routes.js';

function resolveKv(env = {}) {
  return env.ZJMF_KV || env.KV || env.EDGEONE_KV
    || globalThis.ZJMF_KV || globalThis.KV || globalThis.EDGEONE_KV;
}

export function edgeOneTcpConnector(host, port) {
  void host;
  void port;
  return Promise.reject(new Error('EdgeOne Pages 暂不支持 TCP 原生端口探测，请改用 HTTP(S) 或 API 检测'));
}

function buildEnv(env = {}) {
  const repo = new KVRepository(resolveKv(env));
  return {
    ...env,
    __repo: repo,
    tcpConnector: edgeOneTcpConnector,
    fetcher: env.fetcher || ((input, init) => fetch(input, init)),
  };
}

export async function handleEdgeOneRequest(request, env = {}) {
  return handleRequest(request, buildEnv(env));
}

export async function runEdgeOneMonitor(env = {}) {
  const edgeEnv = buildEnv(env);
  const now = Math.floor(Date.now() / 1000);
  return runMonitorOnce({
    repo: edgeEnv.__repo,
    fetcher: edgeEnv.fetcher,
    tcpConnector: edgeOneTcpConnector,
    now,
    force: true,
  });
}
