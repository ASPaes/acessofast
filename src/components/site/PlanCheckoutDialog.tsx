import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, TicketPercent, AlertCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  checkPromoCode,
  promoBenefitLabel,
  promoReasonMessage,
  trialDaysWith,
  DESCONTO_NO_CHECKOUT_ATIVO,
  TRIAL_DAYS,
  type PromoCodeInfo,
} from "@/lib/promo-code";

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
  document_required_for_promo: "Informe o CPF ou CNPJ para usar um voucher.",
  rate_limited: "Muitas tentativas. Aguarde um instante e tente de novo.",
};

/** O corpo `{ error: "codigo" }` de uma resposta != 2xx chega em error.context (Response). */
async function messageFor(error: unknown): Promise<string> {
  let body: { error?: string; reason?: string } | undefined;
  try {
    const context = (
      error as { context?: { json?: () => Promise<{ error?: string; reason?: string }> } }
    )?.context;
    body = await context?.json?.();
  } catch {
    // corpo ausente, não-JSON ou já consumido: cai na mensagem genérica.
  }
  // O voucher pode ter caducado entre a validação na digitação e o envio.
  if (body?.error === "promo_code_invalid") return promoReasonMessage(body.reason);
  return ERROR_MESSAGES[body?.error ?? ""] ?? GENERIC_ERROR;
}

const TITLES: Record<DialogAction, (planName: string, trialDays: number) => string> = {
  subscribe: (planName) => `Assinar ${planName}`,
  trial: (planName, trialDays) => `Testar ${planName} por ${trialDays} dias`,
  free: () => "Criar sua conta grátis",
};

const DESCRIPTIONS: Record<DialogAction, (trialDays: number) => string> = {
  subscribe: () => "Preencha os dados para ir ao pagamento seguro.",
  trial: (trialDays) => `${trialDays} dias grátis. Sem cartão de crédito.`,
  free: () => "Comece agora, sem custo.",
};

type PromoState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "valid"; info: PromoCodeInfo }
  | { status: "invalid"; message: string };

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
  const [promo, setPromo] = useState("");
  const [promoState, setPromoState] = useState<PromoState>({ status: "idle" });
  // O pai zera o plano ao fechar; guardar o último mantém o título estável na animação de saída.
  const [plan, setPlan] = useState({ planCode, planName, action, billingCycle });

  useEffect(() => {
    if (!open) return;
    setPlan({ planCode, planName, action, billingCycle });
    setForm(empty);
    setErrors({});
    setStatus("idle");
    setPromo("");
    setPromoState({ status: "idle" });
  }, [open, planCode, planName, action, billingCycle]);

  // O desconto só existe no fluxo pago; os dias extras, só no teste.
  const showsVoucher =
    plan.action === "trial" || (plan.action === "subscribe" && DESCONTO_NO_CHECKOUT_ATIVO);

  const usandoVoucher = showsVoucher && promo.trim().length > 0;

  // O assinar não pede documento: quem coleta é o checkout do Asaas. Com voucher
  // ele vira obrigatório, porque é o doc_hash que impede a MESMA empresa de usar
  // o MESMO voucher duas vezes (uq_promo_redemptions_code_doc). Sem ele o único
  // limite seria o teto global de usos do código.
  const needsDocument = plan.action !== "subscribe" || usandoVoucher;

  const promoInfo = promoState.status === "valid" ? promoState.info : null;
  const trialDays = plan.action === "trial" ? trialDaysWith(promoInfo) : TRIAL_DAYS;

  // Consulta com atraso: o visitante ainda está digitando o código.
  useEffect(() => {
    if (!showsVoucher) return;
    const code = promo.trim().toUpperCase();
    if (code.length === 0) {
      setPromoState({ status: "idle" });
      return;
    }
    // Curto demais para existir: avisa na hora em vez de deixar "idle", que o
    // envio trataria como campo vazio e descartaria o que a pessoa digitou.
    if (code.length < 3) {
      setPromoState({ status: "invalid", message: promoReasonMessage("not_found") });
      return;
    }
    setPromoState({ status: "checking" });
    let cancelado = false;
    const timer = setTimeout(async () => {
      const resultado = await checkPromoCode(code, plan.planCode);
      if (cancelado) return;
      setPromoState(
        resultado.status === "valid"
          ? { status: "valid", info: resultado.info }
          : { status: "invalid", message: resultado.message },
      );
    }, 500);
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [promo, plan.planCode, showsVoucher]);

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
    // Código digitado mas ainda não confirmado (recusado ou em verificação):
    // barra o envio para não descartar o voucher em silêncio.
    if (showsVoucher && promo.trim() && promoState.status !== "valid") return false;
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (status === "loading" || !validate()) return;
    setStatus("loading");

    const codigoAplicado = promoState.status === "valid" ? promoState.info.code : undefined;

    const base = {
      company_name: form.empresa.trim(),
      admin_email: form.email.trim(),
      phone: form.telefone.trim(),
      plan_code: plan.planCode,
      consent: true,
      ...(showsVoucher && codigoAplicado ? { promo_code: codigoAplicado } : {}),
    };

    try {
      if (plan.action === "subscribe") {
        const { data, error } = await supabase.functions.invoke("create-checkout-prod", {
          body: {
            ...base,
            billing_cycle: plan.billingCycle === "anual" ? "annual" : "monthly",
            // Só vai junto com voucher: é o que amarra o resgate à empresa.
            ...(needsDocument ? { document: form.documento.replace(/\D/g, "") } : {}),
          },
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

  // Renderizado em posições diferentes conforme o fluxo (ver o JSX abaixo).
  const campoDocumento = (
    <Field
      label={plan.action === "subscribe" ? "CPF ou CNPJ (para o voucher)" : "CPF ou CNPJ"}
      error={errors.documento}
    >
      <input
        className={inputCls}
        value={form.documento}
        onChange={(e) => set("documento", e.target.value)}
        placeholder="000.000.000-00 ou 00.000.000/0000-00"
        inputMode="numeric"
      />
    </Field>
  );

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
                {plan.action === "trial" && ` Seu teste de ${trialDays} dias já começou.`}
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
                {TITLES[plan.action](plan.planName, trialDays)}
              </DialogTitle>
              <DialogDescription className="text-[15px] text-text-muted">
                {DESCRIPTIONS[plan.action](trialDays)}
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
                {/* No assinar o documento só existe por causa do voucher, então
                    ele vem DEPOIS do código — aparecer acima empurraria o input
                    que a pessoa está digitando. */}
                {needsDocument && plan.action !== "subscribe" && campoDocumento}
                {showsVoucher && (
                  <Field label="Voucher (opcional)">
                    <input
                      className={`${inputCls} uppercase placeholder:normal-case ${
                        promoState.status === "invalid" ? "border-danger focus:border-danger" : ""
                      }`}
                      value={promo}
                      onChange={(e) => setPromo(e.target.value.toUpperCase())}
                      placeholder="Código do parceiro"
                      autoComplete="off"
                      spellCheck={false}
                      maxLength={32}
                    />
                    <PromoFeedback state={promoState} action={plan.action} />
                  </Field>
                )}
                {needsDocument && plan.action === "subscribe" && campoDocumento}
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
                disabled={status === "loading" || promoState.status === "checking"}
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

/** Retorno da consulta do voucher, logo abaixo do campo. */
function PromoFeedback({ state, action }: { state: PromoState; action: DialogAction }) {
  if (state.status === "idle") return null;

  if (state.status === "checking") {
    return (
      <span className="mt-1.5 flex items-center gap-1.5 text-sm text-text-muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Verificando…
      </span>
    );
  }

  if (state.status === "invalid") {
    return (
      <span className="mt-1.5 flex items-center gap-1.5 text-sm text-danger">
        <AlertCircle className="h-3.5 w-3.5 flex-none" />
        {state.message}
      </span>
    );
  }

  // Válido, mas o benefício pode não valer para a ação em curso (ex.: voucher só
  // de desconto num fluxo de teste grátis).
  const beneficio =
    action === "trial" || action === "subscribe" ? promoBenefitLabel(state.info, action) : null;

  return (
    <span className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-success">
      <TicketPercent className="h-3.5 w-3.5 flex-none" />
      {beneficio ?? "Voucher aplicado."}
    </span>
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
