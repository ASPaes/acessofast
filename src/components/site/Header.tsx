import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/acessofast-logo-real.png.asset.json";
import { Otto } from "@/components/otto/otto";

const nav = [
  { href: "/#recursos", label: "Recursos" },
  { href: "/#diferenciais", label: "Diferenciais" },
  { href: "/#preco", label: "Preço" },
  { href: "/#faq", label: "FAQ", soNoXl: true },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <a href="/#top" className="flex items-center gap-2" aria-label="Acessofast">
          <img
            src={logoAsset.url}
            alt="Acessofast"
            className="h-10 w-auto"
            width={256}
            height={195}
          />
          <span className="text-lg font-semibold tracking-tight text-text">AcessoFast</span>
        </a>
        {/* Oito links: no lg o espaço é contado, por isso o vão menor e o FAQ só a partir do xl. */}
        <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className={
                "text-sm font-medium text-text-muted transition-colors hover:text-text" +
                ("soNoXl" in n && n.soNoXl ? " hidden xl:inline" : "")
              }
            >
              {n.label}
            </a>
          ))}
          <Link
            to="/como-surgiu"
            className="text-sm font-medium text-text-muted transition-colors hover:text-text"
          >
            Como surgiu
          </Link>
          <Link
            to="/otto"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text"
          >
            <Otto estado="parado" animado={false} seguirMouse className="w-6" />
            Otto
          </Link>
          <Link
            to="/android"
            className="text-sm font-medium text-text-muted transition-colors hover:text-text"
          >
            Android
          </Link>
          <Link
            to="/download"
            className="text-sm font-medium text-text-muted transition-colors hover:text-text"
          >
            Baixar
          </Link>
        </nav>
        <a
          href="/#contato"
          data-otto-feliz
          className="inline-flex h-10 items-center justify-center rounded-btn bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-hover hover:-translate-y-[1px]"
        >
          Falar com especialista
        </a>
      </div>
    </header>
  );
}
