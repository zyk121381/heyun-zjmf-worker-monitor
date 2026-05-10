import { TRANSITION_LABELS } from './constants.js';
import { Notifier } from './notifier.js';
import { createRuntime, advanceState, shouldReboot, applyRebootStart, applyRebootSuccess } from './state-machine.js';
import { localDateParts } from './time.js';
import { ZjmfClient } from './zjmf-client.js';

function transitionLabel(oldState, newState) {
  return TRANSITION_LABELS[`${oldState}:${newState}`] || '';
}

function eventLevel(newState) {
  if (newState === 'down' || newState === 'rebooting') return 'critical';
  if (newState === 'recovering') return 'warning';
  return 'info';
}

async function recordTransition(repo, notifier, server, oldState, nextRuntime, now) {
  if (oldState === nextRuntime.state) return;
  const label = transitionLabel(oldState, nextRuntime.state);
  const level = eventLevel(nextRuntime.state);
  const message = `${server.name}: ${oldState} -> ${nextRuntime.state}${label ? ` (${label})` : ''}`;
  await repo.addEvent({ server_id: server.id, old_state: oldState, new_state: nextRuntime.state, label, level, message, created_at: now });
  await notifier.send(`[${server.name}] ${label || nextRuntime.state}`, message, level);
}

async function checkApiHealth(client, server, runtime, now) {
  const status = await client.getStatus(server.id, now);
  const last_status_value = status == null ? `ERROR: ${client.lastError || 'N/A'}` : String(status);
  if (status == null) return { health: null, runtime: { ...runtime, last_status_value } };
  return { health: String(status).toLowerCase() === 'on', runtime: { ...runtime, last_status_value } };
}

function rebootWindowKey(date, timezone) {
  const parts = localDateParts(date, timezone);
  return `${parts.dateKey}T${String(parts.hour).padStart(2, '0')}`;
}

export async function runMonitorOnce({ repo, fetcher = (input, init) => globalThis.fetch(input, init), now, date = new Date(now * 1000) }) {
  const settings = await repo.getSettings();
  const notifier = new Notifier(settings, fetcher);
  const rebootWindow = rebootWindowKey(date, settings.timezone || 'Asia/Shanghai');
  const servers = await repo.listEnabledServers();
  let checked = 0;

  for (const server of servers) {
    const provider = await repo.getProvider(server.provider);
    if (!provider) continue;
    const client = new ZjmfClient(provider, fetcher, settings.api_timeout);
    const loadedRuntime = (await repo.getRuntime(server.id)) || createRuntime({ now });
    const { health, runtime: withStatus } = await checkApiHealth(client, server, loadedRuntime, now);
    let nextRuntime = health == null ? { ...withStatus, last_check_time: now } : advanceState(withStatus, health, settings, now);
    await recordTransition(repo, notifier, server, loadedRuntime.state, nextRuntime, now);

    if (shouldReboot(nextRuntime, server, settings, now, rebootWindow)) {
      const rebooting = applyRebootStart(nextRuntime, now);
      await recordTransition(repo, notifier, server, nextRuntime.state, rebooting, now);
      const success = await client.hardReboot(server.id, now);
      if (success) {
        const recovering = applyRebootSuccess(rebooting, now, rebootWindow);
        await recordTransition(repo, notifier, server, rebooting.state, recovering, now);
        nextRuntime = recovering;
      } else {
        nextRuntime = { ...rebooting, state: 'down', state_changed_at: now };
      }
    }

    await repo.updateProvider(provider);
    await repo.saveRuntime(server.id, nextRuntime);
    checked += 1;
  }

  return { checked };
}
