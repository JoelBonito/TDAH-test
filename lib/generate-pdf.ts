import type { ScoringResult, ComorbidityResult } from "./asrs-data";

export interface PdfData {
  scoring: ScoringResult;
  comorbidity: ComorbidityResult | null;
  laudo: string;
  date: string;
}

const RISK_LABELS: Record<string, string> = {
  low: "Risco Baixo",
  moderate: "Risco Moderado",
  high: "Risco Elevado",
};

const RISK_COLORS: Record<string, [number, number, number]> = {
  low:      [34, 197, 94],
  moderate: [234, 179, 8],
  high:     [239, 68, 68],
};

export async function generatePdf(data: PdfData): Promise<Uint8Array> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 20;

  const accent: [number, number, number] = [79, 70, 229];
  const inkMuted: [number, number, number] = [100, 100, 120];
  const ink: [number, number, number] = [30, 30, 50];
  const borderColor: [number, number, number] = [220, 220, 235];

  // Header bar
  doc.setFillColor(...accent);
  doc.rect(0, 0, pageW, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("ASRS-v1.1 · Triagem de TDAH em Adultos", margin, 8);
  doc.text(data.date, pageW - margin, 8, { align: "right" });

  y = 28;

  // Title
  doc.setTextColor(...ink);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Avaliação", pageW / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...inkMuted);
  doc.text("Ferramenta de auto-avaliação — não substitui diagnóstico profissional", pageW / 2, y, { align: "center" });
  y += 12;

  // Divider
  doc.setDrawColor(...borderColor);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  // Risk badge
  const riskColor = RISK_COLORS[data.scoring.riskLevel] ?? RISK_COLORS.low;
  doc.setFillColor(...riskColor);
  doc.roundedRect(margin, y, contentW, 18, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(RISK_LABELS[data.scoring.riskLevel] ?? "", pageW / 2, y + 7, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(data.scoring.subtype, pageW / 2, y + 13, { align: "center" });
  y += 26;

  // Scores section
  doc.setTextColor(...ink);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Pontuações ASRS-v1.1", margin, y);
  y += 6;

  const scoreItems = [
    { label: "Parte A · Triagem (máx 6 positivos)", value: `${data.scoring.partAScore}/6`, note: "Indicador principal OMS" },
    { label: "Parte A · Soma bruta (máx 24)", value: `${data.scoring.partATotal}/24`, note: "" },
    { label: "Parte B · Sintomas adicionais (máx 48)", value: `${data.scoring.partBTotal}/48`, note: "Contexto clínico" },
  ];

  scoreItems.forEach((item) => {
    doc.setFillColor(248, 248, 252);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, "FD");
    doc.setTextColor(...inkMuted);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(item.label, margin + 4, y + 6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ink);
    doc.text(item.value, pageW - margin - 4, y + 6.5, { align: "right" });
    y += 12;
  });

  y += 4;

  // Comorbidities
  if (data.comorbidity) {
    doc.setTextColor(...ink);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Fatores Associados (GAD-2 + PHQ-2)", margin, y);
    y += 6;

    const comorbItems = [
      {
        label: "Ansiedade (GAD-2)",
        score: `${data.comorbidity.anxietyScore}/6`,
        positive: data.comorbidity.anxietyPositive,
      },
      {
        label: "Depressão (PHQ-2)",
        score: `${data.comorbidity.depressionScore}/6`,
        positive: data.comorbidity.depressionPositive,
      },
    ];

    comorbItems.forEach((item) => {
      const bgColor: [number, number, number] = item.positive ? [255, 245, 245] : [245, 255, 248];
      const statusColor: [number, number, number] = item.positive ? [220, 60, 60] : [34, 150, 80];
      doc.setFillColor(...bgColor);
      doc.setDrawColor(...borderColor);
      doc.roundedRect(margin, y, contentW, 10, 2, 2, "FD");
      doc.setTextColor(...inkMuted);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(item.label, margin + 4, y + 6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...statusColor);
      doc.text(`${item.score} — ${item.positive ? "Indicadores presentes" : "Sem indicadores"}`, pageW - margin - 4, y + 6.5, { align: "right" });
      y += 12;
    });

    y += 4;
  }

  // Laudo
  doc.setTextColor(...ink);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Laudo Personalizado", margin, y);
  y += 6;

  doc.setFillColor(248, 248, 252);
  doc.setDrawColor(...borderColor);

  const paragraphs = data.laudo.split("\n\n").filter(Boolean);
  const laudoLines: string[] = [];
  paragraphs.forEach((para, i) => {
    const wrapped = doc.splitTextToSize(para, contentW - 8);
    laudoLines.push(...wrapped);
    if (i < paragraphs.length - 1) laudoLines.push("");
  });

  const laudoBoxH = laudoLines.length * 5 + 8;
  doc.roundedRect(margin, y, contentW, laudoBoxH, 2, 2, "FD");
  doc.setTextColor(...inkMuted);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(laudoLines, margin + 4, y + 6);
  y += laudoBoxH + 10;

  // Check if we need a new page for disclaimer
  if (y > 260) {
    doc.addPage();
    y = 20;
  }

  // Disclaimer
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 6;
  doc.setTextColor(...inkMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  const disclaimer = "⚠ Este relatório é uma triagem, não um diagnóstico clínico. A ASRS-v1.1 é validada pela OMS como ferramenta de rastreio, mas o diagnóstico de TDAH requer avaliação presencial por profissional qualificado (psiquiatra ou neurologista).";
  const disclaimerLines = doc.splitTextToSize(disclaimer, contentW);
  doc.text(disclaimerLines, margin, y);

  return doc.output("arraybuffer") as unknown as Uint8Array;
}
