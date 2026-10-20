export type ContributionDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

export type ContributionYear = {
  year: number;
  days: ContributionDay[];
  total: number;
  activeDays: number;
  longestStreak: number;
  currentStreak: number;
  best?: ContributionDay;
  /** total contributions per month, January first */
  months: number[];
};

/** Refresh the calendar every six hours; pages that render it inherit this through ISR. */
export const CONTRIBUTIONS_REVALIDATE = 21600;

const attr = (tag: string, name: string) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];

/**
 * Reads the public contribution calendar GitHub renders on profiles.
 * No token needed; returns undefined when GitHub is unreachable or the markup changes.
 */
export async function getContributions(user: string, year: number): Promise<ContributionYear | undefined> {
  try {
    const response = await fetch(`https://github.com/users/${user}/contributions?from=${year}-01-01&to=${year}-12-31`, {
      next: { revalidate: CONTRIBUTIONS_REVALIDATE },
      headers: { "User-Agent": "lucasritterdias.com.br" },
    });
    if (!response.ok) return undefined;
    const html = await response.text();

    // the cells carry date and level; the exact count lives in a tooltip pointing at the cell id
    const counts = new Map<string, number>();
    for (const [, id, label] of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
      counts.set(id, Number(label.match(/^(\d+)/)?.[1] ?? 0));
    }

    const days: ContributionDay[] = [];
    for (const [tag] of html.matchAll(/<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g)) {
      const date = attr(tag, "data-date");
      if (!date?.startsWith(String(year))) continue;
      const id = attr(tag, "id") ?? "";
      const level = Math.min(4, Number(attr(tag, "data-level") ?? 0)) as ContributionDay["level"];
      days.push({ date, level, count: counts.get(id) ?? (level ? 1 : 0) });
    }
    if (!days.length) return undefined;
    return summarize(year, days.sort((a, b) => a.date.localeCompare(b.date)));
  } catch {
    return undefined;
  }
}

function summarize(year: number, days: ContributionDay[]): ContributionYear {
  const today = new Date().toISOString().slice(0, 10);
  const past = days.filter((day) => day.date <= today);
  const months = Array.from({ length: 12 }, () => 0);
  let total = 0;
  let activeDays = 0;
  let longestStreak = 0;
  let run = 0;
  let best: ContributionDay | undefined;

  for (const day of past) {
    total += day.count;
    months[Number(day.date.slice(5, 7)) - 1] += day.count;
    if (day.count > 0) {
      activeDays++;
      run++;
      longestStreak = Math.max(longestStreak, run);
      if (!best || day.count > best.count) best = day;
    } else {
      run = 0;
    }
  }

  // today without commits yet doesn't break the current streak
  let currentStreak = 0;
  for (let i = past.length - 1; i >= 0; i--) {
    if (past[i].count > 0) currentStreak++;
    else if (past[i].date !== today) break;
  }

  return { year, days, total, activeDays, longestStreak, currentStreak, best, months };
}
