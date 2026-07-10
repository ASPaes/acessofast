import { useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { insertLead, type LeadPayload } from "@/lib/leads";

type Form = {
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  tecnicos: LeadPayload["tecnicos"] | "";
  segmento: LeadPayload["segmento"] | "";
  mensagem: string;
  consentimento_lgpd: boolean;
};

const empty: Form = {
  nome: "",
  empresa: "",
  email: "",
  telefone: "",
  tecnicos: "",
  segmento: "",
  mensagem: "",
  consentimento_lgpd: false,
};

const inputCls =
  "h-11 w-full rounded-btn border border-border bg-surface px-3.5 text-[15px] text-text outline-none transition-all placeholder:text-text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10";

export function LeadForm() {
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!form.nome.trim()) e.nome = "Informe seu nome.";
    if (!form.empresa.trim()) e.empresa = "Informe sua empresa.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "E-mail inválido.";
    if (form.telefone.replace(/\D/g, "").length < 10) e.telefone = "Telefone inválido.";
    if (!form.tecnicos) e.tecnicos = "Selecione uma opção.";
    if (!form.segmento) e.segmento = "Selecione uma opção.";
    if (!form.consentimento_lgpd) e.consentimento_lgpd = "É necessário aceitar.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setStatus("loading");
    try {
      await insertLead({
        nome: form.nome.trim(),
        empresa: form.empresa.trim(),
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        tecnicos: form.tecnicos as LeadPayload["tecnicos"],
        segmento: form.segmento as LeadPayload["segmento"],
        mensagem: form.mensagem.trim() || undefined,
        consentimento_lgpd: true,
      });
      setStatus("success");
    } catch (err) {
      console.error("[LeadForm] insert error:", err);
      toast.error("Não foi possível enviar agora. Tente novamente em instantes.");
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-card border border-border bg-surface p-10 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <h3 className="mt-5 text-2xl font-bold tracking-tight text-text">
          Recebemos seus dados.
        </h3>
        <p className="mt-2 text-[15px] text-text-muted">
          Nosso time entra em contato em breve para agendar a demonstração.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-soft sm:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome" error={errors.nome}>
          <input
            className={inputCls}
            value={form.nome}
            onChange={(e) => set("nome", e.target.value)}
            placeholder="Como podemos te chamar"
            autoComplete="name"
          />
        </Field>
        <Field label="Empresa" error={errors.empresa}>
          <input
            className={inputCls}
            value={form.empresa}
            onChange={(e) => set("empresa", e.target.value)}
            placeholder="Nome da empresa"
            autoComplete="organization"
          />
        </Field>
        <Field label="E-mail corporativo" error={errors.email}>
          <input
            type="email"
            className={inputCls}
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="voce@empresa.com.br"
            autoComplete="email"
          />
        </Field>
        <Field label="Telefone / WhatsApp" error={errors.telefone}>
          <input
            type="tel"
            className={inputCls}
            value={form.telefone}
            onChange={(e) => set("telefone", e.target.value)}
            placeholder="(11) 99999-0000"
            autoComplete="tel"
          />
        </Field>
        <Field label="Número de técnicos" error={errors.tecnicos}>
          <select
            className={inputCls}
            value={form.tecnicos}
            onChange={(e) => set("tecnicos", e.target.value as Form["tecnicos"])}
          >
            <option value="">Selecione</option>
            <option value="1">1</option>
            <option value="2-5">2 a 5</option>
            <option value="6-20">6 a 20</option>
            <option value="20+">Mais de 20</option>
          </select>
        </Field>
        <Field label="Segmento" error={errors.segmento}>
          <select
            className={inputCls}
            value={form.segmento}
            onChange={(e) => set("segmento", e.target.value as Form["segmento"])}
          >
            <option value="">Selecione</option>
            <option value="MSP">MSP</option>
            <option value="Clinica">Clínica</option>
            <option value="TI interno">TI interno</option>
            <option value="Outro">Outro</option>
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Mensagem (opcional)">
            <textarea
              className={`${inputCls} h-28 py-3 leading-relaxed`}
              value={form.mensagem}
              onChange={(e) => set("mensagem", e.target.value)}
              placeholder="Conte um pouco sobre sua operação"
              rows={4}
            />
          </Field>
        </div>
      </div>

      <label className="mt-6 flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
          checked={form.consentimento_lgpd}
          onChange={(e) => set("consentimento_lgpd", e.target.checked)}
        />
        <span className="text-sm text-text-muted">
          Concordo com o tratamento dos meus dados conforme a{" "}
          <a href="/privacidade" className="font-medium text-primary hover:underline">
            Política de Privacidade
          </a>
          . *
        </span>
      </label>
      {errors.consentimento_lgpd && (
        <p className="mt-1 text-sm text-danger">{errors.consentimento_lgpd}</p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={status === "loading"}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-primary text-[15px] font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-hover disabled:opacity-70 sm:w-auto sm:px-8"
      >
        {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "loading" ? "Enviando…" : "Solicitar demonstração"}
      </button>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-text">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-danger">{error}</span>}
    </label>
  );
}
