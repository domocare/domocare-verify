import { getAppUrl } from "@/lib/urls";

type InviteParams = {
  customerName: string;
  email: string;
};

function getSetupUrl() {
  return `${getAppUrl()}/client/setup`;
}

function getLoginUrl() {
  return `${getAppUrl()}/client/login`;
}

function getMailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.MAIL_FROM || process.env.RESEND_FROM,
  };
}

function buildInviteHtml({ customerName, email }: InviteParams) {
  const setupUrl = getSetupUrl();
  const loginUrl = getLoginUrl();

  return `
    <div style="font-family: Arial, sans-serif; background:#f4f7fb; padding:32px;">
      <div style="max-width:680px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden;">
        <div style="background:#0f766e; color:#ffffff; padding:28px 32px;">
          <div style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; opacity:0.85;">Lantana Verify</div>
          <h1 style="margin:12px 0 0; font-size:30px; line-height:1.1;">Activation de votre portail client final</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 16px; color:#0f172a; font-size:16px;">Bonjour,</p>
          <p style="margin:0 0 16px; color:#334155; font-size:16px; line-height:1.7;">
            Votre espace client final <strong>${customerName}</strong> a été créé sur Lantana Verify.
          </p>
          <p style="margin:0 0 16px; color:#334155; font-size:16px; line-height:1.7;">
            Votre identifiant de connexion est : <strong>${email}</strong>
          </p>
          <p style="margin:0 0 24px; color:#334155; font-size:16px; line-height:1.7;">
            Pour activer votre accès, vous devez créer vous-même votre mot de passe via le lien ci-dessous.
          </p>
          <div style="margin:0 0 24px;">
            <a href="${setupUrl}" style="display:inline-block; background:#0f766e; color:#ffffff; text-decoration:none; font-weight:700; padding:14px 22px; border-radius:10px;">
              Créer mon mot de passe
            </a>
          </div>
          <div style="margin:0 0 24px; padding:18px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
            <p style="margin:0 0 8px; color:#0f172a; font-weight:700;">Liens utiles</p>
            <p style="margin:0 0 6px; color:#475569;">Activation : <a href="${setupUrl}">${setupUrl}</a></p>
            <p style="margin:0; color:#475569;">Connexion : <a href="${loginUrl}">${loginUrl}</a></p>
          </div>
          <p style="margin:0; color:#64748b; font-size:14px; line-height:1.7;">
            Une fois votre mot de passe créé, vous pourrez vous connecter pour gérer vos codes d'accès, suivre les scans et administrer votre portail.
          </p>
        </div>
      </div>
    </div>
  `;
}

export async function sendCustomerPortalInviteEmail(params: InviteParams) {
  const { apiKey, from } = getMailConfig();

  if (!apiKey || !from) {
    console.warn("Customer portal invite email skipped: missing RESEND_API_KEY or MAIL_FROM.");
    return { ok: false, skipped: true as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.email],
      subject: `Activation de votre portail client final ${params.customerName}`,
      html: buildInviteHtml(params),
      text: [
        `Bonjour,`,
        ``,
        `Votre espace client final ${params.customerName} a été créé sur Lantana Verify.`,
        `Votre compte est : ${params.email}`,
        `Vous devez créer votre mot de passe ici : ${getSetupUrl()}`,
        `Puis vous connecter ici : ${getLoginUrl()}`,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    console.error("Customer portal invite email failed", response.status, details);
    return { ok: false, skipped: false as const };
  }

  return { ok: true, skipped: false as const };
}
