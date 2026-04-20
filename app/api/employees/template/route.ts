import { createEmployeeWorkbook, workbookToArrayBuffer } from "@/lib/employee-excel";

export const runtime = "nodejs";

export async function GET() {
  const workbook = createEmployeeWorkbook(
    [
      {
        firstName: "Jean",
        lastName: "Dupont",
        jobTitle: "Chef d'equipe entretien",
        company: "Lantana Paysage",
        agency: "Montpellier",
        phoneAgency: "04 67 00 00 00",
        interventionType: "Entretien jardin",
        vehiclePlate: "AB-123-CD",
        authorizedSite: "Residence Les Acacias",
        status: "active",
        expiresAt: new Date("2026-12-31T00:00:00.000Z"),
        photoUrl: "",
      },
    ],
    "Modele import",
  );

  const body = await workbookToArrayBuffer(workbook);

  return new Response(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="modele-collaborateurs-domocare.xlsx"',
    },
  });
}
