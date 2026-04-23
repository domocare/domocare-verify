"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function requireSession() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!session) {
    throw new Error("Unauthorized");
  }
}

export async function updateIncidentWorkflow(formData: FormData) {
  await requireSession();

  const id = readText(formData, "id");
  const status = readText(formData, "status") === "done" ? "done" : "todo";
  const adminComment = readText(formData, "adminComment") || null;

  if (!id) {
    throw new Error("Signalement introuvable.");
  }

  await prisma.incidentReport.update({
    where: { id },
    data: {
      status,
      adminComment,
      treatedAt: status === "done" ? new Date() : null,
    },
  });

  revalidatePath("/incidents");
}
