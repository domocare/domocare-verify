import { prisma } from "@/lib/prisma";
import {
  generateToken,
  normalizeStatus,
  parseEmployeeWorkbook,
  sanitizeText,
} from "@/lib/employee-excel";

export const runtime = "nodejs";

const MAX_IMPORT_SIZE = 8_000_000;
const MAX_PHOTO_SIZE = 2_100_000;

function normalizeOptional(value: unknown) {
  const text = sanitizeText(value);
  return text || null;
}

function isValidPhoto(value?: string | null) {
  if (!value) return true;
  if (value.length > MAX_PHOTO_SIZE) return false;
  return value.startsWith("data:image/") || value.startsWith("https://") || value.startsWith("http://");
}

async function ensureSettings(company?: string | null, agency?: string | null) {
  const companyRecord = company
    ? await prisma.company.upsert({
        where: { name: company },
        update: {},
        create: { name: company },
      })
    : null;

  if (agency) {
    await prisma.agency.upsert({
      where: { name: agency },
      update: {
        companyId: companyRecord?.id,
      },
      create: {
        name: agency,
        companyId: companyRecord?.id,
      },
    });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ ok: false, message: "Fichier manquant." }, { status: 400 });
    }

    if (file.size > MAX_IMPORT_SIZE) {
      return Response.json({ ok: false, message: "Le fichier est trop volumineux." }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const rows = await parseEmployeeWorkbook(arrayBuffer);

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const [index, row] of rows.entries()) {
      const line = index + 2;
      const firstName = sanitizeText(row.firstName);
      const lastName = sanitizeText(row.lastName);
      const id = sanitizeText(row.id);
      const company = normalizeOptional(row.company);
      const agency = normalizeOptional(row.agency);
      const photoUrl = normalizeOptional(row.photoUrl);
      const status = normalizeStatus(row.status);

      if (!firstName || !lastName) {
        skipped += 1;
        errors.push(`Ligne ${line}: prenom et nom sont obligatoires.`);
        continue;
      }

      if (!isValidPhoto(photoUrl)) {
        skipped += 1;
        errors.push(`Ligne ${line}: photo invalide ou trop volumineuse.`);
        continue;
      }

      await ensureSettings(company, agency);

      const data = {
        firstName,
        lastName,
        jobTitle: normalizeOptional(row.jobTitle),
        agency,
        company,
        photoUrl,
        phoneAgency: normalizeOptional(row.phoneAgency),
        interventionType: normalizeOptional(row.interventionType),
        vehiclePlate: normalizeOptional(row.vehiclePlate),
        authorizedSite: normalizeOptional(row.authorizedSite),
        isActive: status !== "revoked" && status !== "suspended",
      };

      if (id) {
        const existing = await prisma.employee.findUnique({ where: { id } });

        if (!existing) {
          skipped += 1;
          errors.push(`Ligne ${line}: ID introuvable, ligne ignoree.`);
          continue;
        }

        await prisma.employee.update({
          where: { id },
          data,
        });

        await prisma.authorization.upsert({
          where: { employeeId: id },
          update: { status },
          create: {
            employeeId: id,
            status,
            validFrom: new Date(),
          },
        });

        await prisma.qrToken.upsert({
          where: { employeeId: id },
          update: {
            expiresAt: row.expiresAt || null,
            isActive: status !== "revoked" && status !== "suspended",
            revokedAt: status === "revoked" || status === "suspended" ? new Date() : null,
          },
          create: {
            employeeId: id,
            token: generateToken(),
            isActive: status !== "revoked" && status !== "suspended",
            expiresAt: row.expiresAt || null,
            revokedAt: status === "revoked" || status === "suspended" ? new Date() : null,
          },
        });

        updated += 1;
        continue;
      }

      const employee = await prisma.employee.create({ data });

      await prisma.authorization.create({
        data: {
          employeeId: employee.id,
          status,
          validFrom: new Date(),
        },
      });

      await prisma.qrToken.create({
        data: {
          employeeId: employee.id,
          token: generateToken(),
          isActive: status !== "revoked" && status !== "suspended",
          expiresAt: row.expiresAt || null,
          revokedAt: status === "revoked" || status === "suspended" ? new Date() : null,
        },
      });

      created += 1;
    }

    return Response.json({
      ok: true,
      created,
      updated,
      skipped,
      errors,
    });
  } catch (error) {
    console.error("Employee import error", error);
    return Response.json({ ok: false, message: "Import impossible." }, { status: 500 });
  }
}
