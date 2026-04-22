import ExcelJS from "exceljs";
import crypto from "crypto";
import { getVerifyUrl } from "@/lib/urls";

export type EmployeeExcelRow = {
  id?: string | null;
  firstName: string;
  lastName: string;
  jobTitle?: string | null;
  company?: string | null;
  agency?: string | null;
  phoneAgency?: string | null;
  interventionType?: string | null;
  vehiclePlate?: string | null;
  authorizedSite?: string | null;
  status?: string | null;
  expiresAt?: Date | null;
  photoUrl?: string | null;
  token?: string | null;
};

export const employeeExcelColumns = [
  { header: "ID", key: "id", width: 28 },
  { header: "Prénom", key: "firstName", width: 18 },
  { header: "Nom", key: "lastName", width: 18 },
  { header: "Fonction", key: "jobTitle", width: 26 },
  { header: "Société", key: "company", width: 24 },
  { header: "Agence", key: "agency", width: 20 },
  { header: "Téléphone agence", key: "phoneAgency", width: 20 },
  { header: "Type intervention", key: "interventionType", width: 28 },
  { header: "Véhicule plaque", key: "vehiclePlate", width: 18 },
  { header: "Site client autorisé", key: "authorizedSite", width: 28 },
  { header: "Statut", key: "status", width: 16 },
  { header: "Expiration QR", key: "expiresAt", width: 18 },
  { header: "Photo URL ou base64", key: "photoUrl", width: 32 },
  { header: "Token QR", key: "token", width: 34 },
  { header: "Lien vérification", key: "verifyUrl", width: 54 },
];

const headerAliases: Record<string, keyof EmployeeExcelRow> = {
  id: "id",
  prenom: "firstName",
  "prénom": "firstName",
  firstname: "firstName",
  nom: "lastName",
  lastname: "lastName",
  fonction: "jobTitle",
  poste: "jobTitle",
  societe: "company",
  "société": "company",
  company: "company",
  agence: "agency",
  telephoneagence: "phoneAgency",
  "telephone agence": "phoneAgency",
  "téléphone agence": "phoneAgency",
  phoneagency: "phoneAgency",
  typeintervention: "interventionType",
  "type intervention": "interventionType",
  intervention: "interventionType",
  vehiculeplaque: "vehiclePlate",
  "vehicule plaque": "vehiclePlate",
  "véhicule plaque": "vehiclePlate",
  vehicule: "vehiclePlate",
  "véhicule": "vehiclePlate",
  plaque: "vehiclePlate",
  siteclientautorise: "authorizedSite",
  "site client autorise": "authorizedSite",
  "site client autorisé": "authorizedSite",
  site: "authorizedSite",
  statut: "status",
  status: "status",
  expirationqr: "expiresAt",
  "expiration qr": "expiresAt",
  expiration: "expiresAt",
  photourloubase64: "photoUrl",
  "photo url ou base64": "photoUrl",
  photo: "photoUrl",
};

function normalizeHeader(value: unknown) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

export function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

export function normalizeStatus(value?: string | null) {
  const status = String(value || "active").trim().toLowerCase();

  if (status === "active" || status === "expired" || status === "revoked" || status === "suspended") {
    return status;
  }

  if (status === "suspendu" || status === "suspendue") return "revoked";
  if (status === "expire" || status === "expiree" || status === "expiré" || status === "expirée") return "expired";
  if (status === "autorise" || status === "autorisée" || status === "autorise") return "active";

  return "active";
}

export function sanitizeText(value: unknown) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

export function parseExcelDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  const text = sanitizeText(value);
  if (!text) return null;

  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const date = new Date(`${text}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const frenchMatch = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (frenchMatch) {
    const [, day, month, year] = frenchMatch;
    const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function createEmployeeWorkbook(rows: EmployeeExcelRow[], title = "Collaborateurs") {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Domocare Verify";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(title);
  worksheet.columns = employeeExcelColumns;

  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172A" },
  };
  worksheet.getRow(1).alignment = { vertical: "middle" };

  rows.forEach((row) => {
    worksheet.addRow({
      ...row,
      expiresAt: row.expiresAt ? row.expiresAt.toISOString().slice(0, 10) : "",
      verifyUrl: row.token ? getVerifyUrl(row.token) : "",
    });
  });

  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = {
    from: "A1",
    to: "O1",
  };

  worksheet.getColumn("L").numFmt = "yyyy-mm-dd";

  const instructions = workbook.addWorksheet("Modele et consignes");
  instructions.columns = [
    { header: "Champ", key: "field", width: 28 },
    { header: "Consigne", key: "help", width: 80 },
  ];
  instructions.getRow(1).font = { bold: true };
  instructions.addRows([
    { field: "Prénom / Nom", help: "Obligatoires pour créer un collaborateur." },
    { field: "ID", help: "Laisser vide pour une création. Renseigner un ID existant pour mettre à jour une fiche." },
    { field: "Statut", help: "Valeurs acceptees : active, expired, revoked. Par defaut : active." },
    { field: "Expiration QR", help: "Format recommande : AAAA-MM-JJ, exemple 2026-12-31." },
    { field: "Photo URL ou base64", help: "Optionnel. Utiliser une URL https ou une image base64 data:image/..." },
    { field: "Token QR / Lien vérification", help: "Colonnes informatives à l'export. Elles sont ignorées à l'import." },
  ]);

  return workbook;
}

export async function workbookToArrayBuffer(workbook: ExcelJS.Workbook) {
  return workbook.xlsx.writeBuffer();
}

export async function parseEmployeeWorkbook(arrayBuffer: ArrayBuffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const headerMap = new Map<number, keyof EmployeeExcelRow>();
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    const normalized = normalizeHeader(cell.value);
    const key = headerAliases[normalized] || headerAliases[normalized.replace(/\s+/g, "")];
    if (key) headerMap.set(colNumber, key);
  });

  const rows: EmployeeExcelRow[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const item: EmployeeExcelRow = {
      firstName: "",
      lastName: "",
    };

    row.eachCell((cell, colNumber) => {
      const key = headerMap.get(colNumber);
      if (!key) return;

      if (key === "expiresAt") {
        item.expiresAt = parseExcelDate(cell.value);
        return;
      }

      item[key] = sanitizeText(cell.value) as never;
    });

    if (Object.values(item).some((value) => Boolean(value))) {
      rows.push(item);
    }
  });

  return rows;
}
