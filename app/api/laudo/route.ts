import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest, NextResponse } from "next/server";
import type { ScoringResult, ComorbidityResult } from "@/lib/asrs-data";

function analyzeTimings(timings: number[]): string {
  if (!timings.length) return "";
  const lines: string[] = [];
  timings.forEach((ms, i) => {
    if (ms <= 0) return;
    const secs = (ms / 1000).toFixed(1);
    if (ms < 3000) lines.push(`Pergunta ${i + 1}: ${secs}s (resposta muito rápida)`);
    else if (ms > 20000) lines.push(`Pergunta ${i + 1}: ${secs}s (resposta demorada)`);
  });
  return lines.length ? `\nDados comportamentais (tempo de resposta):\n${lines.join("\n")}` : "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      answers,
      scoring,
      timings = [],
      comorbidity,
      comorbidityAnswers,
    }: {
      answers: number[];
      scoring: ScoringResult;
      timings: number[];
      comorbidity: ComorbidityResult | null;
      comorbidityAnswers: number[] | null;
    } = body;

    const riskLabel =
      scoring.riskLevel === "high" ? "Risco Elevado"
      : scoring.riskLevel === "moderate" ? "Risco Moderado"
      : "Risco Baixo";

    const comorbiditySection = comorbidity
      ? `\nTriagem de comorbidades (GAD-2 + PHQ-2):
- Ansiedade (GAD-2): ${comorbidity.anxietyScore}/6 — ${comorbidity.anxietyPositive ? "POSITIVO (≥3)" : "negativo"}
- Depressão (PHQ-2): ${comorbidity.depressionScore}/6 — ${comorbidity.depressionPositive ? "POSITIVO (≥3)" : "negativo"}
- Respostas: ${comorbidityAnswers?.join(", ") ?? "N/A"}`
      : "\nTriagem de comorbidades: não realizada (risco baixo no ASRS)";

    const timingSection = analyzeTimings(timings);

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `Você é um psicólogo clínico especialista em TDAH em adultos.
Escreva laudos de triagem empáticos, claros e baseados em evidências.
Use linguagem acessível, sem jargão excessivo. Seja honesto mas acolhedor.
Quando houver dados de comorbidades, integre-os ao raciocínio clínico — diferencie TDAH puro, TDAH com comorbidades ou possível confusão diagnóstica.
Quando houver dados de tempo de resposta, mencione apenas se forem clinicamente relevantes.
SEMPRE finalize lembrando que é uma triagem, não um diagnóstico.
Responda em português brasileiro.`,
      prompt: `O usuário completou a escala ASRS-v1.1 de auto-avaliação de TDAH em adultos.

Resultados ASRS:
- Nível de risco: ${riskLabel}
- Pontuação Parte A (triagem, máx 6 positivos): ${scoring.partAScore}/6
- Pontuação bruta Parte A: ${scoring.partATotal}/24
- Pontuação bruta Parte B: ${scoring.partBTotal}/48
- Perfil detectado: ${scoring.subtype}
- Respostas Parte A: ${answers.slice(0, 6).join(", ")}
- Respostas Parte B: ${answers.slice(6).join(", ")}
(Escala ASRS: 0=Nunca, 1=Raramente, 2=Às vezes, 3=Frequentemente, 4=Muito frequentemente)
${comorbiditySection}${timingSection}

Escreva um laudo de triagem personalizado em 3 parágrafos:
1. Interpretação dos resultados ASRS e o que indicam sobre o perfil atencional
2. Análise integrada: padrões específicos observados + contexto das comorbidades (se presentes)
3. Considerações clínicas importantes e próximos passos recomendados

Seja empático, direto e claro. Sem cabeçalhos ou marcadores — apenas parágrafos corridos.`,
    });

    return NextResponse.json({ laudo: text });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Laudo generation error:", msg);
    return NextResponse.json(
      { error: msg, laudo: "Não foi possível gerar o laudo personalizado. Por favor, consulte um especialista com os dados da sua pontuação." },
      { status: 500 }
    );
  }
}
