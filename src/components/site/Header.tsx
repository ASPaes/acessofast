import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/acessofast-logo-real.png.asset.json";

const nav = [
  { href: "#recursos", label: "Recursos" },
  { href: "#diferenciais", label: "Diferenciais" },
  { href: "#preco", label: "Preço" },
  { href: "#faq", label: "FAQ" },
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
        <a href="#top" className="flex items-center gap-2" aria-label="Acessofast">
          <img
            src={logoAsset.url}
            alt="Acessofast"
            className="h-10 w-auto"
            width={256}
            height={195}
          />
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-text-muted transition-colors hover:text-text"
            >
              {n.label}
            </a>
          ))}
          <Link to="/baixar" className="text-sm font-medium text-text-muted transition-colors hover:text-text">Baixar</Link>
        </nav>
        <a
          href="#contato"
          className="inline-flex h-10 items-center justify-center rounded-btn bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-hover hover:-translate-y-[1px]"
        >
          Falar com especialista
        </a>
      </div>
    </header>
  );
}
