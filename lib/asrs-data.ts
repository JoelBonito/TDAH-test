export const ASRS_QUESTIONS = [
  // Part A (6) — primary screener
  "Com que frequência você comete erros por falta de atenção quando precisa trabalhar em um projeto chato ou difícil?",
  "Com que frequência você tem dificuldade em manter a atenção quando está fazendo um trabalho chato ou repetitivo?",
  "Com que frequência você tem dificuldade em finalizar os detalhes finais de um projeto depois que as partes desafiadoras foram concluídas?",
  "Com que frequência você tem dificuldade em colocar as coisas em ordem quando precisa fazer uma tarefa que exige organização?",
  "Quando precisa fazer uma tarefa que exige muita reflexão, com que frequência você evita ou adia começá-la?",
  "Com que frequência você se mexe ou se contorce com as mãos ou os pés quando precisa ficar sentado por muito tempo?",
  // Part B (12) — additional symptoms
  "Com que frequência você se sente excessivamente ativo ou compelido a fazer coisas, como se estivesse movido por um motor?",
  "Com que frequência você tem dificuldade em se concentrar no que as pessoas dizem, mesmo quando elas falam diretamente com você?",
  "Com que frequência você coloca objetos em lugares errados ou tem dificuldade em encontrá-los em casa ou no trabalho?",
  "Com que frequência você se distrai com atividades ou ruídos ao seu redor?",
  "Com que frequência você se levanta da cadeira em reuniões ou outras situações em que se espera que permaneça sentado?",
  "Com que frequência você se sente inquieto ou agitado?",
  "Com que frequência você tem dificuldade em relaxar e descansar quando tem tempo livre?",
  "Com que frequência você se pega falando demais em situações sociais?",
  "Quando está em uma conversa, com que frequência você se pega terminando as frases das pessoas antes que elas mesmas possam terminar?",
  "Com que frequência você tem dificuldade em esperar a sua vez em situações em que isso é necessário?",
  "Com que frequência você interrompe os outros quando eles estão ocupados?",
  "Com que frequência você esquece compromissos ou obrigações importantes?",
];

export const ASRS_OPTIONS = [
  { value: 0, label: "Nunca",               hint: "Não acontece comigo" },
  { value: 1, label: "Raramente",           hint: "Acontece poucas vezes" },
  { value: 2, label: "Às vezes",            hint: "Acontece ocasionalmente" },
  { value: 3, label: "Frequentemente",      hint: "Acontece com frequência" },
  { value: 4, label: "Muito frequentemente",hint: "Acontece quase sempre" },
];

// ASRS v1.1 Part A thresholds per question (index 0-5)
// Q1-Q3 (idx 0-2): score point if answer >= 2 (Sometimes+)
// Q4-Q6 (idx 3-5): score point if answer >= 3 (Often+)
export const PART_A_THRESHOLDS = [2, 2, 2, 3, 3, 3];

export type RiskLevel = "low" | "moderate" | "high";

export interface ScoringResult {
  partAScore: number;   // 0-6 (positive items)
  partATotal: number;   // raw sum 0-24
  partBTotal: number;   // raw sum 0-48
  riskLevel: RiskLevel;
  subtype: string;
}

export function scoreAnswers(answers: (number | null)[]): ScoringResult {
  const filled = answers.map((a) => a ?? 0);

  // Part A: count positive items using per-question thresholds
  let partAScore = 0;
  let partATotal = 0;
  for (let i = 0; i < 6; i++) {
    partATotal += filled[i];
    if (filled[i] >= PART_A_THRESHOLDS[i]) partAScore++;
  }

  // Part B: raw sum
  let partBTotal = 0;
  for (let i = 6; i < 18; i++) partBTotal += filled[i];

  // Risk level based on Part A positive items
  let riskLevel: RiskLevel;
  if (partAScore <= 2) riskLevel = "low";
  else if (partAScore === 3) riskLevel = "moderate";
  else riskLevel = "high";

  // Subtype: compare inattentive (idx 0-2, 6-9, 17) vs hyperactive (idx 3-5, 10-16)
  const inattentiveRaw =
    filled[0] + filled[1] + filled[2] + filled[6] + filled[7] + filled[8] + filled[9] + filled[17];
  const hyperactiveRaw =
    filled[3] + filled[4] + filled[5] + filled[10] + filled[11] + filled[12] +
    filled[13] + filled[14] + filled[15] + filled[16];

  let subtype: string;
  if (riskLevel === "low") {
    subtype = "Sem indicadores significativos";
  } else if (Math.abs(inattentiveRaw - hyperactiveRaw) <= 4) {
    subtype = "Perfil Combinado (Desatento + Hiperativo)";
  } else if (inattentiveRaw > hyperactiveRaw) {
    subtype = "Perfil predominantemente Desatento";
  } else {
    subtype = "Perfil predominantemente Hiperativo-Impulsivo";
  }

  return { partAScore, partATotal, partBTotal, riskLevel, subtype };
}
