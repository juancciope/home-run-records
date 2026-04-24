'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Target, Activity, Facebook, RefreshCw, Unplug } from 'lucide-react';

type Health = 'green' | 'yellow' | 'red';

type AccountSummary = {
  id: string;
  accountId: string;
  name: string;
  currency: string;
  status: number;
  businessName: string | null;
};

type InsightsResponse = {
  connected: boolean;
  needsAdAccount?: boolean;
  cached?: boolean;
  error?: string;
  insights?: {
    spend: number;
    impressions: number;
    reach: number;
    frequency: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpm: number;
    results: number;
    resultsLabel: string;
    cpa: number;
    dateStart: string;
    dateStop: string;
    campaigns: Array<{
      id: string;
      name: string;
      objective: string;
      spend: number;
      results: number;
      resultsLabel: string;
      cpa: number;
      ctr: number;
    }>;
  };
  health?: { overall: Health; reasons: string[] };
  fetchedAt?: string;
};

const fmtMoney = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: n < 100 ? 2 : 0 }).format(n || 0);

const fmtInt = (n: number) => {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.round(n).toLocaleString('en-US');
};

const healthDot: Record<Health, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};
const healthLabel: Record<Health, string> = {
  green: 'Healthy',
  yellow: 'Needs attention',
  red: 'Underperforming',
};

export function MetaAdsCards() {
  const [loading, setLoading] = React.useState(true);
  const [connected, setConnected] = React.useState(false);
  const [needsAdAccount, setNeedsAdAccount] = React.useState(false);
  const [accounts, setAccounts] = React.useState<AccountSummary[]>([]);
  const [selectedAccountId, setSelectedAccountId] = React.useState<string | null>(null);
  const [preset, setPreset] = React.useState<'last_7d' | 'last_30d' | 'last_90d'>('last_30d');
  const [data, setData] = React.useState<InsightsResponse | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [urlFlag, setUrlFlag] = React.useState<string | null>(null);

  // Surface OAuth callback status (?meta_ads=connected | error&reason=...)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flag = params.get('meta_ads');
    if (flag) {
      setUrlFlag(flag === 'error' ? `Connection failed: ${params.get('reason') || ''}` : 'Meta Ads connected ✓');
      // Clean the URL so a refresh doesn't re-show the banner
      params.delete('meta_ads');
      params.delete('reason');
      const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
      window.history.replaceState({}, '', clean);
      // Auto-hide after a few seconds
      const t = setTimeout(() => setUrlFlag(null), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  const loadAccounts = React.useCallback(async () => {
    const res = await fetch('/api/meta-ads/accounts', { cache: 'no-store' });
    const body = await res.json();
    setConnected(!!body.connected);
    setAccounts(body.accounts || []);
    setSelectedAccountId(body.selected || null);
    return body;
  }, []);

  const loadInsights = React.useCallback(async (opts?: { force?: boolean }) => {
    const res = await fetch(`/api/meta-ads/insights?preset=${preset}${opts?.force ? '&force=1' : ''}`, {
      cache: 'no-store',
    });
    const body = (await res.json()) as InsightsResponse;
    setData(body);
    setConnected(!!body.connected);
    setNeedsAdAccount(!!body.needsAdAccount);
  }, [preset]);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const a = await loadAccounts();
      if (a.connected) await loadInsights();
      setLoading(false);
    })();
  }, [loadAccounts, loadInsights]);

  const handlePickAccount = async (id: string) => {
    setSelectedAccountId(id);
    await fetch('/api/meta-ads/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adAccountId: id }),
    });
    await loadInsights({ force: true });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInsights({ force: true });
    setRefreshing(false);
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Meta Ads? You can reconnect anytime.')) return;
    await fetch('/api/meta-ads/disconnect', { method: 'DELETE' });
    setConnected(false);
    setData(null);
    setSelectedAccountId(null);
    setAccounts([]);
  };

  return (
    <div>
      {urlFlag && (
        <div className="mb-4 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-900">
          {urlFlag}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Facebook className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Ad Performance</h2>
          </div>
          <p className="text-sm text-muted-foreground">How your Meta ads are performing right now</p>
        </div>
        <div className="flex items-center gap-2">
          {connected && accounts.length > 0 && (
            <Select
              value={selectedAccountId || undefined}
              onValueChange={handlePickAccount}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Choose ad account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                    {a.businessName ? ` · ${a.businessName}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {connected && selectedAccountId && (
            <Select value={preset} onValueChange={(v) => setPreset(v as typeof preset)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_7d">Last 7 days</SelectItem>
                <SelectItem value="last_30d">Last 30 days</SelectItem>
                <SelectItem value="last_90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          )}
          {connected && (
            <>
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDisconnect} title="Disconnect">
                <Unplug className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <Card key={i}><CardHeader><Skeleton className="h-4 w-32" /><Skeleton className="h-8 w-24 mt-2" /></CardHeader></Card>
          ))}
        </div>
      )}

      {!loading && !connected && <ConnectCard />}
      {!loading && connected && needsAdAccount && <ChooseAccountCard accounts={accounts} onPick={handlePickAccount} />}
      {!loading && connected && !needsAdAccount && data?.error && (
        <Card className="border-red-200">
          <CardContent className="pt-6 text-sm text-red-800">Could not load insights: {data.error}</CardContent>
        </Card>
      )}
      {!loading && connected && data?.insights && data?.health && <Cards data={data} />}
    </div>
  );
}

function ConnectCard() {
  return (
    <Card className="border-blue-200">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Facebook className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <CardTitle>Connect Meta Ads</CardTitle>
            <CardDescription>Show spend, results, and health from Facebook & Instagram campaigns.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => { window.location.href = '/api/meta-ads/connect'; }}
        >
          Connect Meta Ads
        </Button>
      </CardContent>
    </Card>
  );
}

function ChooseAccountCard({
  accounts,
  onPick,
}: {
  accounts: AccountSummary[];
  onPick: (id: string) => void;
}) {
  return (
    <Card className="border-amber-200">
      <CardHeader>
        <CardTitle>Choose an ad account</CardTitle>
        <CardDescription>Pick which Meta ad account powers this dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {accounts.map((a) => (
            <Button key={a.id} variant="outline" onClick={() => onPick(a.id)}>
              {a.name}
              {a.businessName ? ` · ${a.businessName}` : ''}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Cards({ data }: { data: InsightsResponse }) {
  const ins = data.insights!;
  const health = data.health!;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Spend */}
      <Card className="border-amber-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Ad Spend</CardTitle>
              <CardDescription className="text-sm">
                {ins.dateStart} → {ins.dateStop}
              </CardDescription>
            </div>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-4xl font-bold">{fmtMoney(ins.spend)}</div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>CPM</span>
              <span className="text-amber-600 font-medium">{fmtMoney(ins.cpm)}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {ins.campaigns.filter((c) => c.spend > 0).length} active
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Activity className="h-3 w-3" />
            <span>Reach {fmtInt(ins.reach)} · Frequency {ins.frequency.toFixed(1)}</span>
          </div>
        </CardHeader>
      </Card>

      {/* Results */}
      <Card className="border-indigo-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Results</CardTitle>
              <CardDescription className="text-sm">{ins.resultsLabel}</CardDescription>
            </div>
            <Target className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-4xl font-bold">{fmtInt(ins.results)}</div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>Cost per result</span>
              <span className="text-indigo-600 font-medium">
                {ins.cpa > 0 ? fmtMoney(ins.cpa) : '—'}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {fmtInt(ins.clicks)} clicks
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Target className="h-3 w-3" />
            <span>CPC {fmtMoney(ins.cpc)}</span>
          </div>
        </CardHeader>
      </Card>

      {/* Health */}
      <Card className="border-emerald-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Performance</CardTitle>
              <CardDescription className="text-sm">Are the ads working?</CardDescription>
            </div>
            <span className={`h-3 w-3 rounded-full ${healthDot[health.overall]}`} />
          </div>
          <div className="text-4xl font-bold flex items-baseline gap-2">
            <span>{ins.ctr.toFixed(2)}%</span>
            <span className="text-sm font-normal text-muted-foreground">CTR</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${healthDot[health.overall]}`} />
              <span className="font-medium">{healthLabel[health.overall]}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {ins.impressions > 0 ? `${fmtInt(ins.impressions)} impr` : 'no data'}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Activity className="h-3 w-3" />
            <span className="truncate">{health.reasons[0]}</span>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
