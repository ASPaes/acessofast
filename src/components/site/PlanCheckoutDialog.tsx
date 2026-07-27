import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export type DialogAction = "subscribe" | "trial" | "free";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planCode: string;
  planName: string;
  action: DialogAction;
  billingCycle: "mensal" | "anual";
};

type Form = {
  empresa: string;
  email: string;
  telefone: string;
  documento: string;
  consentimento_lgpd: boolean;
};

const empty: Form = {
  empresa: "",
  email: "",
  telefone: "",
  documento: "",
  consentimento_lgpd: false,
};

// Mesmo visual dos campos do LeadForm (recriado aqui para não tocar naquele arquivo).
const inputCls =
  "h-11 w-full rounded-btn border border-border bg-surface px-3.5 text-[15px] text-text outline-none transition-all placeholder:text-text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10";

const GENERIC_ERROR = "Não foi possível concluir agora. Tente novamente em instantes.";

const ERROR_MESSAGES: Record<string, string> = {
  trial_already_used: "Este CPF/CNPJ já utilizou o período de teste.",
  email_already_registered: "Já existe uma conta com este e-mail. Faça login.",
  invalid_document: "CPF ou CNPJ inválido.",
  plan_not_eligible: "Este plano não está disponível para esta ação.",
  plan_not_self_serve: "Este plano não está disponível para esta ação.",
  plan_not_free: "Este plano não está disponível para esta ação.",
  document_already_used: "Este documento já possui uma conta.",
  rate_limited: "Muitas tentativas. Aguarde um instante e tente de novo.",
};

/** O corpo `{ error: "codigo" }` de uma resposta != 2xx chega em error.context (Response). */
async function messageFor(error: unknown): Promise<string> {
  let code = "";
  try {
    const context = (error as { context?: { json?: () => Promise<{ error?: string }> } })?.context;
    code = (await context?.json?.())?.error ?? "";
  } catch {
    // corpo ausente, não-JSON ou já consumido: cai na mensagem genérica.
  }
  return ERROR_MESSAGES[code] ?? GENERIC_ERROR;
}

const TITLES: Record<DialogAction, (planName: string) => string> = {
  subscribe: (planName) => `Assinar ${planName}`,
  trial: (planName) => `Testar ${planName} por 7 dias`,
  free: () => "Criar sua conta grátis",
};

const DESCRIPTIONS: Record<DialogAction, string> = {
  subscribe: "Preencha os dados para ir ao pagamento seguro.",
  trial: "7 dias grátis. Sem cartão de crédito.",
  free: "Comece agora, sem custo.",
};

export function PlanCheckoutDialog({
  open,
  onOpenChange,
  planCode,
  planName,
  action,
  billingCycle,
}: Props) {
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  // O pai zera o plano ao fechar; guardar o último mantém o título estável na animação de saída.
  const [plan, setPlan] = useState({ planCode, planName, action, billingCycle });

  useEffect(() => {
    if (!open) return;
    setPlan({ planCode, planName, action, billingCycle });
    setForm(empty);
    setErrors({});
    setStatus("idle");
  }, [open, planCode, planName, action, billingCycle]);

  const needsDocument = plan.action !== "subscribe";

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!form.empresa.trim()) e.empresa = "Informe sua empresa.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "E-mail inválido.";
    if (form.telefone.replace(/\D/g, "").length < 10) e.telefone = "Telefone inválido.";
    if (needsDocument) {
      const digits = form.documento.replace(/\D/g, "");
      if (digits.length !== 11 && digits.length !== 14) {
        e.documento = "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).";
      }
    }
    if (!form.consentimento_lgpd) e.consentimento_lgpd = "É necessário aceitar.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (status === "loading" || !validate()) return;
    setStatus("loading");

    const base = {
      company_name: form.empresa.trim(),
      admin_email: form.email.trim(),
      phone: form.telefone.trim(),
      plan_code: plan.planCode,
      consent: true,
    };

    try {
      if (plan.action === "subscribe") {
        const { data, error } = await supabase.functions.invoke("create-checkout-prod", {
          body: { ...base, billing_cycle: plan.billingCycle === "anual" ? "annual" : "monthly" },
        });
        if (error) {
          toast.error(await messageFor(error));
          setStatus("idle");
          return;
        }
        const checkoutUrl = (data as { checkout_url?: string } | null)?.checkout_url;
        if (!checkoutUrl) {
          toast.error(GENERIC_ERROR);
          setStatus("idle");
          return;
        }
        // Segue em "loading" até o navegador sair da página.
        window.location.href = checkoutUrl;
        return;
      }

      // Individual grátis provisiona sem expiração; trial nasce com 7 dias.
      const fn = plan.action === "free" ? "start-free-prod" : "start-trial-prod";
      const { data, error } = await supabase.functions.invoke(fn, {
        body: { ...base, document: form.documento.replace(/\D/g, "") },
      });
      if (error) {
        toast.error(await messageFor(error));
        setStatus("idle");
        return;
      }
      if ((data as { ok?: boolean } | null)?.ok !== true) {
        toast.error(GENERIC_ERROR);
        setStatus("idle");
        return;
      }
      setStatus("success");
    } catch (err) {
      console.error("[PlanCheckoutDialog] invoke error:", err);
      toast.error(GENERIC_ERROR);
      setStatus("idle");
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && status === "loading") return; // não fechar no meio do envio
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        {status === "success" ? (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-7 w-7" strokeWidth={1.75} />
            </div>
            <DialogHeader>
              <DialogTitle className="mt-5 text-2xl font-bold tracking-tight text-text sm:text-center">
                Conta criada! Verifique seu e-mail.
              </DialogTitle>
              <DialogDescription className="mt-2 text-[15px] text-text-muted sm:text-center">
                Enviamos um link para você definir sua senha e acessar o painel.
              </DialogDescription>
            </DialogHeader>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-btn bg-primary px-8 text-[15px] font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-hover"
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight text-text">
                {TITLES[plan.action](plan.planName)}
              </DialogTitle>
              <DialogDescription className="text-[15px] text-text-muted">
                {DESCRIPTIONS[plan.action]}
              </DialogDescription>
            </DialogHeader>

            <form
              className="mt-2"
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <div className="grid grid-cols-1 gap-4">
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
                {needsDocument && (
                  <Field label="CPF ou CNPJ" error={errors.documento}>
                    <input
                      className={inputCls}
                      value={form.documento}
                      onChange={(e) => set("documento", e.target.value)}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      inputMode="numeric"
                    />
                  </Field>
                )}
              </div>

              <label className="mt-5 flex items-start gap-3">
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
                type="submit"
                disabled={status === "loading"}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-primary text-[15px] font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-hover disabled:opacity-70"
              >
                {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
                {status === "loading"
                  ? plan.action === "subscribe"
                    ? "Redirecionando…"
                    : "Enviando…"
                  : plan.action === "subscribe"
                    ? "Ir para o pagamento"
                    : "Criar conta"}
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
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
