/** UTC calendar date string (YYYY-MM-DD) — used to reset daily counters. */
export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** ISO week string (e.g. "2026-W31") — used to reset weekly counters. UTC-based. */
export function currentWeekString(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}
