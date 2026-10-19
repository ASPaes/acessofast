import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Planos do site, lidos do banco. Ficam aqui (e não dentro do Pricing) porque o
// Otto também precisa deles: quando ele ajuda a escolher o plano, a indicação
// sai da mesma tabela que a grade de preços mostra, com o mesmo cache.

export const PLAN_COLUMNS =
  "code,name,price_month_cents,price_year_cents,max_users,max_concurrent_per_tech,is_custom,is_active,sort_order" as const;

export type Plan = Pick<
  Database["public"]["Tables"]["plans"]["Row"],
  | "code"
  | "name"
  | "price_month_cents"
  | "price_year_cents"
  | "max_users"
  | "max_concurrent_per_tech"
  | "is_custom"
  | "is_active"
  | "sort_order"
>;

export const PLANOS_QUERY_KEY = ["site", "plans"] as const;

/** Planos que oferecem os 7 dias grátis (botão "Testar 7 dias grátis" na grade). */
export const PLANOS_COM_TESTE: readonly string[] = ["team", "business"];

export async function buscarPlanos(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from("plans")
    .select(PLAN_COLUMNS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * O menor plano (na ordem da grade) que comporta a equipe: usuários e acessos
 * simultâneos por técnico. null no banco é "sem limite". Se nenhum plano de
 * prateleira couber, cai no plano sob medida.
 */
export function recomendarPlano(
  planos: Plan[],
  usuarios: number,
  simultaneos: number,
): Plan | undefined {
  const cabe = (p: Plan) =>
    (p.max_users ?? Infinity) >= usuarios && (p.max_concurrent_per_tech ?? Infinity) >= simultaneos;
  return planos.find((p) => !p.is_custom && cabe(p)) ?? planos.find((p) => p.is_custom);
}

// ---- destaque de um plano na grade ----
// O Otto pede, a grade de preços obedece. O pedido fica guardado até a grade
// existir: quem pede de outra página chega na home antes de ela montar.

const EVENTO_DESTAQUE = "acessofast:destacar-plano";
let planoPendente: string | null = null;

export function destacarPlano(code: string) {
  planoPendente = code;
  window.dispatchEvent(new CustomEvent(EVENTO_DESTAQUE));
}

/** Entrega o plano pedido, uma vez só, a quem montou a grade. */
export function ouvirDestaquePlano(aoPedir: (code: string) => void) {
  const entregar = () => {
    if (!planoPendente) return;
    const code = planoPendente;
    planoPendente = null;
    aoPedir(code);
  };
  entregar();
  window.addEventListener(EVENTO_DESTAQUE, entregar);
  return () => window.removeEventListener(EVENTO_DESTAQUE, entregar);
}
