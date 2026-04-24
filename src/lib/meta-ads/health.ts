import type { NormalizedInsights } from './insights';

export type Health = 'green' | 'yellow' | 'red';

export type HealthVerdict = {
  overall: Health;
  reasons: string[];
};

/**
 * Rough rules for "are the ads working?"
 *   RED:    zero spend when there should be activity, CTR < 0.5%, frequency > 8
 *   YELLOW: CTR between 0.5% and 1%, frequency between 5 and 8
 *   GREEN:  CTR >= 1% and frequency < 5
 *
 * Rules are heuristics — tuned for music/artist ads which tend to run brand
 * awareness + engagement objectives, not direct-response.
 */
export function assessHealth(ins: NormalizedInsights): HealthVerdict {
  const reasons: string[] = [];
  let health: Health = 'green';

  if (ins.spend === 0 && ins.impressions === 0) {
    return { overall: 'red', reasons: ['No ads running in this period'] };
  }

  if (ins.ctr < 0.5) {
    health = 'red';
    reasons.push(`CTR low (${ins.ctr.toFixed(2)}%)`);
  } else if (ins.ctr < 1) {
    health = worse(health, 'yellow');
    reasons.push(`CTR below target (${ins.ctr.toFixed(2)}%)`);
  }

  if (ins.frequency > 8) {
    health = worse(health, 'red');
    reasons.push(`High ad fatigue (frequency ${ins.frequency.toFixed(1)})`);
  } else if (ins.frequency > 5) {
    health = worse(health, 'yellow');
    reasons.push(`Rising frequency (${ins.frequency.toFixed(1)})`);
  }

  if (reasons.length === 0) reasons.push('Performance within normal range');
  return { overall: health, reasons };
}

function worse(a: Health, b: Health): Health {
  const rank: Record<Health, number> = { green: 0, yellow: 1, red: 2 };
  return rank[b] > rank[a] ? b : a;
}
