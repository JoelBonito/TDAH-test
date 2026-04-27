"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ASRS_OPTIONS, ASRS_QUESTIONS,
  COMORBIDITY_OPTIONS, COMORBIDITY_QUESTIONS,
  scoreAnswers,
} from "@/lib/asrs-data";

const ASRS_TOTAL = ASRS_QUESTIONS.length;
const COMORBIDITY_TOTAL = COMORBIDITY_QUESTIONS.length;

type Phase = "asrs" | "transition" | "comorbidity";

function ProgressBar({ current, total, phase }: { current: number; total: number; phase: Phase }) {
  const accent = "var(--tdah-accent)";
  const effectiveTotal = phase === "comorbidity" ? ASRS_TOTAL + COMORBIDITY_TOTAL : ASRS_TOTAL;
  const effectiveCurrent = phase === "comorbidity" ? ASRS_TOTAL + current : current;
  const pct = (effectiveCurrent / effectiveTotal) * 100;

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-2.5">
        <div className="text-[13px] font-medium" style={{ color: "var(--tdah-ink)" }}>
          Pergunta <span style={{ color: accent }}>{effectiveCurrent}</span> de {effectiveTotal}
        </div>
        <div className="text-[12px]" style={{ color: "var(--tdah-ink-soft)" }}>
          {Math.round(pct)}% concluído
        </div>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--tdah-accent-soft)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent, transition: "width 500ms cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
      <div className="flex items-center gap-[3px] mt-3">
        {Array.from({ length: effectiveTotal }).map((_, i) => {
          const state = i + 1 < effectiveCurrent ? "done" : i + 1 === effectiveCurrent ? "active" : "future";
          return (
            <div key={i} className="h-[3px] rounded-full flex-1" style={{
              background: state === "future" ? "var(--tdah-border)" : accent,
              opacity: state === "done" ? 0.4 : 1,
              transition: "background 300ms ease",
            }} />
          );
        })}
      </div>
    </div>
  );
}

interface OptionCardProps {
  value: number; label: string; hint: string;
  selected: boolean; hotkey: number; onSelect: (v: number) => void;
}

function OptionCard({ value, label, hint, selected, hotkey, onSelect }: OptionCardProps) {
  return (
    <button
      onClick={() => onSelect(value)}
      className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all hover:border-[var(--tdah-accent-ring)]"
      style={selected
        ? { background: "var(--tdah-accent-soft)", border: "1px solid var(--tdah-accent)", color: "var(--tdah-ink)" }
        : { background: "var(--tdah-surface)", border: "1px solid var(--tdah-border)", color: "var(--tdah-ink)" }
      }
    >
      <div className="flex items-center justify-center shrink-0 rounded-full" style={{
        width: 22, height: 22,
        border: `1.5px solid ${selected ? "var(--tdah-accent)" : "var(--tdah-ink-soft)"}`,
        background: selected ? "var(--tdah-accent)" : "transparent",
        transition: "all 200ms ease",
      }}>
        {selected && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6 L5 8.5 L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-medium leading-tight">{label}</div>
        <div className="text-[12.5px] mt-0.5" style={{ color: "var(--tdah-ink-soft)" }}>{hint}</div>
      </div>
      <kbd className="shrink-0 inline-flex items-center justify-center text-[11px] font-medium rounded-md" style={{
        width: 22, height: 22,
        background: "var(--tdah-bg)", border: "1px solid var(--tdah-border)",
        color: "var(--tdah-ink-soft)", fontFamily: "ui-monospace, monospace",
      }}>
        {hotkey}
      </kbd>
    </button>
  );
}

function TransitionScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center" style={{ animation: "fadeUp 400ms ease-out" }}>
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <div className="flex items-center justify-center rounded-2xl" style={{
          width: 72, height: 72,
          background: "var(--tdah-accent-soft)",
          border: "1px solid var(--tdah-border)",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--tdah-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8 V12 M12 16 h.01" />
          </svg>
        </div>
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight mb-3" style={{ color: "var(--tdah-ink)" }}>
            Mais 4 perguntas
          </h2>
          <p className="text-[15px] leading-relaxed" style={{ color: "var(--tdah-ink-muted)" }}>
            Seus indicadores sugerem possível TDAH. Para um relatório mais completo, vamos verificar condições que frequentemente aparecem junto — ansiedade e depressão.
          </p>
        </div>
        <div className="w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left" style={{ background: "var(--tdah-surface)", border: "1px solid var(--tdah-border)" }}>
          <span className="text-sm mt-0.5">💡</span>
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--tdah-ink-muted)" }}>
            Ansiedade e depressão podem imitar ou coexistir com TDAH. Identificá-las torna o laudo muito mais preciso.
          </p>
        </div>
        <button
          onClick={onContinue}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-[15px] font-medium transition-all hover:-translate-y-px"
          style={{
            background: "var(--tdah-accent)", color: "white",
            boxShadow: "0 1px 0 rgba(255,255,255,0.1) inset, 0 6px 16px -8px var(--tdah-accent)",
          }}
        >
          <span>Continuar</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8 H13 M9 4 L13 8 L9 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function QuestionnairePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("asrs");
  const [asrsIdx, setAsrsIdx] = useState(0);
  const [comorbidityIdx, setComorbidityIdx] = useState(0);
  const [asrsAnswers, setAsrsAnswers] = useState<(number | null)[]>(Array(ASRS_TOTAL).fill(null));
  const [comorbidityAnswers, setComorbidityAnswers] = useState<(number | null)[]>(Array(COMORBIDITY_TOTAL).fill(null));

  // Timing — ms per question
  const asrsTimings = useRef<number[]>(Array(ASRS_TOTAL).fill(0));
  const comorbidityTimings = useRef<number[]>(Array(COMORBIDITY_TOTAL).fill(0));
  const questionStartTime = useRef<number>(Date.now());

  const idx = phase === "comorbidity" ? comorbidityIdx : asrsIdx;
  const answers = phase === "comorbidity" ? comorbidityAnswers : asrsAnswers;
  const options = phase === "comorbidity" ? COMORBIDITY_OPTIONS : ASRS_OPTIONS;
  const questions = phase === "comorbidity" ? COMORBIDITY_QUESTIONS : ASRS_QUESTIONS;
  const selected = answers[idx];

  // Reset timer when question changes
  useEffect(() => {
    questionStartTime.current = Date.now();
  }, [idx, phase]);

  const recordTiming = useCallback(() => {
    const elapsed = Date.now() - questionStartTime.current;
    if (phase === "comorbidity") {
      comorbidityTimings.current[comorbidityIdx] = elapsed;
    } else {
      asrsTimings.current[asrsIdx] = elapsed;
    }
  }, [phase, asrsIdx, comorbidityIdx]);

  const setAnswer = useCallback((val: number) => {
    if (phase === "comorbidity") {
      setComorbidityAnswers((prev) => { const n = [...prev]; n[comorbidityIdx] = val; return n; });
    } else {
      setAsrsAnswers((prev) => { const n = [...prev]; n[asrsIdx] = val; return n; });
    }
  }, [phase, asrsIdx, comorbidityIdx]);

  const finishAndNavigate = useCallback((finalAsrsAnswers: (number | null)[], finalComorbidityAnswers?: (number | null)[]) => {
    sessionStorage.setItem("tdah_answers", JSON.stringify(finalAsrsAnswers.map((a) => a ?? 0)));
    sessionStorage.setItem("tdah_timings", JSON.stringify(asrsTimings.current));
    if (finalComorbidityAnswers) {
      sessionStorage.setItem("tdah_comorbidity", JSON.stringify(finalComorbidityAnswers.map((a) => a ?? 0)));
      sessionStorage.setItem("tdah_comorbidity_timings", JSON.stringify(comorbidityTimings.current));
    } else {
      sessionStorage.removeItem("tdah_comorbidity");
      sessionStorage.removeItem("tdah_comorbidity_timings");
    }
    router.push("/result");
  }, [router]);

  const goNext = useCallback(() => {
    if (selected == null) return;
    recordTiming();

    if (phase === "asrs") {
      if (asrsIdx < ASRS_TOTAL - 1) {
        setAsrsIdx((i) => i + 1);
      } else {
        // ASRS complete — check risk level
        const finalAnswers = [...asrsAnswers];
        finalAnswers[asrsIdx] = selected;
        const scoring = scoreAnswers(finalAnswers);
        if (scoring.riskLevel === "low") {
          finishAndNavigate(finalAnswers);
        } else {
          setAsrsAnswers(finalAnswers);
          setPhase("transition");
        }
      }
    } else if (phase === "comorbidity") {
      if (comorbidityIdx < COMORBIDITY_TOTAL - 1) {
        setComorbidityIdx((i) => i + 1);
      } else {
        const finalComorbidity = [...comorbidityAnswers];
        finalComorbidity[comorbidityIdx] = selected;
        finishAndNavigate(asrsAnswers, finalComorbidity);
      }
    }
  }, [selected, phase, asrsIdx, comorbidityIdx, asrsAnswers, comorbidityAnswers, recordTiming, finishAndNavigate]);

  const goPrev = useCallback(() => {
    if (phase === "comorbidity" && comorbidityIdx === 0) {
      setPhase("transition");
    } else if (phase === "comorbidity") {
      setComorbidityIdx((i) => i - 1);
    } else if (asrsIdx > 0) {
      setAsrsIdx((i) => i - 1);
    }
  }, [phase, asrsIdx, comorbidityIdx]);

  useEffect(() => {
    const maxKey = options.length;
    const onKey = (e: KeyboardEvent) => {
      if (phase === "transition") return;
      if (e.key >= "1" && e.key <= String(maxKey)) {
        setAnswer(parseInt(e.key, 10) - 1);
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, setAnswer, phase, options.length]);

  const accent = "var(--tdah-accent)";
  const current = idx + 1;
  const isLast = phase === "comorbidity" ? comorbidityIdx === COMORBIDITY_TOTAL - 1 : asrsIdx === ASRS_TOTAL - 1;
  const sectionLabel = phase === "comorbidity"
    ? (idx < 2 ? "Parte C · Ansiedade (GAD-2)" : "Parte C · Depressão (PHQ-2)")
    : (idx < 6 ? "Parte A · Triagem" : "Parte B · Sintomas adicionais");

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: "var(--tdah-bg)", color: "var(--tdah-ink)" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 30% at 50% 0%, var(--tdah-accent-softer) 0%, transparent 60%)" }} />

      {/* Header */}
      <header className="relative w-full px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
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
          <span className="text-[13px] font-medium" style={{ color: "var(--tdah-ink-muted)" }}>ASRS-v1.1</span>
        </div>
        <button onClick={() => router.push("/")} className="text-[12.5px] font-medium px-3 py-1.5 rounded-md transition-colors hover:bg-[var(--tdah-accent-soft)]" style={{ color: "var(--tdah-ink-soft)" }}>
          Sair
        </button>
      </header>

      {/* Transition screen */}
      {phase === "transition" && (
        <TransitionScreen onContinue={() => { setPhase("comorbidity"); questionStartTime.current = Date.now(); }} />
      )}

      {/* Question screen */}
      {phase !== "transition" && (
        <main className="relative flex-1 flex flex-col items-center px-4 sm:px-6">
          <div className="w-full max-w-[640px] flex flex-col">
            {/* Progress */}
            <div className="mb-12">
              <ProgressBar current={current} total={phase === "comorbidity" ? COMORBIDITY_TOTAL : ASRS_TOTAL} phase={phase} />
            </div>

            {/* Question */}
            <div key={`${phase}-${idx}`} className="mb-8" style={{ animation: "qFadeIn 350ms cubic-bezier(0.16,1,0.3,1)" }}>
              <div className="flex items-baseline gap-4 mb-3">
                <div className="text-[32px] sm:text-[44px] font-semibold leading-none tracking-tight tabular-nums" style={{ color: accent, opacity: 0.85 }}>
                  {String(phase === "comorbidity" ? ASRS_TOTAL + current : current).padStart(2, "0")}
                </div>
                <div className="text-[11px] uppercase tracking-[0.18em] font-medium" style={{ color: "var(--tdah-ink-soft)" }}>
                  {sectionLabel}
                </div>
              </div>
              <h2 className="text-[18px] sm:text-[22px] font-medium leading-[1.35] tracking-tight" style={{ color: "var(--tdah-ink)" }}>
                {questions[idx]}
              </h2>
              <p className="text-[13px] mt-3 italic" style={{ color: "var(--tdah-ink-soft)" }}>
                {phase === "comorbidity" ? "Pense nos últimos 2 meses." : "Considere como você se sentiu nos últimos 6 meses."}
              </p>
            </div>

            {/* Options */}
            <div key={`opts-${phase}-${idx}`} className="flex flex-col gap-2.5 mb-10" style={{ animation: "qFadeIn 450ms cubic-bezier(0.16,1,0.3,1) 60ms backwards" }}>
              {options.map((opt, i) => (
                <OptionCard key={opt.value} value={opt.value} label={opt.label} hint={opt.hint} selected={selected === opt.value} hotkey={i + 1} onSelect={setAnswer} />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pb-12">
              <button
                onClick={goPrev}
                disabled={phase === "asrs" && asrsIdx === 0}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14px] font-medium transition-all hover:bg-[var(--tdah-accent-soft)] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: "var(--tdah-ink-muted)" }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 8 H3 M7 4 L3 8 L7 12" /></svg>
                <span>Anterior</span>
              </button>

              <div className="text-[12px]" style={{ color: "var(--tdah-ink-soft)" }}>
                {selected == null ? "Selecione uma opção" : (
                  <span className="inline-flex items-center gap-1.5">
                    <kbd className="inline-flex items-center justify-center text-[10.5px] font-medium rounded-md px-1.5 py-0.5" style={{ background: "var(--tdah-surface)", border: "1px solid var(--tdah-border)", color: "var(--tdah-ink-muted)", fontFamily: "ui-monospace, monospace" }}>Enter</kbd>
                    <span>para avançar</span>
                  </span>
                )}
              </div>

              <button
                onClick={goNext}
                disabled={selected == null}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[14px] font-medium transition-all hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed"
                style={{
                  background: selected == null ? "var(--tdah-accent-soft)" : accent,
                  color: selected == null ? "var(--tdah-ink-soft)" : "white",
                  boxShadow: selected == null ? "none" : "0 1px 0 rgba(255,255,255,0.1) inset, 0 6px 16px -8px var(--tdah-accent)",
                }}
              >
                <span>{isLast ? "Finalizar" : "Próxima"}</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8 H13 M9 4 L13 8 L9 12" /></svg>
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
