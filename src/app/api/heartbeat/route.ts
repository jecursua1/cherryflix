import { auth } from "@/auth";
import { heartbeat } from "@/lib/invites";

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return new Response("unauthorized", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const watchId =
    typeof body.watchId === "string" ? body.watchId : undefined;
  const title = typeof body.title === "string" ? body.title : undefined;

  await heartbeat(email, watchId, title);
  return Response.json({ ok: true });
}
