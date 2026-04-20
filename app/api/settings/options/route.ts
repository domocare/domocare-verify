import { prisma } from "@/lib/prisma";

export async function GET() {
  const [companies, agencies] = await Promise.all([
    prisma.company.findMany({ orderBy: { name: "asc" } }),
    prisma.agency.findMany({
      orderBy: [{ company: { name: "asc" } }, { name: "asc" }],
      include: {
        company: true,
      },
    }),
  ]);

  return Response.json({ companies, agencies });
}
