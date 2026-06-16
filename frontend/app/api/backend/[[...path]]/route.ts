import type { NextRequest } from "next/server";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

type Context = {
  params: Promise<{ path?: string[] }>;
};

async function proxy(request: NextRequest, context: Context) {
  const { path = [] } = await context.params;
  const target = new URL(path.join("/"), `${backendUrl}/`);
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const response = await fetch(target, {
    method: request.method,
    headers,
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
    cache: "no-store",
    redirect: "manual",
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
