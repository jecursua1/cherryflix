// Resolve a dashboard date range from query params, enforcing a 90-day maximum.
export type RangeParams = { days?: string; from?: string; to?: string };

export function resolveRange(sp: RangeParams): {
  since: Date;
  until: Date;
  days: number;
  label: string;
  isCustom: boolean;
} {
  const MAX_DAYS = 90;
  const now = new Date();
  let since: Date;
  let until: Date;
  let label: string;
  let isCustom = false;

  if (sp.from && sp.to) {
    isCustom = true;
    since = new Date(`${sp.from}T00:00:00`);
    until = new Date(`${sp.to}T00:00:00`);
    until.setDate(until.getDate() + 1); // make the end day inclusive
    label = `${sp.from} → ${sp.to}`;
  } else {
    const d = Math.min(Math.max(parseInt(sp.days ?? "30", 10) || 30, 1), MAX_DAYS);
    until = now;
    since = new Date(now.getTime() - d * 86400000);
    label = `Last ${d} days`;
  }

  // Guard against invalid dates and clamp the window to the last 90 days.
  if (isNaN(since.getTime())) since = new Date(now.getTime() - 30 * 86400000);
  if (isNaN(until.getTime())) until = now;
  const maxSince = new Date(now.getTime() - MAX_DAYS * 86400000);
  if (since < maxSince) since = maxSince;
  if (until > now) until = now;

  const days = Math.max(
    1,
    Math.round((until.getTime() - since.getTime()) / 86400000)
  );
  return { since, until, days, label, isCustom };
}
