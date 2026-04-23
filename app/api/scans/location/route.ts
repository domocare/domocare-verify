import { prisma } from "@/lib/prisma";

function readNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.scanId !== "string") {
    return Response.json({ ok: false }, { status: 400 });
  }

  const latitude = readNumber(body.latitude);
  const longitude = readNumber(body.longitude);
  const accuracy = readNumber(body.accuracy);

  if (
    latitude === null ||
    longitude === null ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const result = await prisma.scanLog.updateMany({
    where: { id: body.scanId },
    data: {
      latitude,
      longitude,
      accuracy,
      locationLabel: "Position GPS du téléphone",
      locationSource: "gps",
      locationCapturedAt: new Date(),
    },
  });

  return Response.json({ ok: result.count > 0 });
}
