"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DATASET_NOTICE } from "@/data/network";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/demand", label: "Demand Prediction" },
  { href: "/routes", label: "Route Planning" },
  { href: "/analytics", label: "Analytics" },
  { href: "/about", label: "About" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      <div className="flex">
        <aside
          className={`fixed inset-y-0 z-40 w-64 border-r border-white/10 bg-[#0c1220] p-5 transition-transform lg:static lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Transit Analytics
          </p>
          <h1 className="mt-2 text-lg font-semibold leading-snug">
            Smart Public Transport Demand System
          </h1>
          <nav className="mt-8 space-y-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm ${
                    active
                      ? "bg-cyan-400/15 text-cyan-200"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <p className="mt-10 text-xs leading-relaxed text-slate-500">{DATASET_NOTICE}</p>
        </aside>

        <div className="min-h-screen flex-1 lg:ml-0">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#070b14]/90 px-4 py-3 backdrop-blur lg:hidden">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded-md border border-white/10 px-3 py-1.5 text-sm"
            >
              Menu
            </button>
            <span className="text-sm text-slate-300">Demand & Route Planning</span>
          </header>
          {open ? (
            <button
              aria-label="Close menu"
              className="fixed inset-0 z-30 bg-black/50 lg:hidden"
              onClick={() => setOpen(false)}
            />
          ) : null}
          <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 max-w-3xl text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-[#10192b] p-4 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </Card>
  );
}
