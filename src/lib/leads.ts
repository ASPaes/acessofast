import { supabase } from "@/integrations/supabase/client";

export type LeadPayload = {
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  tecnicos: "1" | "2-5" | "6-20" | "20+";
  segmento: "MSP" | "Clinica" | "TI interno" | "Outro";
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
    nome: payload.nome,
    empresa: payload.empresa,
    email: payload.email,
    telefone: payload.telefone,
    tecnicos: payload.tecnicos,
    segmento: payload.segmento,
    mensagem: payload.mensagem ?? null,
    consentimento_lgpd: payload.consentimento_lgpd,
  });
  if (error) throw new Error(error.message);
}
