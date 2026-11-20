// Transparent, deterministic scoring. The model finds the signals; this file
// decides what they are worth, so reps can see exactly why an account ranks.

export const CATEGORIES = {
  gtm_hiring: { label: 'GTM hiring', max: 30 },
  acquisition: { label: 'Acquisition', max: 20 },
  subsidiary: { label: 'New subsidiary', max: 10 },
  funding_growth: { label: 'Funding & growth', max: 15 },
  leadership: { label: 'Sales leadership', max: 15 },
  expansion: { label: 'New markets & products', max: 10 },
  risk: { label: 'Risk', max: -25 },
};

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

export function scoreBrief(brief) {
  const signals = brief.signals || [];
  const roles = brief.open_gtm_roles || [];
  const seatRoles = roles.filter((r) => r.needs_seat !== false).length;
  const strongest = (cat) =>
    signals.filter((s) => s.category === cat).reduce((m, s) => Math.max(m, clamp(Number(s.strength) || 1, 1, 3)), 0);

  const breakdown = [];
  let total = 0;
  for (const [key, def] of Object.entries(CATEGORIES)) {
    let points = 0;
    if (key === 'gtm_hiring') {
      // 10+ open seat-eligible roles earns the full weight.
      const byRoles = Math.min(1, seatRoles / 10);
      const bySignal = strongest(key) / 3;
      points = Math.round(def.max * Math.max(byRoles, bySignal * 0.6));
    } else {
      points = Math.round(def.max * (strongest(key) / 3));
    }
    total += points;
    breakdown.push({ key, label: def.label, points, max: def.max });
  }
  const score = clamp(total, 0, 100);
  const tier = score >= 65 ? 'hot' : score >= 35 ? 'warm' : 'cool';
  return { score, tier, breakdown, seatRoles };
}

export function whitespace(brief, currentSeats) {
  const roles = brief.open_gtm_roles || [];
  const seatRoles = roles.filter((r) => r.needs_seat !== false).length;
  const estimate = Math.max(seatRoles, Number(brief.gtm_roles_total_estimate) || 0);
  const seats = Number.isFinite(Number(currentSeats)) && currentSeats !== null && currentSeats !== '' ? Number(currentSeats) : null;
  return {
    currentSeats: seats,
    openSeatRoles: seatRoles,
    suggestedLow: Math.ceil(seatRoles * 0.6),
    suggestedHigh: estimate,
    growthPct: seats ? Math.round((estimate / seats) * 100) : null,
  };
}
