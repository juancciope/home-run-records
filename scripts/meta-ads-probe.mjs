// End-to-end probe: exchange token, list ad accounts, pull insights.
// Run: node scripts/meta-ads-probe.mjs
import { readFileSync } from 'node:fs';
import { createHmac } from 'node:crypto';
import { resolve } from 'node:path';

const envPath = resolve(process.cwd(), '.env.local');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const {
  META_APP_ID,
  META_APP_SECRET,
  META_USER_ACCESS_TOKEN,
  META_GRAPH_API_VERSION = 'v21.0',
} = process.env;

if (!META_APP_ID || !META_APP_SECRET || !META_USER_ACCESS_TOKEN) {
  console.error('Missing META_APP_ID / META_APP_SECRET / META_USER_ACCESS_TOKEN in .env.local');
  process.exit(1);
}

const base = `https://graph.facebook.com/${META_GRAPH_API_VERSION}`;
const appsecretProof = (token) =>
  createHmac('sha256', META_APP_SECRET).update(token).digest('hex');

async function get(path, token, params = {}) {
  const url = new URL(`${base}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set('access_token', token);
  url.searchParams.set('appsecret_proof', appsecretProof(token));
  const res = await fetch(url.toString());
  const body = await res.json();
  if (!res.ok) {
    console.error(`ERR ${path}:`, JSON.stringify(body, null, 2));
    throw new Error(`HTTP ${res.status}`);
  }
  return body;
}

async function main() {
  console.log('▸ Step 1: exchange short-lived → long-lived token');
  const exchangeURL = new URL(`${base}/oauth/access_token`);
  exchangeURL.searchParams.set('grant_type', 'fb_exchange_token');
  exchangeURL.searchParams.set('client_id', META_APP_ID);
  exchangeURL.searchParams.set('client_secret', META_APP_SECRET);
  exchangeURL.searchParams.set('fb_exchange_token', META_USER_ACCESS_TOKEN);
  const exchRes = await fetch(exchangeURL.toString());
  const exchBody = await exchRes.json();
  if (!exchRes.ok) {
    console.error('Token exchange failed:', JSON.stringify(exchBody, null, 2));
    process.exit(1);
  }
  const longLived = exchBody.access_token;
  const expiresIn = exchBody.expires_in; // seconds
  console.log(`  ✓ got long-lived token (expires in ${Math.round(expiresIn / 86400)} days)\n`);

  console.log('▸ Step 2: whoami');
  const me = await get('/me', longLived, { fields: 'id,name' });
  console.log(`  ✓ user: ${me.name} (${me.id})\n`);

  console.log('▸ Step 3: list ad accounts accessible to this user');
  const accts = await get('/me/adaccounts', longLived, {
    fields: 'id,account_id,name,currency,account_status,business_name,timezone_name',
    limit: 25,
  });
  const accounts = accts.data || [];
  console.log(`  ✓ ${accounts.length} ad account(s):`);
  for (const a of accounts) {
    console.log(`     - ${a.name} | ${a.id} | ${a.currency} | status=${a.account_status} | biz=${a.business_name || '—'}`);
  }
  if (!accounts.length) {
    console.log('\n⚠ No ad accounts visible. Make sure your Meta user is in a Business Manager that owns/has access to an ad account.');
    return;
  }
  console.log('');

  const target = accounts[0];
  console.log(`▸ Step 4: insights for ${target.name} (${target.id}) — last_30d, account level`);
  const insights = await get(`/${target.id}/insights`, longLived, {
    date_preset: 'last_30d',
    level: 'account',
    fields: [
      'spend', 'impressions', 'reach', 'frequency',
      'clicks', 'ctr', 'cpc', 'cpm',
      'actions', 'cost_per_action_type',
      'date_start', 'date_stop',
    ].join(','),
  });
  console.log('  Raw insights response:');
  console.log(JSON.stringify(insights, null, 2));
  console.log('');

  console.log(`▸ Step 5: campaign list for ${target.id}`);
  const camps = await get(`/${target.id}/campaigns`, longLived, {
    fields: 'id,name,status,objective,daily_budget,lifetime_budget',
    limit: 10,
  });
  console.log(`  ✓ ${camps.data?.length || 0} campaign(s):`);
  for (const c of camps.data || []) {
    console.log(`     - ${c.name} | ${c.status} | ${c.objective} | daily=${c.daily_budget || '—'}`);
  }
  console.log('');

  if (camps.data?.length) {
    console.log(`▸ Step 6: campaign-level insights for ${target.id} (last_30d)`);
    const campInsights = await get(`/${target.id}/insights`, longLived, {
      date_preset: 'last_30d',
      level: 'campaign',
      fields: 'campaign_name,campaign_id,spend,impressions,reach,clicks,ctr,cpc,actions',
      limit: 10,
    });
    console.log(JSON.stringify(campInsights, null, 2));
  }

  console.log('\n✓ ALL GOOD. Save this long-lived token to Supabase when building the real connection:');
  console.log(`  token prefix: ${longLived.slice(0, 24)}...`);
  console.log(`  expires in:   ~${Math.round(expiresIn / 86400)} days`);
}

main().catch((e) => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
