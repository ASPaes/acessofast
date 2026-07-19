import { supabase } from "@/integrations/supabase/client";

export type LeadPayload = {
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  tecnicos: "1" | "2-5" | "6-20" | "20+";
  segmento: "MSP" | "Revenda de software" | "Suporte / Help desk" | "TI interno" | "Outro";
  mensagem?: string;
  consentimento_lgpd: boolean;
};

export async function insertLead(payload: LeadPayload) {
  // A tabela `leads` é gerenciada fora do Lovable e não aparece em types.ts.
  // O cast abaixo evita erro de tipo sem afetar a chamada em runtime.
  const client = supabase as unknown as {
    from: (t: string) => {
      insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
    };
  };
  const { error } = await client.from("leads").insert({
    name: payload.nome,
    company: payload.empresa,
    email: payload.email,
    phone: payload.telefone,
    team_size: payload.tecnicos,
    segment: payload.segmento,
    message: payload.mensagem ?? null,
    consent: payload.consentimento_lgpd,
  });
  if (error) throw new Error(error.message);
}
