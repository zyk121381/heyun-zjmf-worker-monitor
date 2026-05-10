import assert from 'node:assert/strict';
import test from 'node:test';

import { renderAdminPage } from '../src/admin-page.js';

test('管理后台页面使用 ZJMF_ADMIN_TOKEN 登录且不嵌入真实密码', () => {
  const html = renderAdminPage();

  assert.match(html, /ZJMF 管理后台/);
  assert.match(html, /ZJMF_ADMIN_TOKEN/);
  assert.match(html, /\/api\/admin\/overview/);
  assert.match(html, /保存服务商/);
  assert.match(html, /保存服务器/);
  assert.match(html, /localStorage\.getItem\('zjmf_admin_token'\)/);
  assert.match(html, /const esc=/);
  assert.doesNotMatch(html, /super-secret-admin-password/);
});
