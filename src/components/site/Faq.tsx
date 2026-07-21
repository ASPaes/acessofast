import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Como funciona a segurança e a criptografia?",
    a: "Toda sessão remota é criptografada ponta-a-ponta. O tráfego passa por relay próprio, com permissões granulares por dispositivo e grupo.",
  },
  {
    q: "Onde ficam meus dados? Está adequado à LGPD?",
    a: "Metadados de sessão (logs, address book, auditoria) ficam hospedados em região brasileira. Não armazenamos conteúdo das telas remotas. A plataforma foi desenhada para atender aos requisitos da LGPD.",
  },
  {
    q: "Como funciona a cobrança dos planos?",
    a: "Você escolhe um plano com um número definido de usuários e de acessos simultâneos por técnico, com endpoints ilimitados em todos eles. Preço fechado, sem cobrança por máquina gerenciada e sem excedente.",
  },
  {
    q: "Consigo migrar da minha ferramenta atual?",
    a: "Sim. Nosso time apoia a migração com deploy silencioso via MSI ou script, importação do inventário de dispositivos e treinamento breve para a equipe.",
  },
  {
    q: "Quais são os requisitos técnicos?",
    a: "Cliente para Windows, macOS e Linux. Requer apenas conexão de internet padrão — funciona atrás de NAT e proxy corporativo.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-28">
      <div className="mx-auto max-w-3xl px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
          Perguntas frequentes
        </p>
        <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
          Tudo o que você precisa saber.
        </h2>
        <Accordion type="single" collapsible className="mt-10 rounded-card border border-border bg-surface shadow-soft">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`} className="border-border px-6 last:border-b-0">
              <AccordionTrigger className="py-5 text-left text-[16px] font-semibold text-text hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-[15px] leading-relaxed text-text-muted">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
