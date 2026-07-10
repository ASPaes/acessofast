import { LeadForm } from "./LeadForm";

export function ContactSection() {
  return (
    <section id="contato" className="bg-surface-2 py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Fale com um especialista
          </p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
            Vamos desenhar a operação de acesso remoto ideal para o seu time.
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Preencha os dados e nosso time comercial entra em contato em até 1 dia útil com
            uma proposta sob medida — sem compromisso.
          </p>
          <ul className="mt-8 space-y-3 text-[15px] text-text">
            <li>· Atendimento consultivo em português</li>
            <li>· Piloto com sua equipe antes da contratação</li>
            <li>· Apoio total na migração de outra ferramenta</li>
          </ul>
        </div>
        <LeadForm />
      </div>
    </section>
  );
}
