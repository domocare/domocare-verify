import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const photoUrl = typeof body.photoUrl === "string" ? body.photoUrl : "";

    if (photoUrl && !photoUrl.startsWith("data:image/")) {
      return Response.json({ ok: false }, { status: 400 });
    }

    if (photoUrl.length > 2_100_000) {
      return Response.json({ ok: false }, { status: 413 });
    }

    const employee = await prisma.employee.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        jobTitle: body.jobTitle || null,
        agency: body.agency || null,
        company: body.company || null,
        photoUrl: photoUrl || null,
        phoneAgency: body.phoneAgency || null,
        isActive: true,
      },
    });

    await prisma.authorization.create({
      data: {
        id: crypto.randomUUID(),
        employeeId: employee.id,
        status: body.status || "active",
        validFrom: new Date(),
      },
    });

    await prisma.qrToken.create({
      data: {
        id: crypto.randomUUID(),
        employeeId: employee.id,
        token: generateToken(),
        isActive: true,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
