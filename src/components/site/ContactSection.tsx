import { useState } from "react";
import { LeadForm, type EstadoLead } from "./LeadForm";
import { Otto, type OttoEstado } from "@/components/otto/otto";

// O Otto acompanha o formulário: olha para o campo que está sendo preenchido
// (seguirMouse também segue o campo em foco), avisa quando falta alguma coisa e
// comemora o envio.
const OTTO_DO_FORMULARIO: Record<EstadoLead, { cara: OttoEstado; fala: string }> = {
  inicio: { cara: "ola", fala: "Preenche aqui do lado que o time responde em até 1 dia útil." },
  preenchendo: { cara: "parado", fala: "Isso! Tô de olho, pode seguir." },
  faltando: {
    cara: "aguardando",
    fala: "Faltou alguma coisa ali. Dá uma olhada nos campos em vermelho.",
  },
  enviando: { cara: "conectando", fala: "Enviando…" },
  enviado: { cara: "concluido", fala: "Recebido! Logo o time fala com você." },
  falhou: { cara: "erro", fala: "Ops, não consegui enviar agora. Tenta de novo em instantes?" },
};

export function ContactSection() {
  const [estado, setEstado] = useState<EstadoLead>("inicio");
  const otto = OTTO_DO_FORMULARIO[estado];

  return (
    <section id="contato" className="py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 lg:grid-cols-2">
        <div>
          <div className="mb-6 flex items-center gap-4">
            <Otto estado={otto.cara} seguirMouse className="w-24 sm:w-28" />
            <p
              aria-live="polite"
              className="otto-fala max-w-xs rounded-2xl border border-border bg-surface px-4 py-2.5 text-[15px] leading-snug text-text shadow-soft"
            >
              {otto.fala}
            </p>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Fale com um especialista
          </p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
            Vamos desenhar a operação de acesso remoto ideal para o seu time.
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Preencha os dados e nosso time comercial entra em contato em até 1 dia útil com uma
            proposta sob medida — sem compromisso.
          </p>
          <ul className="mt-8 space-y-3 text-[15px] text-text">
            <li>· Atendimento consultivo em português</li>
            <li>· Piloto com sua equipe antes da contratação</li>
            <li>· Apoio total na migração de outra ferramenta</li>
          </ul>
        </div>
        <LeadForm onEstado={setEstado} />
      </div>
    </section>
  );
}
