// AcessoFast — promo-restore-sweep
// Rede de seguranca da janela de desconto do voucher.
//
// O caminho normal e a asaas-webhook-prod: ao contabilizar a N-esima cobranca
// paga ela ja devolve o preco cheio na assinatura. Se aquele PUT falhar (Asaas
// fora do ar, 5xx, timeout), a janela fica 'active' com payments_counted >= N e
// ninguem mais mexe nela ate a proxima cobranca — ou seja, o cliente ganharia
// um mes extra de desconto. Este sweep varre essas janelas e refaz o PUT.
//
// No caminho feliz ele nao acha nada e sai em uma consulta.
//
// verify_jwt = TRUE: nao ha chamador anonimo. Quem chama e o pg_cron com a
// service_role key no Authorization, que ja e um JWT valido do projeto.
import { createClient } from "npm:@supabase/supabase-js@2";

const ASAAS_API = "https://api.asaas.com/v3";
const ASAAS_KEY = Deno.env.get("ASAAS_API_KEY_PROD")!;
const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const LIMITE = 50;

const j = (b, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });

async function restaurarValorAsaas(subscriptionId, fullCents) {
  try {
    const r = await fetch(`${ASAAS_API}/subscriptions/${subscriptionId}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        access_token: ASAAS_KEY,
        "User-Agent": "AcessoFast/1.0",
      },
      body: JSON.stringify({ value: fullCents / 100, updatePendingPayments: true }),
    });
    const body = await r.json().catch(() => null);
    if (!r.ok) {
      return { ok: false, detail: `asaas_${r.status}: ${JSON.stringify(body?.errors ?? body).slice(0, 300)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, detail: `asaas_unreachable: ${String(e).slice(0, 300)}` };
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST" && req.method !== "GET") return j({ error: "method_not_allowed" }, 405);
  if (!ASAAS_KEY) return j({ error: "server_misconfig", detail: "ASAAS_API_KEY_PROD ausente" }, 500);

  const db = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });

  const { data, error } = await db.rpc("promo_windows_due_restore", { p_limit: LIMITE });
  if (error) {
    console.error("promo_windows_due_restore failed:", error.message);
    return j({ error: "db_error", detail: error.message }, 500);
  }

  const janelas = Array.isArray(data) ? data : [];
  if (janelas.length === 0) return j({ ok: true, pendentes: 0, restauradas: 0, falhas: 0 });

  let restauradas = 0, falhas = 0;

  // Sequencial de proposito: sao poucas linhas e nao vale martelar a API do
  // Asaas em paralelo quando o motivo provavel da pendencia e justamente ela
  // estar instavel.
  for (const w of janelas) {
    const r = await restaurarValorAsaas(w.asaas_subscription_id, w.full_value_cents);
    if (r.ok) {
      restauradas++;
      const { error: e } = await db.rpc("promo_window_mark_restored", { p_window_id: w.window_id });
      if (e) console.error("promo_window_mark_restored failed:", e.message);
    } else {
      falhas++;
      console.error("sweep: PUT falhou para", w.asaas_subscription_id, r.detail);
      const { error: e } = await db.rpc("promo_window_mark_failed", {
        p_window_id: w.window_id, p_error: r.detail,
      });
      if (e) console.error("promo_window_mark_failed failed:", e.message);
    }
  }

  return j({ ok: true, pendentes: janelas.length, restauradas, falhas });
});
