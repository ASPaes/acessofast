import {
  MonitorSmartphone,
  Monitor,
  FolderInput,
  Video,
  BookUser,
  FileClock,
  RefreshCw,
} from "lucide-react";

const features = [
  { icon: MonitorSmartphone, title: "Acesso não assistido", desc: "Conecte-se a máquinas sem ninguém do outro lado, com permissões por dispositivo." },
  { icon: Monitor, title: "Multi-monitor", desc: "Navegue por todos os monitores remotos com alternância rápida e nitidez preservada." },
  { icon: FolderInput, title: "Transferência de arquivos", desc: "Envie e receba arquivos durante a sessão, com verificação de integridade." },
  { icon: Video, title: "Gravação de sessão", desc: "Grave atendimentos para auditoria, treinamento e compliance interno." },
  { icon: BookUser, title: "Address book", desc: "Organize dispositivos por cliente, tags e grupos com busca instantânea." },
  { icon: FileClock, title: "Auditoria e logs", desc: "Registro completo de quem conectou, quando, onde e por quanto tempo." },
  { icon: RefreshCw, title: "Reconexão pós-reboot", desc: "Sessão volta sozinha após reinicialização, sem perder o atendimento." },
];

export function Features() {
  return (
    <section id="recursos" className="py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Recursos
          </p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
            Tudo que sua operação precisa, em uma única plataforma.
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Sem plugins pagos, sem módulos extras. Todo recurso essencial já vem no assento.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-card border border-border bg-surface p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-text">{title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
