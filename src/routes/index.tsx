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
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <Differentiators />
        <HowItWorks />
        <Pricing />
        <Faq />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
