import { auth } from "@/auth";
import { isAdmin, getDashboardLive } from "@/lib/invites";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return new Response("Forbidden", { status: 403 });
  }
  const data = await getDashboardLive();
  return Response.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
