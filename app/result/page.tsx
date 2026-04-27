"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { scoreAnswers, scoreComorbidities, type RiskLevel, type ScoringResult, type ComorbidityResult } from "@/lib/asrs-data";
import type { PdfData } from "@/lib/generate-pdf";

const RISK_CONFIG: Record<RiskLevel, { label: string; hue: number }> = {
  low:      { label: "Risco Baixo",    hue: 145 },
  moderate: { label: "Risco Moderado", hue: 75 },
  high:     { label: "Risco Elevado",  hue: 25 },
};

function RiskBadge({ result }: { result: ScoringResult }) {
  const cfg = RISK_CONFIG[result.riskLevel];
  const softColor = `oklch(96% 0.045 ${cfg.hue})`;
  const fillColor = `oklch(70% 0.16 ${cfg.hue})`;
  const inkColor  = `oklch(35% 0.12 ${cfg.hue})`;
  const ringColor = `oklch(88% 0.08 ${cfg.hue})`;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-5" style={{ width: 96, height: 96 }}>
        <div className="absolute inset-0 rounded-full" style={{ background: softColor, animation: "pulseSoft 3.5s ease-in-out infinite" }} />
        <div className="absolute inset-2 rounded-full" style={{ background: `oklch(92% 0.06 ${cfg.hue})` }} />
        <div className="absolute flex items-center justify-center rounded-full" style={{ inset: 14, background: fillColor, boxShadow: `0 8px 24px -8px ${fillColor}` }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9 V13" /><circle cx="12" cy="16.5" r="0.6" fill="white" stroke="none" /><circle cx="12" cy="12" r="9" />
          </svg>
        </div>
      </div>
      <div className="text-[11px] uppercase tracking-[0.2em] font-medium mb-2" style={{ color: "var(--tdah-ink-soft)" }}>Resultado da triagem</div>
      <h2 className="text-[34px] font-semibold leading-none tracking-tight mb-2.5" style={{ color: inkColor }}>{cfg.label}</h2>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-medium" style={{ background: softColor, color: inkColor, border: `1px solid ${ringColor}` }}>
        <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: fillColor }} />
        {result.subtype}
      </div>
    </div>
  );
}

function ScoreBreakdown({ result }: { result: ScoringResult }) {
  const accent = "var(--tdah-accent)";
  const parts = [
    { label: "Parte A · Triagem",            score: result.partAScore, max: 6,  weight: "Indicador principal (OMS)" },
    { label: "Parte B · Sintomas adicionais", score: Math.round(result.partBTotal / 4), max: 12, weight: "Contexto clínico complementar" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {parts.map((p) => {
        const pct = (p.score / p.max) * 100;
        return (
          <div key={p.label} className="rounded-xl p-4" style={{ background: "var(--tdah-surface)", border: "1px solid var(--tdah-border)" }}>
            <div className="text-[11px] uppercase tracking-[0.14em] font-medium mb-3" style={{ color: "var(--tdah-ink-soft)" }}>{p.label}</div>
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-[28px] font-semibold tabular-nums leading-none" style={{ color: "var(--tdah-ink)" }}>{p.score}</span>
              <span className="text-[14px] tabular-nums" style={{ color: "var(--tdah-ink-soft)" }}>/ {p.max}</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--tdah-accent-soft)" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent, transition: "width 800ms ease-out" }} />
            </div>
            <div className="text-[11.5px] mt-2.5" style={{ color: "var(--tdah-ink-soft)" }}>{p.weight}</div>
          </div>
        );
      })}
    </div>
  );
}

function ComorbiditySection({ comorbidity }: { comorbidity: ComorbidityResult }) {
  const items = [
    { label: "Ansiedade (GAD-2)", score: comorbidity.anxietyScore, max: 6, positive: comorbidity.anxietyPositive },
    { label: "Depressão (PHQ-2)", score: comorbidity.depressionScore, max: 6, positive: comorbidity.depressionPositive },
  ];

  return (
    <section className="mb-12">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="text-[20px] font-semibold tracking-tight" style={{ color: "var(--tdah-ink)" }}>Fatores Associados</h3>
        <div className="text-[12px]" style={{ color: "var(--tdah-ink-soft)" }}>GAD-2 + PHQ-2</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => {
          const hue = item.positive ? 25 : 145;
          const softColor = `oklch(96% 0.04 ${hue})`;
          const inkColor  = `oklch(38% 0.1 ${hue})`;
          const barColor  = `oklch(65% 0.15 ${hue})`;
          const pct = (item.score / item.max) * 100;

          return (
            <div key={item.label} className="rounded-xl p-4" style={{ background: softColor, border: `1px solid oklch(88% 0.06 ${hue})` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[12px] uppercase tracking-[0.12em] font-medium" style={{ color: inkColor }}>{item.label}</div>
                <div className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: `oklch(90% 0.08 ${hue})`, color: inkColor }}>
                  {item.positive ? "Indicadores presentes" : "Sem indicadores"}
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-[24px] font-semibold tabular-nums leading-none" style={{ color: inkColor }}>{item.score}</span>
                <span className="text-[13px] tabular-nums" style={{ color: `oklch(55% 0.08 ${hue})` }}>/ {item.max}</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: `oklch(90% 0.06 ${hue})` }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor, transition: "width 800ms ease-out" }} />
              </div>
              <div className="text-[11.5px] mt-2" style={{ color: `oklch(55% 0.08 ${hue})` }}>
                {item.positive ? "Pontuação acima do limiar clínico (≥ 3)" : "Pontuação abaixo do limiar clínico (< 3)"}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function NextStepItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-xl transition-all hover:translate-x-0.5" style={{ background: "var(--tdah-surface)", border: "1px solid var(--tdah-border)" }}>
      <div className="shrink-0 flex items-center justify-center rounded-lg" style={{ width: 40, height: 40, background: "var(--tdah-accent-soft)", color: "var(--tdah-accent)" }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-medium" style={{ color: "var(--tdah-ink)" }}>{title}</div>
        <div className="text-[13px] mt-1 leading-relaxed" style={{ color: "var(--tdah-ink-muted)" }}>{description}</div>
      </div>
      <div className="shrink-0 self-center" style={{ color: "var(--tdah-ink-soft)" }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4 L10 8 L6 12" /></svg>
      </div>
    </div>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const [scoring, setScoring] = useState<ScoringResult | null>(null);
  const [comorbidity, setComorbidity] = useState<ComorbidityResult | null>(null);
  const [laudo, setLaudo] = useState<string>("");
  const [loadingLaudo, setLoadingLaudo] = useState(true);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const pdfDataRef = useRef<PdfData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("tdah_answers");
    if (!raw) { router.push("/"); return; }

    const answers: number[] = JSON.parse(raw);
    const timings: number[] = JSON.parse(sessionStorage.getItem("tdah_timings") ?? "[]");
    const result = scoreAnswers(answers);
    setScoring(result);

    const rawComorbidity = sessionStorage.getItem("tdah_comorbidity");
    let comorbidityResult: ComorbidityResult | null = null;
    let comorbidityAnswers: number[] | null = null;
    if (rawComorbidity) {
      comorbidityAnswers = JSON.parse(rawComorbidity);
      comorbidityResult = scoreComorbidities(comorbidityAnswers!);
      setComorbidity(comorbidityResult);
    }

    fetch("/api/laudo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, scoring: result, timings, comorbidity: comorbidityResult, comorbidityAnswers }),
    })
      .then((r) => r.json())
      .then((data) => {
        const text = data.laudo ?? "";
        setLaudo(text);
        pdfDataRef.current = {
          scoring: result,
          comorbidity: comorbidityResult,
          laudo: text,
          date: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
        };
      })
      .catch(() => setLaudo(""))
      .finally(() => setLoadingLaudo(false));
  }, [router]);

  const handleDownloadPdf = async () => {
    if (!pdfDataRef.current) return;
    const { generatePdf } = await import("@/lib/generate-pdf");
    const bytes = await generatePdf(pdfDataRef.current);
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-tdah-${new Date().toISOString().slice(0, 10)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendEmail = async () => {
    if (!pdfDataRef.current || !email) return;
    setEmailStatus("sending");
    try {
      const { generatePdf } = await import("@/lib/generate-pdf");
      const bytes = await generatePdf(pdfDataRef.current);
      const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          scoring: pdfDataRef.current.scoring,
          comorbidity: pdfDataRef.current.comorbidity,
          laudo: pdfDataRef.current.laudo,
          pdfBase64: base64,
        }),
      });
      setEmailStatus(res.ok ? "sent" : "error");
    } catch {
      setEmailStatus("error");
    }
  };

  if (!scoring) return null;

  const accent = "var(--tdah-accent)";

  return (
    <div className="min-h-screen w-full" style={{ background: "var(--tdah-bg)", color: "var(--tdah-ink)" }}>
      <header className="w-full px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between border-b" style={{ borderColor: "var(--tdah-border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="rounded-md flex items-center justify-center" style={{ width: 28, height: 28, background: "var(--tdah-accent-soft)" }}>
            <svg width="16" height="16" viewBox="0 0 64 64" fill="none" stroke="var(--tdah-accent)" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="32" cy="32" r="6" fill="var(--tdah-accent)" stroke="none" />
              <circle cx="32" cy="32" r="14" opacity="0.6" />
              <circle cx="14" cy="20" r="3" fill="var(--tdah-accent)" stroke="none" />
              <circle cx="50" cy="18" r="3" fill="var(--tdah-accent)" stroke="none" />
              <circle cx="52" cy="46" r="3" fill="var(--tdah-accent)" stroke="none" />
            </svg>
          </div>
          <span className="text-[13px] font-medium" style={{ color: "var(--tdah-ink-muted)" }}>ASRS-v1.1 · Relatório</span>
        </div>
        <div className="text-[12px]" style={{ color: "var(--tdah-ink-soft)" }}>
          {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
        </div>
      </header>

      <main className="w-full max-w-[760px] mx-auto px-4 sm:px-6 py-8 sm:py-12" style={{ animation: "fadeUp 500ms ease-out" }}>
        <div className="text-center mb-10">
          <div className="text-[12px] uppercase tracking-[0.18em] font-medium mb-2" style={{ color: "var(--tdah-ink-soft)" }}>Avaliação concluída</div>
          <h1 className="text-[32px] sm:text-[42px] font-semibold tracking-tight leading-none" style={{ color: "var(--tdah-ink)" }}>Seu Resultado</h1>
        </div>

        <section className="mb-10"><RiskBadge result={scoring} /></section>
        <section className="mb-12"><ScoreBreakdown result={scoring} /></section>

        {comorbidity && <ComorbiditySection comorbidity={comorbidity} />}

        <section className="mb-12">
          <div className="flex items-baseline justify-between mb-5">
            <h3 className="text-[20px] font-semibold tracking-tight" style={{ color: "var(--tdah-ink)" }}>Seu Laudo</h3>
            <div className="text-[12px]" style={{ color: "var(--tdah-ink-soft)" }}>Análise personalizada</div>
          </div>
          <div className="rounded-2xl p-7 text-[15px] leading-[1.7]" style={{ background: "var(--tdah-surface)", border: "1px solid var(--tdah-border)", color: "var(--tdah-ink-muted)" }}>
            {loadingLaudo ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 rounded-md animate-pulse" style={{ background: "var(--tdah-accent-soft)", width: i === 3 ? "60%" : "100%" }} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {laudo.split("\n\n").filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
              </div>
            )}
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-[20px] font-semibold tracking-tight mb-5" style={{ color: "var(--tdah-ink)" }}>Próximos Passos</h3>
          <div className="flex flex-col gap-2.5">
            <NextStepItem icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3 V8 A4 4 0 0 0 14 8 V3" /><path d="M10 12 V15 A5 5 0 0 0 18 18.5" /><circle cx="18" cy="14" r="2.5" /></svg>} title="Consultar um psiquiatra ou neurologista" description="Profissionais especializados podem confirmar ou descartar o diagnóstico através de avaliação clínica detalhada." />
            <NextStepItem icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.2 11 L15.8 7 M8.2 13 L15.8 17" /></svg>} title="Compartilhe este resultado com seu médico" description="Leve este relatório como ponto de partida para a consulta. Ele ajuda a estruturar a conversa." />
            <NextStepItem icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4 H10 A3 3 0 0 1 13 7 V20 A2 2 0 0 0 11 18 H4 Z" /><path d="M20 4 H14 A3 3 0 0 0 11 7 V20 A2 2 0 0 1 13 18 H20 Z" /></svg>} title="Saiba mais sobre TDAH em adultos" description="Conteúdo curado por especialistas: sintomas, comorbidades, tratamentos e estratégias de manejo." />
          </div>
        </section>

        {/* PDF + Email actions */}
        <section className="mb-10 rounded-2xl p-6 flex flex-col gap-5" style={{ background: "var(--tdah-surface)", border: "1px solid var(--tdah-border)" }}>
          <div>
            <h3 className="text-[16px] font-semibold mb-1" style={{ color: "var(--tdah-ink)" }}>Salvar seu relatório</h3>
            <p className="text-[13px]" style={{ color: "var(--tdah-ink-soft)" }}>Baixe o PDF ou receba por email para guardar ou levar ao médico.</p>
          </div>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={loadingLaudo}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14px] font-medium transition-all hover:bg-[var(--tdah-accent-soft)] disabled:opacity-40"
            style={{ background: "var(--tdah-bg)", border: "1px solid var(--tdah-border)", color: "var(--tdah-ink-muted)" }}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2 V10 M5 7 L8 10 L11 7" /><path d="M2 12 H14 V14 H2 Z" />
            </svg>
            Baixar PDF
          </button>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailStatus("idle"); }}
                placeholder="seu@email.com"
                className="flex-1 px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                style={{
                  background: "var(--tdah-bg)",
                  border: `1px solid ${emailStatus === "error" ? "oklch(65% 0.2 25)" : "var(--tdah-border)"}`,
                  color: "var(--tdah-ink)",
                }}
              />
              <button
                onClick={handleSendEmail}
                disabled={!email || loadingLaudo || emailStatus === "sending" || emailStatus === "sent"}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14px] font-medium transition-all hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
                style={{ background: accent, color: "white", boxShadow: `0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 12px -6px var(--tdah-accent)`, whiteSpace: "nowrap" }}
              >
                {emailStatus === "sending" ? (
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 A10 10 0 0 1 22 12" /></svg>
                ) : emailStatus === "sent" ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 8 L6 12 L14 4" /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4 L8 9 L14 4 M2 4 H14 V12 H2 Z" /></svg>
                )}
                {emailStatus === "sending" ? "Enviando…" : emailStatus === "sent" ? "Enviado!" : "Enviar"}
              </button>
            </div>
            {emailStatus === "sent" && (
              <p className="text-[12px]" style={{ color: "oklch(50% 0.15 145)" }}>✓ Email enviado com o relatório em PDF em anexo.</p>
            )}
            {emailStatus === "error" && (
              <p className="text-[12px]" style={{ color: "oklch(55% 0.2 25)" }}>Falha ao enviar. Verifique o email e tente novamente.</p>
            )}
          </div>
        </section>

        {/* Restart */}
        <section className="flex justify-center mb-10">
          <button onClick={() => { sessionStorage.clear(); router.push("/"); }} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14px] font-medium transition-all hover:-translate-y-px active:translate-y-0" style={{ background: accent, color: "white", boxShadow: `0 1px 0 rgba(255,255,255,0.1) inset, 0 6px 16px -8px ${accent}` }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8 a5 5 0 0 1 9 -3 M12 5 V2 M12 5 H15" /><path d="M13 8 a5 5 0 0 1 -9 3 M4 11 V14 M4 11 H1" /></svg>
            Refazer Avaliação
          </button>
        </section>

        <div className="text-center text-[12.5px] py-5 px-6 rounded-xl" style={{ border: "1px dashed var(--tdah-border)", color: "var(--tdah-ink-soft)" }}>
          ⚠ Este resultado é uma <span style={{ color: "var(--tdah-ink-muted)", fontWeight: 500 }}>triagem</span>, não um diagnóstico clínico. A ASRS-v1.1 é uma ferramenta de rastreio validada pela OMS, mas o diagnóstico de TDAH requer avaliação presencial por profissional qualificado.
        </div>
      </main>
    </div>
  );
}
