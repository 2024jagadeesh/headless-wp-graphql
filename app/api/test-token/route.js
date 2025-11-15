import { getAccessToken } from "@/lib/wpAuth";

export async function GET() {
  const token = await getAccessToken();
  return new Response(JSON.stringify({ token }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
