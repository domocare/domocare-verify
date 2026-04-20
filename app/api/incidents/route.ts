import { prisma } from "@/lib/prisma";

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

const REASONS = new Set([
  "person_not_recognized",
  "photo_mismatch",
  "wrong_vehicle",
  "unexpected_visit",
  "validity_doubt",
  "other",
]);

export async function POST(req: Request) {
  const body = await req.json();
  const token = normalize(body.token);
  const reason = normalize(body.reason);
  const description = normalize(body.description);
  const clientName = normalize(body.clientName);
  const phone = normalize(body.phone);
  const email = normalize(body.email);

  if (!REASONS.has(reason)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  await prisma.incidentReport.create({
    data: {
      token: token || null,
      reason,
      description: description || null,
      clientName: clientName || null,
      phone: phone || null,
      email: email || null,
    },
  });

  return Response.json({ ok: true });
}
