import { verifySessionToken, SESSION_COOKIE } from "./session";

export async function getSessionFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  // Parse cookies from header
  const cookies = cookieHeader.split(";").reduce(
    (acc, cookie) => {
      const [key, value] = cookie.split("=");
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    },
    {} as Record<string, string>
  );

  const token = cookies[SESSION_COOKIE];
  return verifySessionToken(token);
}

export async function requireAuth(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return new Response(
      JSON.stringify({ ok: false, message: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  return null; // No error, auth successful
}

export async function requireRole(request: Request, allowedRoles: string[]) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return new Response(
      JSON.stringify({ ok: false, message: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!allowedRoles.includes(session.role)) {
    return new Response(
      JSON.stringify({ ok: false, message: "Forbidden" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return null; // No error, auth successful
}
