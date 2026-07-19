import { VERSION, COMMIT, BUILD_TIME } from './version.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function fmtTime(seconds) {
  if (!seconds) return '从未';
  return new Date(seconds * 1000).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
}

function fmtDate(seconds) {
  if (!seconds) return '从未';
  return new Date(seconds * 1000).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
}

function stateLabel(state) {
  const labels = {
    healthy: '运行正常',
    suspect: '疑似异常',
    down: '确认宕机',
    rebooting: '正在重启',
    recovering: '恢复中',
  };
  return labels[state] || '未知';
}

function svgIcon(type) {
  const icons = {
    ok: '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#10c98f" stroke-width="2"/><path d="M6 10l3 3 5-5" stroke="#10c98f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    warn: '<svg viewBox="0 0 20 20" fill="none"><path d="M10 2L1 18h18L10 2z" stroke="#d4a853" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="10" y1="8" x2="10" y2="12" stroke="#d4a853" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="15" r="1" fill="#d4a853"/></svg>',
    bad: '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#c45c4a" stroke-width="2"/><path d="M7 7l6 6M13 7l-6 6" stroke="#c45c4a" stroke-width="2" stroke-linecap="round"/></svg>',
    spin: '<svg viewBox="0 0 20 20" fill="none"><path d="M10 2v4M10 14v4M2 10h4M14 10h4" stroke="#c45c4a" stroke-width="2" stroke-linecap="round"/><path d="M4.93 4.93l2.83 2.83M12.24 12.24l2.83 2.83M4.93 15.07l2.83-2.83M12.24 7.76l2.83-2.83" stroke="#c45c4a" stroke-width="1.5" stroke-linecap="round"/></svg>',
    pulse: '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#10c98f" stroke-width="2" stroke-dasharray="4 3"/></svg>',
    healthy: '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#10c98f" stroke-width="2"/><path d="M6 10l3 3 5-5" stroke="#10c98f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    suspect: '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#d4a853" stroke-width="2"/><path d="M10 6v5" stroke="#d4a853" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="14" r="1" fill="#d4a853"/></svg>',
    down: '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#c45c4a" stroke-width="2"/><path d="M10 6v5" stroke="#c45c4a" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="14" r="1" fill="#c45c4a"/></svg>',
    rebooting: '<svg viewBox="0 0 20 20" fill="none"><path d="M14.5 5.5A7 7 0 1 0 16 10" stroke="#d4a853" stroke-width="2" stroke-linecap="round"/><path d="M14 3v3h3" stroke="#d4a853" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    recovering: '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#A47F49" stroke-width="2" stroke-dasharray="5 3"/><path d="M7 10l2 2 4-4" stroke="#A47F49" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    powerOn: '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="11" r="7" stroke="#10c98f" stroke-width="2"/><path d="M10 4v7" stroke="#10c98f" stroke-width="2" stroke-linecap="round"/></svg>',
    reboot: '<svg viewBox="0 0 20 20" fill="none"><path d="M14.5 5.5A7 7 0 1 0 16 10" stroke="#c45c4a" stroke-width="2" stroke-linecap="round"/><path d="M14 3v3h3" stroke="#c45c4a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    restored: '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#10c98f" stroke-width="2"/><path d="M6 10l3 3 5-5" stroke="#10c98f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    missed: '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#8b7d6b" stroke-width="2"/><path d="M10 6v5M10 14v1" stroke="#8b7d6b" stroke-width="2" stroke-linecap="round"/></svg>',
    timelineOk: '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" fill="#10c98f"/><path d="M5 8l2 2 4-4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    timelineWarn: '<svg viewBox="0 0 16 16" fill="none"><path d="M8 2L2 14h12L8 2z" fill="#d4a853"/><path d="M8 6v4" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="12" r="0.8" fill="#fff"/></svg>',
    timelineBad: '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" fill="#c45c4a"/><path d="M6 6l4 4M10 6l-4 4" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
    timelineInfo: '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" fill="#A47F49"/><path d="M8 5v1M8 7.5v4" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
    timelineReboot: '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" fill="#d4a853"/><path d="M5.5 8a2.5 2.5 0 1 1 4 2" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><path d="M9 5.5V8h2.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    timelinePowerOn: '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" fill="#10c98f"/><path d="M8 4v5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
    summaryOk: '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="#10c98f"/><path d="M6 10l3 3 5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    summaryBad: '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="#c45c4a"/><path d="M7 7l6 6M13 7l-6 6" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
    summaryWarn: '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="#d4a853"/><path d="M10 6v5" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="14" r="1" fill="#fff"/></svg>',
  };
  return icons[type] || icons.ok;
}

function isIpAddress(value) {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(String(value || '').trim());
}

function displayName(server) {
  return isIpAddress(server.name) || isIpAddress(server.ip) ? `服务器 #${server.id}` : server.name;
}

function checkMethod(server) {
  const value = String(server.check_method || 'api_only').toLowerCase();
  if (value === 'service_then_power') return 'HTTP(S) + TCP + API';
  if (value === 'http_then_api') return 'HTTP(S) + API';
  if (value.includes('tcp')) return 'tcp';
  if (value.includes('http')) return 'http';
  return 'api';
}

function availability(server) {
  return (server.state || 'unknown') === 'healthy' ? '100.000%' : '0.000%';
}

function duration(seconds) {
  const value = Number(seconds || 0);
  if (value < 60) return `${value}s`;
  if (value < 3600) return `${Math.round(value / 60)}m`;
  return `${Math.floor(value / 3600)}h ${Math.round((value % 3600) / 60)}m`;
}

function daySegments(server) {
  const history = (server.daily_history || []).slice(-30);
  const emptyCount = Math.max(0, 30 - history.length);
  const emptySlots = Array.from({ length: emptyCount }, () => '<span class="day-segment placeholder" aria-hidden="true"></span>').join('');
  return `${emptySlots}${history.map((day) => {
    const failures = Number(day.failures || 0);
    const level = failures === 0 ? 'ok' : Number(day.uptime_value || parseFloat(day.uptime)) <= 0 ? 'bad' : 'warn';
    const tip = escapeHtml(`${day.date}\n● ${day.uptime} 可用率\n探测 ${day.checks || 0} 次，失败 ${failures} 次\n不可用时长 ${duration(day.downtime_seconds)}`);
    return `<span class="day-segment ${level}" data-tip="${tip}" tabindex="0"></span>`;
  }).join('')}`;
}

function probeLatency(check) {
  const value = Number(check.latency_ms || 0);
  return value > 0 ? `${value}ms` : '-';
}

function probeHeight(check) {
  if (!check.ok) return 8;
  const value = Number(check.latency_ms || 0);
  return Math.max(8, Math.min(28, 8 + Math.round(value / 500)));
}

function bars(server, count = 60) {
  const checks = Array.isArray(server.recent_checks) ? server.recent_checks.slice(0, count).reverse() : [];
  const emptyCount = Math.max(0, count - checks.length);
  const emptySlots = Array.from({ length: emptyCount }, () => '<span class="probe-placeholder" style="height:8px" aria-hidden="true"></span>').join('');
  const realSlots = checks.map((check) => {
    const ok = Boolean(check.ok);
    const label = ok ? '运行正常' : '探测失败';
    const tip = escapeHtml(`${fmtTime(check.created_at)}\n● ${label} · ${probeLatency(check)}`);
    return `<span class="${ok ? 'ok' : 'bad'}" style="height:${probeHeight(check)}px" data-tip="${tip}" tabindex="0"></span>`;
  }).join('');
  return `${emptySlots}${realSlots}`;
}

function latencyStats(server) {
  const checks = Array.isArray(server.recent_checks) ? server.recent_checks : [];
  if (checks.length === 0) {
    const value = Number(server.last_latency_ms || server.latency_ms || 0);
    const text = value > 0 ? `${value}ms` : '-';
    return { best: text, avg: text, worst: text, latest: text };
  }
  const latencies = checks.filter(c => c.ok && c.latency_ms > 0).map(c => Number(c.latency_ms));
  if (latencies.length === 0) {
    return { best: '-', avg: '-', worst: '-', latest: '-' };
  }
  const best = Math.min(...latencies);
  const worst = Math.max(...latencies);
  const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const latestCheck = checks[0];
  const latest = latestCheck && latestCheck.ok && latestCheck.latency_ms > 0 ? `${latestCheck.latency_ms}ms` : '-';
  return { best: `${best}ms`, avg: `${avg}ms`, worst: `${worst}ms`, latest };
}

function eventRow(event) {
  const level = escapeHtml(event.level || 'info');
  const label = String(event.label || '').toLowerCase();
  let iconType = 'timelineInfo';
  if (level === 'critical') {
    if (label.includes('开机') || label.includes('power')) iconType = 'timelinePowerOn';
    else if (label.includes('重启') || label.includes('reboot')) iconType = 'timelineReboot';
    else iconType = 'timelineBad';
  } else if (level === 'warning') {
    if (label.includes('重启') || label.includes('reboot')) iconType = 'timelineReboot';
    else iconType = 'timelineWarn';
  } else {
    if (label.includes('恢复') || label.includes('restor')) iconType = 'timelineOk';
    else iconType = 'timelineInfo';
  }
  return `<li class="timeline-item level-${level}">
    <time>${escapeHtml(fmtTime(event.created_at))}</time>
    <span class="timeline-dot">${svgIcon(iconType)}</span>
    <div>
      <b>${escapeHtml(event.server_name || '')}${event.server_name ? ' · ' : ''}${escapeHtml(event.label || '状态变更')}</b>
      <p>${escapeHtml(stateLabel(event.old_state))} → ${escapeHtml(stateLabel(event.new_state))}</p>
    </div>
  </li>`;
}

function eventHistory(servers) {
  const events = servers.flatMap((server) => (server.events || []).map((event) => ({ ...event, server_name: displayName(server) })))
    .sort((a, b) => Number(b.created_at || 0) - Number(a.created_at || 0))
    .slice(0, 5);
  if (!events.length) {
    return '<section class="history"><div class="history-head"><h2>事件历史</h2></div><div class="history-card"><p class="history-empty">暂无历史事件</p></div></section>';
  }
  return `<section class="history"><div class="history-head"><h2>事件历史</h2></div><div class="history-card"><ol>${events.map(eventRow).join('')}</ol></div></section>`;
}

function row(server) {
  const state = server.state || 'unknown';
  const safeName = escapeHtml(displayName(server));
  const stats = latencyStats(server);
  const method = checkMethod(server);
  const dayTitle = '近 30 天可用性';
  return `<article class="status-card status-card--${state}" role="listitem">
    <div class="card-head">
      <div class="name-row">
        <span class="dot"></span>
        <div>
          <h3>${safeName}</h3>
          <p class="method-tag">${method}</p>
        </div>
      </div>
      <div class="badges">
        <span class="uptime">● ${availability(server)}</span>
        <span class="state">${stateLabel(state)}</span>
      </div>
    </div>
    <p class="caption">${dayTitle}</p>
    <div class="day-track" aria-label="${dayTitle}">${daySegments(server) || '<span class="day-empty">暂无真实探测记录</span>'}</div>
    <p class="caption">最近 60 次探测</p>
    <div class="probe-bars" aria-label="最近探测详情">${bars(server)}</div>
    <div class="card-foot">
      <span class="latency-item">最快 <b>${stats.best}</b></span>
      <span class="latency-item">平均 <b>${stats.avg}</b></span>
      <span class="latency-item">最慢 <b>${stats.worst}</b></span>
      <span class="latency-item latest">最新 <b>${stats.latest}</b></span>
      <span class="time-item">${fmtTime(server.last_check_time)}</span>
    </div>
    <div class="sr-meta">
      <span>24h 重启 ${server.reboot_count_today ?? 0} 次</span>
      <span class="sep">·</span>
      <span>最后重启 ${fmtTime(server.last_reboot_time)}</span>
    </div>
  </article>`;
}

function summaryBar(servers) {
  if (!servers.length) return '';
  const total = servers.length;
  const healthy = servers.filter(s => (s.state || 'unknown') === 'healthy').length;
  const down = servers.filter(s => ['down', 'rebooting', 'recovering'].includes(s.state || 'unknown')).length;
  const suspect = servers.filter(s => (s.state || 'unknown') === 'suspect').length;
  const allHealthy = down === 0 && suspect === 0;
  const overallClass = allHealthy ? 'summary-healthy' : down > 0 ? 'summary-down' : 'summary-suspect';
  const overallText = allHealthy ? '全部运行正常' : `${down} 台异常，${suspect} 台疑似`;
  const iconSvg = allHealthy ? svgIcon('summaryOk') : svgIcon('summaryBad');
  return `<div class="summary-bar ${overallClass}">
    <span class="summary-icon">${iconSvg}</span>
    <span class="summary-text">${escapeHtml(overallText)}</span>
    <span class="summary-detail">${total} 台服务器 · ${healthy} 台正常</span>
  </div>`;
}

export function renderStatusPage(servers, settings = {}) {
  const siteTitle = String(settings.site_title || '服务器自动监控');
  const documentTitle = String(settings.site_title || 'Revelation 服务器监控');
  const siteDescription = String(settings.site_description || 'Cloudflare Worker 按探测间隔执行 API / HTTP(S) / TCP 检测；连续失败 3 次后确认异常并执行重启。');
  const currentYear = new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai', year: 'numeric' });
  const cards = servers.length
    ? `<section class="service-group"><h2 class="group-title">监控概览</h2><div class="grid" role="list">${servers.map(row).join('')}</div></section>`
    : '<p class="empty">暂无启用的监控服务器。</p>';
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(documentTitle)}</title>
  <style>
    :root{--bg:#faf7f2;--panel:#fffdf9;--ink:#2c2418;--muted:#8b7d6b;--line:#e8e0d4;--track:#f0ebe3;--ok:#10c98f;--bad:#c45c4a;--warn:#d4a853;--brand:#A47F49;--brand-dark:#8a6a3c;--brand-light:rgba(164,127,73,.12);--brand-medium:rgba(164,127,73,.2);--brand-border:rgba(164,127,73,.3);--brand-glow:rgba(164,127,73,.15);--card-radius:16px}
    *{box-sizing:border-box;margin:0;padding:0}
    body{min-height:100vh;background:linear-gradient(160deg,#faf7f2 0%,#f5efe5 40%,#f0e8db 100%);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans SC","Microsoft YaHei UI",sans-serif;-webkit-font-smoothing:antialiased;line-height:1.5}
    main{width:min(800px,calc(100% - 24px));margin:0 auto;padding:40px 0 60px}

    .pageNav{display:flex;justify-content:flex-end;margin-bottom:20px}
    .adminLink{border:1px solid var(--brand-border);backdrop-filter:blur(8px);background:linear-gradient(135deg,rgba(255,253,249,.95),rgba(250,247,242,.9));color:var(--brand-dark);text-decoration:none;border-radius:999px;padding:8px 18px;font-size:13px;font-weight:700;transition:all .25s ease;box-shadow:0 2px 8px rgba(164,127,73,.1)}
    .adminLink:hover{background:linear-gradient(135deg,var(--brand),var(--brand-dark));color:#fff;box-shadow:0 4px 16px rgba(164,127,73,.25);transform:translateY(-1px)}

    .hero{margin-bottom:28px;padding:24px 28px;background:linear-gradient(135deg,rgba(164,127,73,.08),rgba(164,127,73,.02));border-radius:var(--card-radius);border:1px solid var(--brand-border)}
    .tag{display:inline-block;color:var(--brand);letter-spacing:.15em;font-size:11px;font-weight:800;text-transform:uppercase;margin-bottom:6px;padding:4px 10px;background:var(--brand-light);border-radius:4px}
    h1{font-size:26px;font-weight:800;letter-spacing:-.03em;margin-bottom:8px;color:var(--brand-dark)}
    .lead{color:var(--muted);line-height:1.6;font-size:15px;max-width:100%}

    .summary-bar{display:flex;align-items:center;gap:10px;padding:14px 20px;border-radius:var(--card-radius);margin-bottom:20px;font-size:14px;font-weight:600;animation:slideDown .35s ease both}
    .summary-healthy{background:linear-gradient(135deg,rgba(16,201,143,.12),rgba(16,201,143,.05));border:1px solid rgba(16,201,143,.3);color:#047857}
    .summary-down{background:linear-gradient(135deg,rgba(196,92,74,.12),rgba(196,92,74,.05));border:1px solid rgba(196,92,74,.3);color:#8b3a2a}
    .summary-suspect{background:linear-gradient(135deg,rgba(212,168,83,.12),rgba(212,168,83,.05));border:1px solid rgba(212,168,83,.3);color:#7a5a10}
    .summary-icon svg{width:24px;height:24px;display:block}
    .summary-text{flex:1}
    .summary-detail{opacity:.7;font-size:13px;font-weight:500}

    .group-title{font-size:20px;font-weight:700;margin:0 0 14px;color:var(--brand-dark);display:flex;align-items:center;gap:8px}
    .group-title::before{content:'';width:4px;height:20px;background:linear-gradient(180deg,var(--brand),var(--brand-dark));border-radius:2px}
    .grid{display:grid;gap:16px}

    .status-card{min-width:0;border:1px solid var(--brand-border);background:linear-gradient(180deg,rgba(255,253,249,.98),rgba(250,247,242,.95));backdrop-filter:blur(12px);box-shadow:0 2px 8px rgba(164,127,73,.08),0 8px 24px rgba(164,127,73,.04);border-radius:var(--card-radius);padding:20px;transition:all .25s ease;animation:slideUp .4s ease both}
    .status-card:hover{box-shadow:0 4px 16px rgba(164,127,73,.12),0 16px 40px rgba(164,127,73,.08);transform:translateY(-2px);border-color:var(--brand)}
    .status-card--healthy{border-left:3px solid var(--brand-border)}
    .status-card--suspect{border-left:3px solid var(--warn)}
    .status-card--down,.status-card--rebooting,.status-card--recovering{border-left:3px solid var(--bad)}

    .card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
    .name-row{display:flex;gap:12px;align-items:flex-start}
    .dot{width:12px;height:12px;border-radius:50%;background:var(--brand);margin-top:6px;position:relative;flex-shrink:0}
    .dot::after{content:'';position:absolute;inset:-5px;border-radius:50%;background:var(--brand-glow);animation:pulse 2s ease-in-out infinite}
    .status-card--suspect .dot{background:var(--warn)}
    .status-card--suspect .dot::after{background:rgba(212,168,83,.2)}
    .status-card--down .dot,.status-card--rebooting .dot,.status-card--recovering .dot{background:var(--bad)}
    .status-card--down .dot::after,.status-card--rebooting .dot::after,.status-card--recovering .dot::after{background:rgba(196,92,74,.2)}
    .status-card--rebooting .dot{animation:spin 1s linear infinite}
    .status-card--recovering .dot{animation:pulse 1s ease-in-out infinite}

    h3{margin:0;font-size:18px;font-weight:700;line-height:1.3;color:var(--ink)}
    .method-tag{margin:2px 0 0;font-size:12px;color:var(--brand);font-weight:600;text-transform:uppercase;letter-spacing:.03em}
    .badges{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
    .uptime{background:rgba(16,201,143,.12);color:#047857;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:600}
    .state{background:var(--brand-light);color:var(--brand-dark);border-radius:999px;padding:3px 10px;font-size:12px;font-weight:600}
    .status-card--down .state{background:rgba(196,92,74,.12);color:#8b3a2a}
    .status-card--rebooting .state{background:rgba(212,168,83,.12);color:#7a5a10}
    .status-card--recovering .state{background:rgba(212,168,83,.12);color:#7a5a10}
    .status-card--suspect .state{background:rgba(212,168,83,.12);color:#7a5a10}

    .caption{color:var(--brand);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin:16px 0 6px;display:flex;align-items:center;gap:6px}
    .caption::before{content:'';width:12px;height:1px;background:var(--brand-border)}
    .day-track{height:28px;border-radius:8px;background:var(--track);padding:0 3px;display:flex;gap:2px;align-items:stretch;overflow:visible;border:1px solid var(--line)}
    .day-segment{position:relative;flex:1;min-width:0;border-radius:6px;background:#d4cfc7;outline:0;transition:all .16s ease}
    .day-segment.placeholder{background:#e0d8ce;opacity:.6}
    .day-segment.ok{background:linear-gradient(180deg,#34d399,#10c98f)}
    .day-segment.warn{background:linear-gradient(180deg,#e0b84a,#d4a853)}
    .day-segment.bad{background:linear-gradient(180deg,#d47a6a,#c45c4a)}
    .day-empty{display:grid;place-items:center;width:100%;color:var(--muted);font-size:13px}

    .probe-bars{height:32px;background:var(--track);border-radius:8px;padding:3px 1px;display:flex;gap:1px;align-items:flex-end;border:1px solid var(--line)}
    .probe-bars span{position:relative;display:block;flex:1 1 0;border-radius:2px 2px 0 0;outline:0;transition:all .16s ease}
    .probe-bars .ok{background:linear-gradient(180deg,#34d399,#10c98f)}
    .probe-bars .bad{background:linear-gradient(180deg,#d47a6a,#c45c4a)}
    .probe-bars .probe-placeholder{background:#d4cfc7;opacity:.6;flex:1 1 0}

    .day-segment[data-tip]:hover,.day-segment[data-tip]:focus,.probe-bars span[data-tip]:hover,.probe-bars span[data-tip]:focus{box-shadow:0 0 0 2px var(--brand-glow);transform:translateY(-6px);z-index:4}
    .day-track span[data-tip]:hover:after,.day-track span[data-tip]:focus:after,.probe-bars span[data-tip]:hover:after,.probe-bars span[data-tip]:focus:after{content:attr(data-tip);position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%);z-index:10;white-space:pre;min-width:180px;background:var(--panel);border:1px solid var(--brand-border);box-shadow:0 8px 24px rgba(164,127,73,.15);border-radius:10px;padding:10px 12px;color:var(--ink);font-size:12px;line-height:1.5;pointer-events:none}
    .day-track span[data-tip]:hover:before,.day-track span[data-tip]:focus:before,.probe-bars span[data-tip]:hover:before,.probe-bars span[data-tip]:focus:before{content:"";position:absolute;left:50%;bottom:calc(100% + 2px);border:6px solid transparent;border-top-color:var(--panel);transform:translateX(-50%);z-index:11}

    .card-foot{display:flex;gap:12px;flex-wrap:wrap;color:var(--muted);margin-top:12px;font-size:13px;padding-top:12px;border-top:1px solid var(--line)}
    .latency-item b{color:var(--ink);font-weight:600}
    .latency-item.latest{margin-left:auto;color:var(--brand);font-size:12px}
    .latency-item.latest b{color:var(--brand-dark);font-weight:700}
    .time-item{color:var(--muted);font-size:12px}

    .sr-meta{font-size:12px;color:var(--muted);margin-top:10px;display:flex;gap:6px;align-items:center;padding:8px 12px;background:var(--brand-light);border-radius:8px}
    .sep{opacity:.4;color:var(--brand)}

    .history{margin-top:36px}
    .history-head{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin:0 0 14px}
    .history h2{font-size:20px;font-weight:700;color:var(--brand-dark);display:flex;align-items:center;gap:8px}
    .history h2::before{content:'';width:4px;height:20px;background:linear-gradient(180deg,var(--brand),var(--brand-dark));border-radius:2px}

    .history-card ol{list-style:none;margin:0;padding:0;display:grid;gap:8px}
    .timeline-item{display:grid;grid-template-columns:160px 32px 1fr;gap:12px;align-items:start;padding:14px 16px;border:1px solid var(--brand-border);background:linear-gradient(135deg,rgba(255,253,249,.9),rgba(250,247,242,.8));border-radius:12px;transition:all .2s ease}
    .timeline-item:hover{background:var(--panel);box-shadow:0 4px 12px rgba(164,127,73,.1);border-color:var(--brand)}
    .timeline-item time{color:var(--muted);font-size:13px;font-weight:500}
    .timeline-dot svg{width:20px;height:20px;display:block}
    .timeline-item b{display:block;font-size:15px;color:var(--brand-dark)}
    .timeline-item p{margin:3px 0 0;color:var(--muted);font-size:14px}
    .history-empty{padding:32px;border:2px dashed var(--brand-border);border-radius:var(--card-radius);color:var(--muted);background:var(--brand-light);text-align:center}
    .empty{padding:32px;border:2px dashed var(--brand-border);border-radius:var(--card-radius);color:var(--muted);background:var(--brand-light);text-align:center}

    footer{margin-top:32px;padding-top:20px;border-top:2px solid var(--brand-border);color:var(--muted);font-size:13px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}
    .footer-brand{font-size:13px;color:var(--muted);font-weight:500}
    .footer-brand a{color:var(--brand-dark);text-decoration:none;font-weight:600;transition:all .2s;padding:2px 6px;border-radius:4px;background:var(--brand-light)}
    .footer-brand a:hover{color:#fff;background:var(--brand)}
    .footer-links{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
    .footer-links a{color:var(--brand-dark);text-decoration:none;transition:all .2s;padding:6px;border-radius:6px;background:var(--brand-light);display:flex;align-items:center;justify-content:center}
    .footer-links a:hover{background:var(--brand);color:#fff}
    .footer-links a svg{width:16px;height:16px}
    .footer-sponsors{font-size:12px;color:var(--muted)}
    .footer-sponsors a{display:inline-flex;align-items:center;vertical-align:middle;transition:opacity .2s;text-decoration:none}
    .footer-sponsors a:hover{opacity:.8}
    .footer-sponsors img{display:inline-block;vertical-align:middle}
    .footer-api{font-size:12px}
    .api{color:var(--brand);text-decoration:none;font-weight:600;padding:4px 10px;border-radius:6px;background:var(--brand-light);transition:all .2s}
    .api:hover{background:var(--brand);color:#fff}
    .footer-version{font-size:12px;color:var(--muted);margin-top:4px;display:flex;align-items:center;gap:4px}
    .footer-version .commit-icon{width:12px;height:12px;color:var(--brand)}

    @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @media(max-width:640px){
      main{padding:24px 0 40px}
      h1{font-size:22px}
      .hero{padding:16px 20px}
      .summary-bar{flex-wrap:wrap}
      .card-head{flex-direction:column;gap:8px}
      .badges{justify-content:flex-start}
      .card-foot{gap:8px}
      .latency-item.latest{margin-left:0}
      .timeline-item{grid-template-columns:1fr;gap:8px}
      .timeline-item time{font-size:12px}
    }
  </style>
</head>
<body>
  <main>
    <nav class="pageNav"><a class="adminLink" href="/admin">管理面板</a></nav>
    <section class="hero">
      <span class="tag">Revelation Monitor</span> · <span class="tag"><svg class="commit-icon" viewBox="0 0 612 612" fill="currentColor"><path d="M608.721 51.908C607.882 23.92 593.087 5.77 567.539 3.33h-1.678L399.459.05h-1.678c-28.827 0-48.579 10.677-60.094 20.591l-.839.839L12.354 346.812c-16.473 16.473-16.473 44.461 0 60.933L204.229 599.62c8.236 8.236 18.913 12.354 30.505 12.354 11.515 0 22.268-4.118 30.505-12.354l159.767-158.93c1.678-1.678 3.279-3.279 4.957-5.796l155.65-155.65c9.914-11.516 27.149-36.224 26.387-70.008l-3.279-157.328zm-45.3 205.907L406.932 414.304c-.839.839-1.678 1.678-1.678 2.44-.839.839-.839 1.678-1.678 2.44L243.809 578.266c-4.957 4.957-13.193 4.957-18.15 0L33.784 386.316c-4.957-4.957-4.957-13.193 0-18.15L358.277 43.672c7.397-5.796 20.591-13.193 39.504-13.193l167.166 3.279c6.559.839 12.354 4.118 13.193 18.913l3.279 157.328c.076 23.107-11.439 40.418-17.998 47.816zM471.145 82.413c-32.106 0-57.654 25.548-57.654 57.654s25.548 57.654 57.654 57.654 57.654-25.548 57.654-57.654-25.548-57.654-57.654-57.654zm0 84.803c-14.795 0-27.149-12.354-27.149-27.149s12.354-27.149 27.149-27.149c14.795 0 27.149 12.354 27.149 27.149s-12.355 27.149-27.149 27.149zm-108.749 149.93c5.796 5.796 5.796 15.634 0 21.43L234.733 466.238c-3.279 3.279-6.558 4.118-10.677 4.118s-7.397-1.678-10.677-4.118c-5.796-5.796-5.796-15.634 0-21.43l127.662-127.662c5.721-5.796 15.635-5.796 21.355 0zm-16.473-88.921l-174.639 174.64c-3.279 3.279-6.558 4.118-10.677 4.118s-7.397-1.678-10.677-4.118c-5.796-5.796-5.796-15.634 0-21.43l174.64-174.639c5.796-5.796 15.634-5.796 21.43 0 5.719 5.719 5.719 14.794-.077 21.429z"/></svg> ${escapeHtml(COMMIT)}</span>
      <h1>${escapeHtml(siteTitle)}</h1>
      <p class="lead">${escapeHtml(siteDescription)}</p>
    </section>
    ${summaryBar(servers)}
    ${cards}
    ${eventHistory(servers)}
    <footer>
      <div class="footer-brand">Copyright &copy; ${currentYear} Revelation | ALL GLORY TO MYSELF</div>
      <div class="footer-links">
        <a href="https://github.com/zyk121381/" target="_blank" title="GitHub"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg></a>
        <a href="https://www.valerianblog.link/" target="_blank" title="Blog"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M12.31 3.01l.79.79a.5.5 0 010 .71l-6.5 6.5a.5.5 0 01-.71 0l-3.5-3.5a.5.5 0 010-.71l.79-.79L8 8.79l4.31-5.78zM2 12h12v2H2v-2z"/></svg></a>
        <a href="https://feedback.valerianblog.link/" target="_blank" title="Contact"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M0 4a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H2a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v.217l7 4.2 7-4.2V4a1 1 0 00-1-1H2zm13 2.383l-4.758 2.855L15 11.114v-5.73zm-.034 6.878L9.271 8.82 8 9.583 6.728 8.82l-5.694 3.44A1 1 0 002 13h12a1 1 0 00.966-.739zM1 11.114l4.758-2.876L1 5.383v5.73z"/></svg></a>
      </div>
      <div class="footer-sponsors"><p style="display: inline-flex; align-items: center; margin: 0"><a href="https://www.heyunidc.cn/aff/GXMRNREQ" target="_blank"><img src="https://www.heyunidc.cn/themes/web/www/upload/local68c30272ab53b.png" alt="核云" height="17" style="margin: 0 3px;"></a> | <a href="https://www.cloudflare-cn.com/" target="_blank"><img src="https://cf-assets.cloudflare-cn.com/dzlvafdwdttg/69wNwfiY5mFmgpd9eQFW6j/d5131c08085a977aa70f19e7aada3fa9/1pixel-down__1_.svg" alt="Cloudflare" height="18" style="margin: 0 3px;"></a></p></div>
      <div class="footer-version"><svg class="commit-icon" viewBox="0 0 32 32" fill="currentColor"><path d="M31.396 14.573l-13.974-13.969c-0.802-0.807-2.109-0.807-2.917 0l-2.896 2.901 3.682 3.677c0.859-0.286 1.839-0.094 2.516 0.589 0.688 0.688 0.88 1.677 0.589 2.531l3.542 3.547c0.859-0.297 1.849-0.104 2.531 0.583 0.964 0.958 0.964 2.51 0 3.469-0.958 0.958-2.505 0.958-3.464 0-0.719-0.719-0.901-1.781-0.542-2.661l-3.318-3.302v8.703c0.234 0.115 0.458 0.271 0.651 0.464 0.953 0.964 0.953 2.51 0 3.469-0.958 0.958-2.516 0.958-3.479 0-0.958-0.958-0.958-2.505 0-3.469 0.245-0.24 0.516-0.417 0.807-0.536v-8.786c-0.286-0.125-0.563-0.297-0.802-0.536-0.724-0.724-0.901-1.786-0.526-2.677l-3.615-3.635-9.583 9.578c-0.797 0.802-0.797 2.109 0 2.917l13.974 13.969c0.807 0.807 2.109 0.807 2.917 0l13.906-13.906c0.807-0.802 0.807-2.109 0-2.917z"/></svg> ${escapeHtml(COMMIT)} · ${escapeHtml(BUILD_TIME ? fmtTime(new Date(BUILD_TIME).getTime() / 1000) : fmtTime(Date.now() / 1000))}</div>
    </footer>
  </main>
</body>
</html>`;
}
