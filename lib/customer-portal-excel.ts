import ExcelJS from "exceljs";

type ScanExportRow = {
  token: string;
  resultat: string;
  validation: string;
  client: string;
  site: string;
  localisation: string;
  dateHeure: string;
};

type CodeExportRow = {
  libelle: string;
  site: string;
  terminaison: string;
  portee: string;
  usage: string;
  etat: string;
  expiration: string;
  utiliseLe: string;
  creeLe: string;
};

function buildWorkbook(title: string, sheetName: string, columns: { header: string; key: string; width: number }[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Domocare Verify";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName);
  worksheet.columns = columns;
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172A" },
  };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = {
    from: "A1",
    to: String.fromCharCode(64 + columns.length) + "1",
  };

  workbook.subject = title;
  return { workbook, worksheet };
}

export function createCustomerScansWorkbook(rows: ScanExportRow[]) {
  const { workbook, worksheet } = buildWorkbook("Scans client final", "Scans", [
    { header: "Token", key: "token", width: 38 },
    { header: "Résultat", key: "resultat", width: 16 },
    { header: "Validation", key: "validation", width: 24 },
    { header: "Client final", key: "client", width: 24 },
    { header: "Site", key: "site", width: 24 },
    { header: "Localisation", key: "localisation", width: 30 },
    { header: "Date / heure", key: "dateHeure", width: 22 },
  ]);

  rows.forEach((row) => worksheet.addRow(row));
  return workbook;
}

export function createCustomerCodesWorkbook(rows: CodeExportRow[]) {
  const { workbook, worksheet } = buildWorkbook("Codes client final", "Codes", [
    { header: "Libellé", key: "libelle", width: 26 },
    { header: "Site", key: "site", width: 24 },
    { header: "Code", key: "terminaison", width: 18 },
    { header: "Portée", key: "portee", width: 18 },
    { header: "Usage", key: "usage", width: 18 },
    { header: "État", key: "etat", width: 16 },
    { header: "Expiration", key: "expiration", width: 16 },
    { header: "Utilisé le", key: "utiliseLe", width: 16 },
    { header: "Créé le", key: "creeLe", width: 16 },
  ]);

  rows.forEach((row) => worksheet.addRow(row));
  return workbook;
}

export async function customerWorkbookToArrayBuffer(workbook: ExcelJS.Workbook) {
  return workbook.xlsx.writeBuffer();
}
