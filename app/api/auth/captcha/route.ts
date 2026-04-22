import { createCaptchaChallenge } from "@/lib/captcha";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(createCaptchaChallenge(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
