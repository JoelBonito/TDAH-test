import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import type { ScoringResult, ComorbidityResult } from "@/lib/asrs-data";

const resend = new Resend(process.env.RESEND_API_KEY);

const RISK_LABELS: Record<string, string> = {
  low: "Risco Baixo",
  moderate: "Risco Moderado",
  high: "Risco Elevado",
};

const RISK_COLORS: Record<string, string> = {
  low: "#16a34a",
  moderate: "#ca8a04",
  high: "#dc2626",
};

function buildEmailHtml(scoring: ScoringResult, comorbidity: ComorbidityResult | null, laudo: string, date: string): string {
  const riskColor = RISK_COLORS[scoring.riskLevel] ?? "#4f46e5";
  const riskLabel = RISK_LABELS[scoring.riskLevel] ?? "";

  const comorbidityHtml = comorbidity ? `
    <div style="margin:24px 0 0;">
      <p style="font-size:13px;font-weight:600;color:#1e1e32;margin:0 0 10px;">Fatores Associados (GAD-2 + PHQ-2)</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="48%" style="background:#f8f8fc;border:1px solid #e0e0ee;border-radius:8px;padding:12px;">
            <p style="font-size:11px;color:#888;margin:0 0 4px;text-transform:uppercase;letter-spacing:.08em;">Ansiedade (GAD-2)</p>
            <p style="font-size:20px;font-weight:700;color:#1e1e32;margin:0 0 2px;">${comorbidity.anxietyScore}<span style="font-size:13px;color:#888;font-weight:400;">/6</span></p>
            <p style="font-size:11px;color:${comorbidity.anxietyPositive ? "#dc2626" : "#16a34a"};margin:0;">${comorbidity.anxietyPositive ? "Indicadores presentes" : "Sem indicadores"}</p>
          </td>
          <td width="4%"></td>
          <td width="48%" style="background:#f8f8fc;border:1px solid #e0e0ee;border-radius:8px;padding:12px;">
            <p style="font-size:11px;color:#888;margin:0 0 4px;text-transform:uppercase;letter-spacing:.08em;">Depressão (PHQ-2)</p>
            <p style="font-size:20px;font-weight:700;color:#1e1e32;margin:0 0 2px;">${comorbidity.depressionScore}<span style="font-size:13px;color:#888;font-weight:400;">/6</span></p>
            <p style="font-size:11px;color:${comorbidity.depressionPositive ? "#dc2626" : "#16a34a"};margin:0;">${comorbidity.depressionPositive ? "Indicadores presentes" : "Sem indicadores"}</p>
          </td>
        </tr>
      </table>
    </div>` : "";

  const laudoParagraphs = laudo.split("\n\n").filter(Boolean)
    .map((p) => `<p style="margin:0 0 14px;color:#555;line-height:1.7;">${p}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:#4f46e5;padding:20px 32px;">
          <p style="margin:0;color:#fff;font-size:13px;font-weight:500;">Auto-avaliação TDAH · ASRS-v1.1</p>
          <p style="margin:4px 0 0;color:rgba(255,255,255,.65);font-size:11px;">${date}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <h1 style="font-size:24px;font-weight:700;color:#1e1e32;margin:0 0 6px;">Seu Relatório de Avaliação</h1>
          <p style="font-size:13px;color:#888;margin:0 0 24px;">Resultado gerado pela ferramenta de triagem ASRS-v1.1</p>

          <!-- Risk badge -->
          <div style="background:${riskColor};border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
            <p style="font-size:22px;font-weight:700;color:#fff;margin:0 0 4px;">${riskLabel}</p>
            <p style="font-size:13px;color:rgba(255,255,255,.85);margin:0;">${scoring.subtype}</p>
          </div>

          <!-- Scores -->
          <p style="font-size:13px;font-weight:600;color:#1e1e32;margin:0 0 10px;">Pontuações ASRS</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px;">
            ${[
              ["Parte A · Triagem", `${scoring.partAScore}/6`, "Indicador principal (OMS)"],
              ["Parte A · Soma bruta", `${scoring.partATotal}/24`, ""],
              ["Parte B · Sintomas adicionais", `${scoring.partBTotal}/48`, "Contexto clínico"],
            ].map(([label, val, note]) => `
            <tr>
              <td style="background:#f8f8fc;border:1px solid #e0e0ee;border-radius:6px;padding:10px 12px;margin-bottom:6px;">
                <table width="100%"><tr>
                  <td><p style="font-size:12px;color:#666;margin:0;">${label}${note ? ` <span style="color:#aaa;">· ${note}</span>` : ""}</p></td>
                  <td align="right"><p style="font-size:13px;font-weight:700;color:#1e1e32;margin:0;">${val}</p></td>
                </tr></table>
              </td>
            </tr>
            <tr><td height="6"></td></tr>`).join("")}
          </table>

          ${comorbidityHtml}

          <!-- Laudo -->
          <div style="margin-top:28px;">
            <p style="font-size:13px;font-weight:600;color:#1e1e32;margin:0 0 12px;">Laudo Personalizado</p>
            <div style="background:#f8f8fc;border:1px solid #e0e0ee;border-radius:10px;padding:20px;">
              ${laudoParagraphs}
            </div>
          </div>

          <!-- Disclaimer -->
          <div style="margin-top:28px;padding:16px;border:1px dashed #d0d0e8;border-radius:8px;">
            <p style="font-size:11px;color:#999;margin:0;line-height:1.6;">
              ⚠ Este relatório é uma <strong>triagem</strong>, não um diagnóstico clínico. A ASRS-v1.1 é uma ferramenta de rastreio validada pela OMS, mas o diagnóstico de TDAH requer avaliação presencial por profissional qualificado.
            </p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8f8fc;padding:16px 32px;border-top:1px solid #e0e0ee;">
          <p style="font-size:11px;color:#aaa;margin:0;text-align:center;">Gerado por ferramenta de triagem ASRS-v1.1 · Uso pessoal</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { email, scoring, comorbidity, laudo, pdfBase64 }: {
      email: string;
      scoring: ScoringResult;
      comorbidity: ComorbidityResult | null;
      laudo: string;
      pdfBase64: string;
    } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const date = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

    await resend.emails.send({
      from: "Triagem TDAH <noreply@gestionchs.inoveai.online>",
      to: email,
      subject: `Seu relatório de triagem TDAH — ${date}`,
      html: buildEmailHtml(scoring, comorbidity, laudo, date),
      attachments: [
        {
          filename: `relatorio-tdah-${new Date().toISOString().slice(0, 10)}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: "Falha ao enviar email" }, { status: 500 });
  }
}
