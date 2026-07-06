import {
  displayName,
  formatDuration,
  rowSegment,
  type MemberRangeRow,
} from "./invites";

export const SEGMENTS = ["active", "inactive", "pending"] as const;
export type Segment = (typeof SEGMENTS)[number];

export const COLUMNS = [
  { key: "name", label: "Member" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
  { key: "time", label: "Watch time" },
  { key: "views", label: "Views" },
  { key: "lastseen", label: "Last seen" },
  { key: "invited", label: "Invited" },
] as const;
export type ColKey = (typeof COLUMNS)[number]["key"];
export const DEFAULT_COLS: ColKey[] = COLUMNS.map((c) => c.key);

type SP = Record<string, string | string[] | undefined>;
const arr = (v: string | string[] | undefined): string[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

/** Parse selected segments + columns from query params (defaults when unsubmitted). */
export function parseReportSelection(sp: SP): {
  submitted: boolean;
  segs: Segment[];
  cols: ColKey[];
} {
  const submitted = sp.submitted === "1";
  if (!submitted) {
    return { submitted, segs: [...SEGMENTS], cols: [...DEFAULT_COLS] };
  }
  const segs = arr(sp.seg).filter((s): s is Segment =>
    (SEGMENTS as readonly string[]).includes(s)
  );
  const cols = arr(sp.col).filter((c): c is ColKey =>
    COLUMNS.some((x) => x.key === c)
  );
  return { submitted, segs, cols };
}

/** Plain value for a cell (used by CSV export). */
export function csvValue(key: ColKey, r: MemberRangeRow): string | number {
  switch (key) {
    case "name":
      return displayName(r);
    case "email":
      return r.email;
    case "status":
      return r.watching_now ? "watching" : rowSegment(r);
    case "time":
      return formatDuration(r.seconds);
    case "views":
      return r.views;
    case "lastseen":
      return r.last_seen ? new Date(r.last_seen).toISOString() : "";
    case "invited":
      return r.invited_at ? new Date(r.invited_at).toISOString() : "";
  }
}
