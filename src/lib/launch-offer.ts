import { supabase } from "@/integrations/supabase/client";

/**
 * Oferta de lancamento: desconto sobre o preco de tabela enquanto sobrar vaga
 * entre as N primeiras empresas contratantes.
 *
 * A regra mora no banco (public.launch_offer_status), nao aqui: o mesmo numero
 * que o visitante ve na vitrine e o que a create-checkout-prod cobra no Asaas.
 * Este arquivo so busca o status e repete o arredondamento do checkout.
 */
export type LaunchOffer = {
  /** Ja combina "ligada" com "ainda tem vaga": true = pode aplicar o desconto. */
  is_active: boolean;
  discount_percent: number;
  /**
   * Meses de cobranca com o preco promocional no plano mensal; depois disso a
   * assinatura volta ao preco de tabela (quem devolve e a janela criada pela
   * create-checkout-prod). null = sem prazo. No anual nao se aplica: a cobranca
   * unica ja cobre o periodo.
   */
  discount_months: number | null;
  slots_total: number;
  /** Limitado a slots_total pelo banco — a barra nunca passa de 100%. */
  slots_taken: number;
  slots_left: number;
};

export async function fetchLaunchOffer(): Promise<LaunchOffer | null> {
  const { data, error } = await supabase.rpc("launch_offer_status");
  if (error) {
    console.error("[launch-offer] status falhou:", error.message);
    return null;
  }
  // A function retorna table(...): sempre uma linha.
  const row = Array.isArray(data) ? data[0] : data;
  return row ?? null;
}

/**
 * Mesmo arredondamento da create-checkout-prod. Se os dois divergirem, a
 * vitrine promete um valor e o Asaas cobra outro.
 */
export function applyLaunchDiscount(cents: number, percent: number): number {
  return Math.round((cents * (100 - percent)) / 100);
}

/** true quando o desconto vale para este plano: so plano pago com preco. */
export function offerAppliesTo(priceCents: number | null | undefined): boolean {
  return typeof priceCents === "number" && priceCents > 0;
}
