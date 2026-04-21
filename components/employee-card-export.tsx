"use client";

import { getCompanyBrand } from "@/lib/company-branding";

type ExportEmployee = {
  firstName: string;
  lastName: string;
  jobTitle?: string | null;
  company?: string | null;
  agency?: string | null;
  photoUrl?: string | null;
  phoneAgency?: string | null;
  interventionType?: string | null;
  vehiclePlate?: string | null;
  authorizedSite?: string | null;
};

type EmployeeCardExportProps = {
  employee: ExportEmployee;
  statusLabel: string;
  validUntil: string;
  qrImage: string;
  verifyUrl: string;
};

const cardWidthPt = 244.95;
const cardHeightPt = 153.07;
const cardScale = 4;
const cardWidth = Math.round(cardWidthPt * cardScale);
const cardHeight = Math.round(cardHeightPt * cardScale);

function sanitizeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (ctx.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }

  if (line) lines.push(line);

  lines.slice(0, maxLines).forEach((currentLine, index) => {
    const suffix = index === maxLines - 1 && lines.length > maxLines ? "..." : "";
    ctx.fillText(`${currentLine}${suffix}`, x, y + index * lineHeight);
  });
}

function loadImage(src?: string | null) {
  if (!src) return Promise.resolve<HTMLImageElement | null>(null);

  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function fieldValue(value?: string | null) {
  return value && value.trim() ? value : "-";
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const ratio = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * ratio;
  const drawHeight = image.height * ratio;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function drawContainImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const ratio = Math.min(width / image.width, height / image.height);
  const drawWidth = image.width * ratio;
  const drawHeight = image.height * ratio;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function EmployeeCardExport({
  employee,
  validUntil,
  qrImage,
  verifyUrl,
}: EmployeeCardExportProps) {
  const fullName = `${employee.firstName} ${employee.lastName}`;
  const fileBaseName = sanitizeFileName(`carte-${fullName}`) || "carte-collaborateur";
  const brand = getCompanyBrand(employee.company);

  async function exportPng() {
    const canvas = document.createElement("canvas");
    canvas.width = cardWidth;
    canvas.height = cardHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const [photo, qr, logo] = await Promise.all([
      loadImage(employee.photoUrl),
      loadImage(qrImage),
      loadImage(brand.logo),
    ]);

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, cardWidth, cardHeight);

    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, 34, 34, cardWidth - 68, cardHeight - 68, 28);
    ctx.fill();
    ctx.strokeStyle = "#d7dee8";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.font = "700 34px Arial, sans-serif";
    ctx.fillText("Lantana Verify", 76, 96);

    ctx.fillStyle = "#64748b";
    ctx.font = "500 20px Arial, sans-serif";
    ctx.fillText("Carte d'intervention securisee par QR code", 76, 128);

    if (logo) {
      drawContainImage(ctx, logo, 708, 70, 176, 70);
    }

    ctx.fillStyle = "#0f172a";
    ctx.font = "700 42px Arial, sans-serif";
    drawWrappedText(ctx, fullName, 76, 220, 500, 48, 2);

    ctx.fillStyle = "#475569";
    ctx.font = "500 25px Arial, sans-serif";
    drawWrappedText(ctx, fieldValue(employee.jobTitle), 76, 316, 520, 34, 2);

    ctx.fillStyle = "#ecfdf5";
    drawRoundedRect(ctx, 76, 372, 310, 54, 27);
    ctx.fill();
    ctx.strokeStyle = "#86efac";
    ctx.stroke();
    ctx.fillStyle = "#166534";
    ctx.font = "700 21px Arial, sans-serif";
    ctx.fillText("Statut verifie par QR code", 102, 407);

    ctx.fillStyle = "#64748b";
    ctx.font = "600 17px Arial, sans-serif";
    ctx.fillText("SOCIETE", 76, 474);
    ctx.fillText("AGENCE", 326, 474);
    ctx.fillText("VALIDITE", 76, 548);
    ctx.fillText("INTERVENTION", 326, 548);

    ctx.fillStyle = "#0f172a";
    ctx.font = "700 22px Arial, sans-serif";
    drawWrappedText(ctx, fieldValue(employee.company), 76, 504, 220, 28, 1);
    drawWrappedText(ctx, fieldValue(employee.agency), 326, 504, 220, 28, 1);
    drawWrappedText(ctx, validUntil, 76, 578, 220, 28, 1);
    drawWrappedText(ctx, fieldValue(employee.interventionType), 326, 578, 260, 28, 1);

    ctx.fillStyle = "#eef2f7";
    drawRoundedRect(ctx, 650, 76, 246, 246, 24);
    ctx.fill();

    if (photo) {
      ctx.save();
      drawRoundedRect(ctx, 650, 76, 246, 246, 24);
      ctx.clip();
      drawCoverImage(ctx, photo, 650, 76, 246, 246);
      ctx.restore();
    } else {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 28px Arial, sans-serif";
      ctx.fillText("PHOTO", 725, 210);
    }

    if (qr) {
      ctx.fillStyle = "#ffffff";
      drawRoundedRect(ctx, 662, 360, 222, 222, 18);
      ctx.fill();
      ctx.drawImage(qr, 682, 380, 182, 182);
    }

    ctx.fillStyle = "#334155";
    ctx.font = "500 16px Arial, sans-serif";
    drawWrappedText(ctx, verifyUrl, 640, 592, 292, 20, 2);

    try {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${fileBaseName}.png`;
      link.click();
    } catch {
      window.alert("L'export PNG est impossible avec cette photo. Essayez avec une photo stockee dans l'application.");
    }
  }

  function exportPdf() {
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) return;

    const escaped = {
      fullName: escapeHtml(fullName),
      jobTitle: escapeHtml(fieldValue(employee.jobTitle)),
      company: escapeHtml(fieldValue(employee.company)),
      agency: escapeHtml(fieldValue(employee.agency)),
      validUntil: escapeHtml(validUntil),
      interventionType: escapeHtml(fieldValue(employee.interventionType)),
      vehiclePlate: escapeHtml(fieldValue(employee.vehiclePlate)),
      authorizedSite: escapeHtml(fieldValue(employee.authorizedSite)),
      photoUrl: employee.photoUrl ? escapeHtml(employee.photoUrl) : "",
      logoUrl: escapeHtml(brand.logo),
      qrImage: escapeHtml(qrImage),
      verifyUrl: escapeHtml(verifyUrl),
    };

    popup.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${escaped.fullName} - Carte Lantana Verify</title>
          <style>
            @page { size: ${cardWidthPt}pt ${cardHeightPt}pt; margin: 0; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              min-height: 100vh;
              display: grid;
              place-items: center;
              background: #e5e7eb;
              color: #0f172a;
              font-family: Arial, sans-serif;
            }
            .card {
              width: ${cardWidthPt}pt;
              height: ${cardHeightPt}pt;
              padding: 14pt;
              display: grid;
              grid-template-columns: 1fr 70pt;
              gap: 12pt;
              background: white;
              border: 0.8pt solid #cbd5e1;
              border-radius: 8pt;
            }
            .top { display: flex; align-items: start; justify-content: space-between; gap: 8pt; }
            .logo { max-width: 54pt; max-height: 23pt; object-fit: contain; }
            h1 { margin: 10pt 0 0; font-size: 13pt; line-height: 1.1; }
            .brand { font-size: 6.5pt; font-weight: 700; color: #0f766e; text-transform: uppercase; }
            .job { margin-top: 4pt; font-size: 7pt; color: #475569; }
            .qr-note {
              display: inline-block;
              margin-top: 8pt;
              padding: 4pt 7pt;
              border-radius: 999px;
              border: 0.7pt solid #86efac;
              background: #ecfdf5;
              color: #166534;
              font-size: 6.6pt;
              font-weight: 700;
            }
            dl { margin: 8pt 0 0; display: grid; grid-template-columns: 1fr 1fr; gap: 5pt 8pt; }
            dt { font-size: 5.2pt; color: #64748b; font-weight: 700; text-transform: uppercase; }
            dd { margin: 1pt 0 0; font-size: 6.6pt; font-weight: 700; overflow-wrap: anywhere; }
            .side { display: grid; gap: 6pt; align-content: start; }
            .photo, .qr { width: 70pt; height: 70pt; border: 0.7pt solid #cbd5e1; border-radius: 6pt; object-fit: cover; }
            .qr { padding: 4pt; background: white; }
            .url { font-size: 4.7pt; color: #64748b; overflow-wrap: anywhere; }
            @media print {
              body { min-height: auto; background: white; }
              .card { border-color: #94a3b8; border-radius: 0; }
            }
          </style>
        </head>
        <body>
          <main class="card">
            <section>
              <div class="top">
                <div class="brand">Lantana Verify</div>
                <img class="logo" src="${escaped.logoUrl}" alt="Logo">
              </div>
              <h1>${escaped.fullName}</h1>
              <div class="job">${escaped.jobTitle}</div>
              <div class="qr-note">Statut verifie par QR code</div>
              <dl>
                <div><dt>Societe</dt><dd>${escaped.company}</dd></div>
                <div><dt>Agence</dt><dd>${escaped.agency}</dd></div>
                <div><dt>Validite</dt><dd>${escaped.validUntil}</dd></div>
                <div><dt>Intervention</dt><dd>${escaped.interventionType}</dd></div>
                <div><dt>Vehicule</dt><dd>${escaped.vehiclePlate}</dd></div>
                <div><dt>Site</dt><dd>${escaped.authorizedSite}</dd></div>
              </dl>
            </section>
            <aside class="side">
              ${escaped.photoUrl ? `<img class="photo" src="${escaped.photoUrl}" alt="Photo">` : `<div class="photo"></div>`}
              <img class="qr" src="${escaped.qrImage}" alt="QR code">
              <div class="url">${escaped.verifyUrl}</div>
            </aside>
          </main>
          <script>
            window.addEventListener("load", () => {
              setTimeout(() => window.print(), 250);
            });
          </script>
        </body>
      </html>
    `);
    popup.document.close();
  }

  return (
    <div className="rounded-lg border bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-900">Carte collaborateur</p>
      <p className="mt-1 text-sm text-slate-500">
        Export pour impression ou partage interne.
      </p>
      <div className="mt-4 grid gap-2">
        <button
          type="button"
          onClick={exportPng}
          className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-slate-800"
        >
          Exporter PNG
        </button>
        <button
          type="button"
          onClick={exportPdf}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Exporter PDF
        </button>
      </div>
    </div>
  );
}
