const DEFAULT_APP_URL = "http://localhost:3000";

export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL).replace(/\/$/, "");
}

export function getVerifyUrl(token: string) {
  return `${getAppUrl()}/verify?token=${encodeURIComponent(token)}`;
}
