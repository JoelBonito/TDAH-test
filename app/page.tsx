"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function MindIcon({ size = 64 }: { size?: number }) {
  const color = "var(--tdah-accent)";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="32" cy="32" r="6" fill={color} stroke="none" />
      <circle cx="32" cy="32" r="14" opacity="0.7" />
      <circle cx="32" cy="32" r="22" opacity="0.35" />
      <circle cx="14" cy="20" r="2.5" fill={color} stroke="none" />
      <circle cx="50" cy="18" r="2.5" fill={color} stroke="none" />
      <circle cx="52" cy="46" r="2.5" fill={color} stroke="none" />
      <circle cx="12" cy="44" r="2.5" fill={color} stroke="none" />
      <line x1="14" y1="20" x2="32" y2="32" opacity="0.5" />
      <line x1="50" y1="18" x2="32" y2="32" opacity="0.5" />
      <line x1="52" y1="46" x2="32" y2="32" opacity="0.5" />
      <line x1="12" y1="44" x2="32" y2="32" opacity="0.5" />
    </svg>
  );
}

export default function WelcomePage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6"
      style={{ background: "var(--tdah-bg)", color: "var(--tdah-ink)" }}
    >
      {/* Ambient gradient backdrop */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, var(--tdah-accent-soft) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 50% 100%, var(--tdah-accent-softer) 0%, transparent 50%)",
        }}
      />

      <main
        className="relative w-full max-w-xl py-16 flex flex-col items-center text-center gap-7"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 600ms ease-out, transform 600ms ease-out",
        }}
      >
        {/* Icon with breathing halo */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "var(--tdah-accent-soft)",
              filter: "blur(20px)",
              animation: "breathe 4s ease-in-out infinite",
            }}
          />
          <div
            className="relative flex items-center justify-center rounded-2xl"
            style={{
              width: 88,
              height: 88,
              background: "var(--tdah-surface)",
              border: "1px solid var(--tdah-border)",
              boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px var(--tdah-accent-ring)",
            }}
          >
            <MindIcon size={52} />
          </div>
        </div>

        {/* Eyebrow */}
        <div className="text-xs uppercase tracking-[0.18em] font-medium" style={{ color: "var(--tdah-ink-soft)" }}>
          Auto-avaliação · ASRS-v1.1
        </div>

        {/* Title + Subtitle */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.1] tracking-tight" style={{ color: "var(--tdah-ink)" }}>
            Você pode ter TDAH?
          </h1>
          <p className="text-lg leading-relaxed max-w-md mx-auto" style={{ color: "var(--tdah-ink-muted)" }}>
            Uma ferramenta de auto-avaliação baseada na escala ASRS-v1.1 da Organização Mundial da Saúde.
          </p>
        </div>

        {/* Body copy */}
        <p className="text-[15px] leading-relaxed max-w-md mx-auto" style={{ color: "var(--tdah-ink-soft)" }}>
          Responda 18 perguntas simples e receba um relatório personalizado sobre seu perfil atencional.
        </p>

        {/* Disclaimer */}
        <div
          className="w-full max-w-md flex items-start gap-3 px-4 py-3 rounded-xl text-left"
          style={{ background: "var(--tdah-surface)", border: "1px solid var(--tdah-border)" }}
        >
          <span className="text-base leading-none mt-0.5" aria-hidden>⚠️</span>
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--tdah-ink-muted)" }}>
            Esta ferramenta{" "}
            <span style={{ color: "var(--tdah-ink)", fontWeight: 500 }}>não substitui</span>{" "}
            diagnóstico médico profissional. Use os resultados como ponto de partida para uma conversa com um especialista.
          </p>
        </div>

        {/* CTA */}
        <div className="w-full max-w-md flex flex-col items-center gap-4 pt-2">
          <button
            onClick={() => router.push("/questionnaire")}
            className="group w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-[15px] font-medium transition-all hover:-translate-y-px active:translate-y-0"
            style={{
              background: "var(--tdah-accent)",
              color: "white",
              boxShadow: "0 1px 0 rgba(255,255,255,0.1) inset, 0 6px 16px -8px var(--tdah-accent)",
            }}
          >
            <span>Iniciar Avaliação</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform">
              <path d="M3 8 H13 M9 4 L13 8 L9 12" />
            </svg>
          </button>

          <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--tdah-ink-soft)" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="6.5" />
              <path d="M8 4.5 V8 L10.5 9.5" />
            </svg>
            <span>~5 minutos · 18 perguntas · 100% privado</span>
          </div>
        </div>
      </main>
    </div>
  );
}
