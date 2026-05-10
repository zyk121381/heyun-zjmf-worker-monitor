import assert from 'node:assert/strict';
import test from 'node:test';

import { handleRequest } from '../src/routes.js';

class FakeStatement {
  constructor(data, sql) {
    this.data = data;
    this.sql = sql;
  }

  bind() {
    return this;
  }

  async all() {
    if (this.sql.includes('SELECT key, value FROM settings')) {
      return { results: Object.entries(this.data.settings).map(([key, value]) => ({ key, value })) };
    }
    if (this.sql.includes('FROM providers ORDER BY name')) {
      return {
        results: this.data.providers.map(({ name, display_name, api_base_url, api_account, created_at, updated_at }) => ({
          name,
          display_name,
          api_base_url,
          api_account,
          created_at,
          updated_at,
        })),
      };
    }
    if (this.sql.includes('SELECT * FROM servers ORDER BY id')) return { results: this.data.servers };
    if (this.sql.includes('FROM servers s')) return { results: this.data.status };
    throw new Error(`Unexpected SQL: ${this.sql}`);
  }
}

class FakeD1 {
  constructor(data) {
    this.data = data;
  }

  prepare(sql) {
    return new FakeStatement(this.data, sql);
  }
}

function env() {
  return {
    ADMIN_TOKEN: 'admin-password',
    DB: new FakeD1({
      settings: {
        pushplus_token: 'pushplus-secret',
        suspect_threshold: '2',
        reboot_cooldown: '300',
        recover_timeout: '300',
      },
      providers: [
        {
          name: 'heyunidc',
          display_name: '核云',
          api_base_url: 'https://api.example/v1',
          api_account: 'account@example.test',
          api_password: 'provider-secret',
        },
      ],
      servers: [{ id: '8564', name: '主服务器', provider: 'heyunidc', enabled: 1 }],
      status: [{ id: '8564', name: '主服务器', state: 'healthy', last_status_value: 'on' }],
    }),
  };
}

test('管理接口缺少 ZJMF_ADMIN_TOKEN 对应的 Bearer Token 时拒绝访问', async () => {
  const res = await handleRequest(new Request('https://worker.example/api/admin/overview'), env());

  assert.equal(res.status, 401);
});

test('管理概览返回配置但不泄露服务商密钥和 pushplus token', async () => {
  const res = await handleRequest(
    new Request('https://worker.example/api/admin/overview', {
      headers: { authorization: 'Bearer admin-password' },
    }),
    env(),
  );
  const text = await res.text();
  const data = JSON.parse(text);

  assert.equal(res.status, 200);
  assert.equal(data.settings.pushplus_token, '已配置');
  assert.equal(data.providers[0].api_password, undefined);
  assert.doesNotMatch(text, /provider-secret|pushplus-secret/);
});
