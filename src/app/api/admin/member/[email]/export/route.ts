import { auth } from "@/auth";
import { isAdmin, getMember, getMemberHistory, displayName } from "@/lib/invites";
import { resolveRange } from "@/lib/range";
import { toCsv } from "@/lib/csv";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return new Response("Forbidden", { status: 403 });
  }

  const { email: rawEmail } = await params;
  const email = decodeURIComponent(rawEmail);
  const member = await getMember(email);
  if (!member) return new Response("Not found", { status: 404 });

  const url = new URL(req.url);
  const { since, until, label } = resolveRange({
    days: url.searchParams.get("days") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
  });

  const history = await getMemberHistory(
    email,
    since.toISOString(),
    until.toISOString()
  );

  const csv = toCsv(
    ["Watched at", "Title", "Episode", "Watch ID"],
    history.map((h) => [
      new Date(h.watched_at).toISOString(),
      h.title_name ?? "",
      h.episode_label ?? "Movie",
      h.watch_id,
    ])
  );

  const header = toCsv(
    ["Member", "Email", "Range", "Views"],
    [[displayName(member), member.email, label, history.length]]
  );

  const body = `${header}\r\n\r\nHISTORY\r\n${csv}\r\n`;
  const safe = email.replace(/[^a-z0-9]+/gi, "_");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cherryflix-${safe}-${date}.csv"`,
    },
  });
}
