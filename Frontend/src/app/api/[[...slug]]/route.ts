import { NextRequest, NextResponse } from 'next/server';

const IGNORED_REQUEST_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
]);

const BACKEND_API_BASE = process.env.BACKEND_API_INTERNAL_URL ?? 'http://127.0.0.1:8000/api';

type RouteContextParams = { slug?: string[] };
type RouteContext = { params: Promise<RouteContextParams> };

function buildTargetUrl(slug: string[] | undefined, search: string): string {
  const path = slug && slug.length > 0 ? `/${slug.join('/')}` : '';
  return `${BACKEND_API_BASE}${path}${search}`;
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const { slug } = params ?? {};
  const targetUrl = buildTargetUrl(slug, request.nextUrl.search);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!IGNORED_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const init: RequestInit & { duplex?: 'half' } = {
    method: request.method,
    headers,
    redirect: 'manual',
    cache: 'no-store',
  };

  if (request.body && request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
    init.duplex = 'half';
  }

  headers.set('x-forwarded-host', request.headers.get('host') ?? '');
  headers.set('x-forwarded-proto', request.nextUrl.protocol.replace(':', ''));
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    headers.set('x-forwarded-for', forwardedFor);
  }

  try {
    const backendResponse = await fetch(targetUrl, init);
    const responseHeaders = new Headers(backendResponse.headers);

    responseHeaders.delete('content-encoding');
    responseHeaders.delete('transfer-encoding');
    responseHeaders.delete('content-length');

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[Next API Proxy] Failed to proxy request to ${targetUrl}:`, error);
    return NextResponse.json(
      {
        detail: 'Erro ao contatar o backend. Tente novamente mais tarde.',
      },
      { status: 502 },
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function HEAD(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}
