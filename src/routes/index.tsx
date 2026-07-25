import { useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { TrustBar } from "@/components/site/TrustBar";
import { Features } from "@/components/site/Features";
import { Differentiators } from "@/components/site/Differentiators";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Pricing } from "@/components/site/Pricing";
import { Faq } from "@/components/site/Faq";
import { ContactSection } from "@/components/site/ContactSection";
import { PlanCheckoutDialog, type DialogAction } from "@/components/site/PlanCheckoutDialog";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

// O Pricing só envia o code; o nome de exibição do plano vive aqui.
const PLAN_NAMES: Record<string, string> = {
  individual: "AcessoFast Individual",
  team: "AcessoFast Team",
  business: "AcessoFast Business",
  scale: "AcessoFast Scale",
  enterprise: "AcessoFast Enterprise",
};

type Checkout = {
  planCode: string;
  planName: string;
  action: DialogAction;
  billingCycle: "mensal" | "anual";
};

function Index() {
  const [checkout, setCheckout] = useState<Checkout | null>(null);

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <Differentiators />
        <HowItWorks />
        <Pricing
          onSelectPlan={(planCode, action, billingCycle) => {
            if (action === "contact") {
              document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
              return;
            }
            setCheckout({
              planCode,
              planName: PLAN_NAMES[planCode] ?? planCode,
              action,
              billingCycle,
            });
          }}
        />
        <Faq />
        <ContactSection />
      </main>
      <Footer />
      <PlanCheckoutDialog
        open={!!checkout}
        onOpenChange={(o) => {
          if (!o) setCheckout(null);
        }}
        planCode={checkout?.planCode ?? ""}
        planName={checkout?.planName ?? ""}
        action={checkout?.action ?? "subscribe"}
        billingCycle={checkout?.billingCycle ?? "mensal"}
      />
    </div>
  );
}
