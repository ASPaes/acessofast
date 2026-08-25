import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// www.* redireciona para o apex: o Google indexa uma origem so, e a URL que o
// cliente ve bate com a que o checkout usa para montar os links de retorno
// (SITE em supabase/functions/create-checkout-prod).
// GET/HEAD levam 301 (o que todo crawler entende); qualquer outro metodo leva
// 308, que preserva o metodo — um POST de server function vindo de uma aba
// ainda aberta no www nao pode virar GET no meio do caminho.
function apexRedirect(request: Request): Response | undefined {
  const url = new URL(request.url);
  if (!url.hostname.startsWith("www.")) return undefined;

  url.hostname = url.hostname.slice("www.".length);
  const status = request.method === "GET" || request.method === "HEAD" ? 301 : 308;
  return new Response(null, { status, headers: { location: url.toString() } });
}

// /baixar virou /download em 25/08/2026. O link do instalador circula fora do
// site (WhatsApp do tecnico, e-mail, material impresso), entao o path antigo
// nao pode virar 404 — redireciona com 301 preservando a query.
function baixarRedirect(request: Request): Response | undefined {
  const url = new URL(request.url);
  if (url.pathname !== "/baixar" && url.pathname !== "/baixar/") return undefined;

  url.pathname = "/download";
  return new Response(null, { status: 301, headers: { location: url.toString() } });
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const redirect = apexRedirect(request) ?? baixarRedirect(request);
      if (redirect) return redirect;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
