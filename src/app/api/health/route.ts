import { jsonResponse } from "@/lib/http";

export async function GET() {
  return jsonResponse({ status: "ok" });
}
