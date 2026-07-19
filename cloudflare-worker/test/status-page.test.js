import assert from 'node:assert/strict';
import test from 'node:test';

import { renderStatusPage } from '../src/status-page.js';

test('状态页渲染服务器状态并转义 HTML', () => {
  const html = renderStatusPage([
    {
      id: '8564',
      name: '<script>alert(1)</script>',
      provider: 'heyunidc',
      state: 'healthy',
      last_status_value: 'on',
      last_check_time: 1778384953,
      last_reboot_time: 0,
      reboot_count_today: 0,
      check_method: 'tcp',
      daily_history: [
        { date: '2026/5/9', uptime: '100.000%', checks: 12, failures: 0, downtime_seconds: 0 },
        { date: '2026/5/10', uptime: '91.667%', checks: 12, failures: 1, downtime_seconds: 300 },
      ],
      events: [
        { label: '检测异常', level: 'warning', message: '服务不可达', created_at: 1778384953 },
        { label: '重启指令已发送', level: 'warning', message: '已发送硬重启', created_at: 1778385053 },
        { label: '旧事件', level: 'info', message: '应被截断', created_at: 1778384853 },
      ],
    },
  ]);

  assert.match(html, /Revelation 服务器监控/);
  assert.match(html, /服务器自动监控/);
  assert.doesNotMatch(html, /核云服务器<br>自动监控/);
  assert.match(html, /--bg:#f0f4f8/);
  assert.match(html, /服务/);
  assert.match(html, /监控概览/);
  assert.match(html, /status-card/);
  assert.match(html, /近 30 天可用性/);
  assert.match(html, /最近 60 次探测/);
  assert.match(html, /class="day-track"/);
  assert.match(html, /aria-label="近 30 天可用性"/);
  assert.equal((html.match(/class="day-segment/g) || []).length, 30);
  assert.equal((html.match(/class="day-segment placeholder"/g) || []).length, 28);
  assert.doesNotMatch(html, /class="day-segment empty"/);
  assert.match(html, /100\.000% 可用率/);
  assert.match(html, /不可用时长 0s/);
  assert.match(html, /探测 12 次，失败 1 次/);
  assert.match(html, /box-shadow:0 0 0 2px/);
  assert.match(html, /translateY\(-6px\)/);
  assert.doesNotMatch(html, /active/);
  assert.match(html, /事件历史/);
  assert.match(html, /查看更多/);
  assert.match(html, /history-card/);
  assert.equal((html.match(/class="timeline-item/g) || []).length, 3);
  assert.match(html, /检测异常/);
  assert.match(html, /重启指令已发送/);
  assert.match(html, /旧事件/);
  assert.match(html, /data-tip=/);
  assert.match(html, /aria-label="最近探测详情"/);
  assert.match(html, /tcp/);
  assert.match(html, /管理面板/);
  assert.match(html, /href="\/admin"/);
  assert.match(html, /运行正常/);
  assert.match(html, /24h 重启/);
  assert.doesNotMatch(html, /本小时重启|今日重启/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /svg/);
  assert.doesNotMatch(html, /✅|⚠️|🔴|🔄|⏳|❓|🚨|🟢/);
});

test('状态页不显示服务器 IP，名称为 IP 时改用泛化名称', () => {
  const html = renderStatusPage([
    {
      id: '8564',
      name: '203.0.113.10',
      ip: '203.0.113.10',
      provider: 'heyunidc',
      state: 'healthy',
      last_status_value: 'on',
      last_check_time: 1778384953,
      last_reboot_time: 0,
      reboot_count_today: 0,
    },
  ]);

  assert.match(html, /服务器 #8564/);
  assert.doesNotMatch(html, /203\.0\.113\.10/);
});

test('状态页使用站点品牌设置渲染标题和描述', () => {
  const html = renderStatusPage([], {
    site_title: '核云状态页',
    site_description: '自定义状态页描述',
  });

  assert.match(html, /<title>核云状态页<\/title>/);
  assert.match(html, /<h1>核云状态页<\/h1>/);
  assert.match(html, /自定义状态页描述/);
  assert.doesNotMatch(html, /服务器自动监控/);
});

test('状态页最近探测条使用真实探测时间和延迟', () => {
  const t1 = new Date(1778385053 * 1000).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
  const t2 = new Date(1778384753 * 1000).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
  const html = renderStatusPage([
    {
      id: '8564',
      name: '主服务器',
      state: 'healthy',
      last_check_time: 1778385053,
      last_latency_ms: 9819,
      recent_checks: [
        { ok: true, latency_ms: 120, created_at: 1778385053 },
        { ok: false, latency_ms: 0, created_at: 1778384753 },
      ],
    },
  ]);

  assert.match(html, new RegExp(t1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(html, new RegExp(t2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(html, /运行正常 · 120ms/);
  assert.match(html, /探测失败 · -/);
  assert.equal((html.match(/class="probe-placeholder"/g) || []).length, 58);
  assert.doesNotMatch(html, /运行正常 · 9819ms/);
});

test('状态页延迟数据从所有探测结果计算', () => {
  const html = renderStatusPage([
    {
      id: '8564',
      name: '测试服务器',
      state: 'healthy',
      last_check_time: 1778385053,
      last_latency_ms: 500,
      recent_checks: [
        { ok: true, latency_ms: 100, created_at: 1778385053 },
        { ok: true, latency_ms: 200, created_at: 1778385000 },
        { ok: true, latency_ms: 300, created_at: 1778384950 },
        { ok: false, latency_ms: 0, created_at: 1778384900 },
      ],
    },
  ]);

  assert.match(html, /最快 <b>100ms<\/b>/);
  assert.match(html, /平均 <b>200ms<\/b>/);
  assert.match(html, /最慢 <b>300ms<\/b>/);
  assert.match(html, /最新 <b>100ms<\/b>/);
});
