import { getServerAuthHandler } from "@keyhole/services/AuthService";
import type { NextRequest } from "next/server";

type Context = { params: Promise<{ nextauth: string[] }> };

export async function GET(request: NextRequest, context: Context) {
  const params = await context.params;
  const handler = getServerAuthHandler();
  return handler(request, { params });
}

export async function POST(request: NextRequest, context: Context) {
  const params = await context.params;
  const handler = getServerAuthHandler();
  return handler(request, { params });
}
