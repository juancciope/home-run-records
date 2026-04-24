import { metaGet } from './client';

export type DatePreset = 'last_7d' | 'last_30d' | 'last_90d';

type MetaAction = { action_type: string; value: string };
type MetaInsightRow = {
  spend?: string;
  impressions?: string;
  reach?: string;
  frequency?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  actions?: MetaAction[];
  cost_per_action_type?: MetaAction[];
  date_start?: string;
  date_stop?: string;
  campaign_id?: string;
  campaign_name?: string;
  objective?: string;
};

const ACCOUNT_FIELDS = [
  'spend',
  'impressions',
  'reach',
  'frequency',
  'clicks',
  'ctr',
  'cpc',
  'cpm',
  'actions',
  'cost_per_action_type',
  'date_start',
  'date_stop',
].join(',');

const CAMPAIGN_FIELDS = [
  'campaign_id',
  'campaign_name',
  'objective',
  'spend',
  'impressions',
  'reach',
  'clicks',
  'ctr',
  'cpc',
  'actions',
].join(',');

function num(v: string | undefined): number {
  if (!v) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function findAction(actions: MetaAction[] | undefined, types: string[]): number {
  if (!actions) return 0;
  for (const t of types) {
    const hit = actions.find((a) => a.action_type === t);
    if (hit) return num(hit.value);
  }
  return 0;
}

// Maps both legacy and new (ODAX) objectives to the meaningful "result" action types.
function resultsForObjective(
  objective: string | undefined,
  actions: MetaAction[] | undefined,
  reach: number,
): { results: number; label: string } {
  const obj = (objective || '').toUpperCase();

  if (obj.includes('SALES') || obj.includes('CONVERSION')) {
    return { results: findAction(actions, ['purchase', 'offsite_conversion.fb_pixel_purchase', 'omni_purchase']), label: 'Purchases' };
  }
  if (obj.includes('LEADS') || obj === 'LEAD_GENERATION') {
    return { results: findAction(actions, ['lead', 'onsite_conversion.lead_grouped']), label: 'Leads' };
  }
  if (obj.includes('TRAFFIC') || obj === 'LINK_CLICKS') {
    return { results: findAction(actions, ['landing_page_view', 'link_click']), label: 'Landing page views' };
  }
  if (obj.includes('ENGAGEMENT') || obj === 'POST_ENGAGEMENT' || obj === 'PAGE_LIKES') {
    return { results: findAction(actions, ['post_engagement', 'page_engagement']), label: 'Engagements' };
  }
  if (obj.includes('AWARENESS') || obj === 'BRAND_AWARENESS' || obj === 'REACH') {
    return { results: reach, label: 'People reached' };
  }
  if (obj.includes('APP_PROMOTION') || obj === 'APP_INSTALLS') {
    return { results: findAction(actions, ['mobile_app_install', 'app_install']), label: 'App installs' };
  }
  if (obj.includes('VIDEO')) {
    return { results: findAction(actions, ['video_view']), label: 'Video views' };
  }
  // Default: if we don't know, fall back to link_click or engagement
  return { results: findAction(actions, ['link_click', 'post_engagement']), label: 'Clicks' };
}

export type NormalizedInsights = {
  dateStart: string;
  dateStop: string;
  spend: number;
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  ctr: number;      // percentage (0..100)
  cpc: number;
  cpm: number;
  results: number;
  resultsLabel: string;
  cpa: number;      // cost per result
  campaigns: Array<{
    id: string;
    name: string;
    objective: string;
    spend: number;
    impressions: number;
    reach: number;
    clicks: number;
    ctr: number;
    cpc: number;
    results: number;
    resultsLabel: string;
    cpa: number;
  }>;
};

export async function fetchAccountInsights(
  token: string,
  adAccountId: string,
  datePreset: DatePreset,
): Promise<NormalizedInsights> {
  // Run account and campaign insights in parallel
  const [acctRaw, campRaw] = await Promise.all([
    metaGet<{ data: MetaInsightRow[] }>(`/${adAccountId}/insights`, token, {
      date_preset: datePreset,
      level: 'account',
      fields: ACCOUNT_FIELDS,
    }),
    metaGet<{ data: MetaInsightRow[] }>(`/${adAccountId}/insights`, token, {
      date_preset: datePreset,
      level: 'campaign',
      fields: CAMPAIGN_FIELDS,
      limit: 25,
    }),
  ]);

  const acct = acctRaw.data?.[0];
  const reach = num(acct?.reach);

  // For account-level "results", sum each campaign's objective-matched result
  // so the number actually reflects what the ads were trying to achieve.
  const campaigns = (campRaw.data || []).map((c) => {
    const r = resultsForObjective(c.objective, c.actions, num(c.reach));
    const spend = num(c.spend);
    return {
      id: c.campaign_id || '',
      name: c.campaign_name || '(unnamed)',
      objective: c.objective || '',
      spend,
      impressions: num(c.impressions),
      reach: num(c.reach),
      clicks: num(c.clicks),
      ctr: num(c.ctr),
      cpc: num(c.cpc),
      results: r.results,
      resultsLabel: r.label,
      cpa: r.results > 0 ? spend / r.results : 0,
    };
  });

  // Sum campaign-matched results. For awareness (reach), using sum across campaigns
  // overcounts unique users, but at this phase that's acceptable; we label it honestly.
  const totalResults = campaigns.reduce((acc, c) => acc + c.results, 0);
  const dominantLabel =
    campaigns.length === 0
      ? 'Results'
      : mostFrequent(campaigns.map((c) => c.resultsLabel));

  const spend = num(acct?.spend);

  return {
    dateStart: acct?.date_start || '',
    dateStop: acct?.date_stop || '',
    spend,
    impressions: num(acct?.impressions),
    reach,
    frequency: num(acct?.frequency),
    clicks: num(acct?.clicks),
    ctr: num(acct?.ctr),
    cpc: num(acct?.cpc),
    cpm: num(acct?.cpm),
    results: totalResults,
    resultsLabel: dominantLabel,
    cpa: totalResults > 0 ? spend / totalResults : 0,
    campaigns,
  };
}

function mostFrequent<T>(arr: T[]): T {
  const counts = new Map<T, number>();
  for (const v of arr) counts.set(v, (counts.get(v) || 0) + 1);
  let best: T = arr[0];
  let bestN = 0;
  for (const [k, n] of counts) if (n > bestN) { best = k; bestN = n; }
  return best;
}

export type AdAccountSummary = {
  id: string;           // "act_..."
  accountId: string;    // "..."
  name: string;
  currency: string;
  status: number;
  businessName: string | null;
};

export async function listAdAccounts(token: string): Promise<AdAccountSummary[]> {
  const body = await metaGet<{
    data: Array<{
      id: string;
      account_id: string;
      name: string;
      currency: string;
      account_status: number;
      business_name?: string;
    }>;
  }>('/me/adaccounts', token, {
    fields: 'id,account_id,name,currency,account_status,business_name',
    limit: 100,
  });
  return (body.data || []).map((a) => ({
    id: a.id,
    accountId: a.account_id,
    name: a.name,
    currency: a.currency,
    status: a.account_status,
    businessName: a.business_name || null,
  }));
}
