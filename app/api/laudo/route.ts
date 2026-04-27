import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest, NextResponse } from "next/server";
import type { ScoringResult } from "@/lib/asrs-data";

export async function POST(req: NextRequest) {
  try {
    const { answers, scoring }: { answers: number[]; scoring: ScoringResult } = await req.json();

    const riskLabel =
      scoring.riskLevel === "high"
        ? "Risco Elevado"
        : scoring.riskLevel === "moderate"
        ? "Risco Moderado"
        : "Risco Baixo";

    const { text } = await generateText({
      model: google("gemini-2.5-pro"),
      system: `Você é um psicólogo clínico especialista em TDAH em adultos.
Escreva laudos de triagem empáticos, claros e baseados em evidências com base nos resultados da escala ASRS-v1.1.
Use linguagem acessível, sem jargão excessivo. Seja honesto mas acolhedor.
SEMPRE inclua no final que o resultado é uma triagem e não substitui avaliação profissional.
Responda em português brasileiro.`,
      prompt: `O usuário completou a escala ASRS-v1.1 de auto-avaliação de TDAH em adultos.

Resultados:
- Nível de risco: ${riskLabel}
- Pontuação Parte A (triagem, máx 6 positivos): ${scoring.partAScore}/6
- Pontuação bruta Parte A: ${scoring.partATotal}/24
- Pontuação bruta Parte B: ${scoring.partBTotal}/48
- Perfil detectado: ${scoring.subtype}

Respostas por pergunta (0=Nunca, 1=Raramente, 2=Às vezes, 3=Frequentemente, 4=Muito frequentemente):
Parte A (triagem): ${answers.slice(0, 6).join(", ")}
Parte B (sintomas adicionais): ${answers.slice(6).join(", ")}

Escreva um laudo de triagem personalizado em 3 parágrafos:
1. Interpretação dos resultados e o que eles indicam sobre o perfil do usuário
2. Padrões específicos observados nas respostas (quais áreas têm mais dificuldade)
3. Considerações importantes e próximos passos recomendados

Seja empático, direto e claro. Não use cabeçalhos ou marcadores, apenas parágrafos corridos.`,
    });

    return NextResponse.json({ laudo: text });
  } catch (error) {
    console.error("Laudo generation error:", error);
    return NextResponse.json(
      { laudo: "Não foi possível gerar o laudo personalizado. Por favor, consulte um especialista com os dados da sua pontuação." },
      { status: 500 }
    );
  }
}
