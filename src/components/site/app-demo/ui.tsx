import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { DeviceStatus } from "./data";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--af-border)] bg-[var(--af-card)]/80 backdrop-blur-[2px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PanelTitle({
  icon,
  title,
  subtitle,
  right,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-[15px] font-semibold text-[var(--af-text)]">{title}</h3>
        </div>
        {subtitle ? (
          <p className="mt-0.5 text-[12px] text-[var(--af-text-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {right}
    </div>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-[26px] font-semibold tracking-tight text-[var(--af-text)]">{title}</h1>
      <p className="mt-1 text-[12.5px] text-[var(--af-text-muted)]">{subtitle}</p>
    </div>
  );
}

/* Cabeçalho e célula de tabela — as três telas repetem o mesmo desenho. */
export function Th({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <th
      className={cn(
        "px-3 pb-2 text-left text-[11.5px] font-medium text-[var(--af-text-muted)]",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ className, children }: { className?: string; children?: ReactNode }) {
  return <td className={cn("px-3 py-2.5 text-[12.5px] align-middle", className)}>{children}</td>;
}

export function Tr({ children }: { children: ReactNode }) {
  return (
    <tr className="border-t border-[var(--af-border-soft)] transition-colors hover:bg-white/[0.025]">
      {children}
    </tr>
  );
}

const STATUS_STYLE: Record<DeviceStatus, { label: string; dot: string; cls: string }> = {
  online: {
    label: "Online",
    dot: "bg-[var(--af-green)]",
    cls: "border-[var(--af-green)]/30 bg-[var(--af-green)]/10 text-[var(--af-green)]",
  },
  atendimento: {
    label: "Em atendimento",
    dot: "bg-[var(--af-amber)]",
    cls: "border-[var(--af-amber)]/35 bg-[var(--af-amber)]/10 text-[var(--af-amber)]",
  },
  offline: {
    label: "Offline",
    dot: "bg-[var(--af-text-faint)]",
    cls: "border-[var(--af-border)] bg-white/[0.03] text-[var(--af-text-muted)]",
  },
};

export function StatusPill({ status, suffix }: { status: DeviceStatus; suffix?: string }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-[3px] text-[11px] font-medium whitespace-nowrap",
        s.cls,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
      {suffix ? ` · ${suffix}` : null}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[5px] border border-[var(--af-blue)]/30 bg-[var(--af-blue)]/12 px-1.5 py-[1px] text-[10px] font-medium text-[var(--af-blue-text)]">
      {children}
    </span>
  );
}

export function Toggle({ label }: { label: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-[18px] w-[32px] items-center rounded-full border border-[var(--af-border)] bg-white/[0.04] p-[2px]">
        <span className="h-[12px] w-[12px] rounded-full bg-[var(--af-text-faint)]" />
      </span>
      <span className="text-[12px] text-[var(--af-text-muted)]">{label}</span>
    </div>
  );
}

export function FakeSelect({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[34px] items-center justify-between gap-2 rounded-lg border border-[var(--af-border)] bg-white/[0.03] px-3 text-[12.5px] text-[var(--af-text)]">
      {children}
    </div>
  );
}
