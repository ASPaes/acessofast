// AcessoFast — validate-promo-code
// Consulta SEM efeito colateral: o site comercial chama enquanto o visitante
// digita o voucher, so para mostrar o beneficio antes de enviar o formulario.
// Quem de fato resgata (e queima o uso) e a start-trial-prod / o checkout.
//
// verify_jwt = FALSE: chamado pelo site comercial (visitante anonimo).
// As tabelas promo_codes/promo_code_redemptions nao tem grant para anon —
// so esta funcao (service_role) enxerga o catalogo.
import { createClient } from "npm:@supabase/supabase-js@2";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
  "access-control-allow-methods": "POST, OPTIONS",
};
const j = (b, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json", ...CORS } });

// Mesmo fail-open das outras functions: rate limit nao pode derrubar o funil.
async function rlAllows(db, key, limit, win) {
  try {
    const { data, error } = await db.rpc("rl_hit", { p_key: key, p_limit: limit, p_window_seconds: win });
    if (error) { console.error("rl_hit error (fail-open):", error.message); return true; }
    return data !== false;
  } catch (e) { console.error("rl_hit threw (fail-open):", String(e)); return true; }
}
function clientIp(req) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) { const f = xff.split(/\s*,\s*/)[0]; if (f) return f.trim(); }
  return (req.headers.get("x-real-ip") ?? "").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return j({ error: "method_not_allowed" }, 405);

  let b; try { b = await req.json(); } catch { return j({ error: "invalid_json" }, 400); }

  const code = String(b.code ?? "").trim().toUpperCase().slice(0, 32);
  const plan_code = String(b.plan_code ?? "").trim().toLowerCase() || null;

  if (!code) return j({ ok: false, reason: "not_found" });

  const db = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });

  // Teto por IP: a consulta e anonima e serve para adivinhar codigos.
  const ip = clientIp(req);
  if (ip && !(await rlAllows(db, "pc:ip:" + ip, 30, 3600))) return j({ error: "rate_limited" }, 429);

  const { data, error } = await db.rpc("promo_code_preview", {
    p_code: code, p_plan_code: plan_code,
  });
  if (error) {
    console.error("promo_code_preview failed:", error.message);
    return j({ error: "db_error" }, 500);
  }

  // A RPC retorna table(...): sempre 1 linha.
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.ok) return j({ ok: false, reason: row?.reason ?? "not_found" });

  return j({
    ok: true,
    code: row.code,
    description: row.description ?? null,
    extra_trial_days: row.extra_trial_days ?? 0,
    discount_percent: row.discount_percent ?? null,
    discount_months: row.discount_months ?? null,
  });
});
