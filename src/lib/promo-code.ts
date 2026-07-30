import { supabase } from "@/integrations/supabase/client";

/** Dias de teste padrao, sem voucher. Espelha TRIAL_DAYS da start-trial-prod. */
export const TRIAL_DAYS = 7;

/**
 * O desconto percentual so vira realidade quando a `create-checkout-prod`
 * souber ler `promo_code` e mandar o valor com desconto para o Asaas. Enquanto
 * isso for false, o campo de voucher nao aparece no fluxo de assinatura — nao
 * adianta prometer desconto que a cobranca nao aplica. Os dias extras de trial
 * ja funcionam ponta a ponta.
 * Ao atualizar a create-checkout-prod, virar para true e conferir o resgate.
 */
export const DESCONTO_NO_CHECKOUT_ATIVO = false;

export type PromoCodeInfo = {
  code: string;
  description: string | null;
  extra_trial_days: number;
  discount_percent: number | null;
  /** null = desconto em todas as cobrancas enquanto a assinatura durar. */
  discount_months: number | null;
};

type PreviewResponse = ({ ok: true } & PromoCodeInfo) | { ok: false; reason?: string };

const REASON_MESSAGES: Record<string, string> = {
  not_found: "Voucher não encontrado.",
  inactive: "Este voucher não está mais ativo.",
  not_started: "Este voucher ainda não está válido.",
  expired: "Este voucher expirou.",
  plan_not_eligible: "Este voucher não vale para o plano escolhido.",
  exhausted: "Este voucher atingiu o limite de usos.",
  already_used: "Este voucher já foi utilizado por este CPF/CNPJ.",
};

export function promoReasonMessage(reason?: string): string {
  return REASON_MESSAGES[reason ?? ""] ?? "Não foi possível validar o voucher.";
}

export type PromoCheck =
  | { status: "valid"; info: PromoCodeInfo }
  | { status: "invalid"; message: string };

/**
 * Consulta o voucher sem resgatar. Serve so para o visitante ver o beneficio
 * antes de enviar; quem queima o uso e a start-trial-prod, no envio.
 */
export async function checkPromoCode(code: string, planCode: string): Promise<PromoCheck> {
  const { data, error } = await supabase.functions.invoke<PreviewResponse>("validate-promo-code", {
    body: { code, plan_code: planCode },
  });

  if (error || !data) {
    return { status: "invalid", message: promoReasonMessage() };
  }
  if (!data.ok) {
    return { status: "invalid", message: promoReasonMessage(data.reason) };
  }
  return { status: "valid", info: data };
}

function plural(n: number, singular: string, plural_: string) {
  return `${n} ${n === 1 ? singular : plural_}`;
}

/** "nos 3 primeiros meses" / "na primeira cobrança" / "em todas as cobranças". */
function discountWindowLabel(months: number | null): string {
  if (months === null) return "em todas as cobranças";
  if (months === 1) return "na primeira cobrança";
  return `nos ${months} primeiros meses`;
}

/**
 * Frase do beneficio para a acao em curso. Um voucher pode carregar dias e
 * desconto; nem sempre os dois valem no fluxo escolhido — quando nenhum vale,
 * devolve null e a UI diz so que o codigo foi aceito.
 */
export function promoBenefitLabel(
  info: PromoCodeInfo,
  action: "trial" | "subscribe",
): string | null {
  const partes: string[] = [];

  if (action === "trial" && info.extra_trial_days > 0) {
    const total = TRIAL_DAYS + info.extra_trial_days;
    partes.push(
      `${plural(total, "dia", "dias")} de teste — ${TRIAL_DAYS} + ${info.extra_trial_days} do voucher`,
    );
  }

  if (action === "subscribe" && info.discount_percent !== null) {
    partes.push(
      `${info.discount_percent}% de desconto ${discountWindowLabel(info.discount_months)}`,
    );
  }

  return partes.length > 0 ? partes.join(" · ") : null;
}

/** Dias totais de teste com o voucher aplicado (7 quando nao ha voucher). */
export function trialDaysWith(info: PromoCodeInfo | null): number {
  return TRIAL_DAYS + (info?.extra_trial_days ?? 0);
}
