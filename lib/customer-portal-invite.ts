import { getAppUrl } from "@/lib/urls";

type PortalMailKind = "invite" | "reset";

type PortalMailParams = {
  customerName: string;
  email: string;
  kind: PortalMailKind;
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

function getPortalMailCopy(kind: PortalMailKind, customerName: string, email: string) {
  if (kind === "reset") {
    return {
      title: "Réinitialisation de votre mot de passe",
      intro: `Une réinitialisation du mot de passe a été demandée pour votre espace client final ${customerName}.`,
      body: `Votre identifiant de connexion reste : ${email}. Utilisez le lien ci-dessous pour définir un nouveau mot de passe.`,
      button: "Réinitialiser mon mot de passe",
      subject: `Réinitialisation du portail client final ${customerName}`,
      footer:
        "Une fois le nouveau mot de passe créé, vous pourrez vous reconnecter pour gérer vos codes d'accès, vos scans et vos utilisateurs.",
    };
  }

  return {
    title: "Activation de votre portail client final",
    intro: `Votre espace client final ${customerName} a été créé sur Lantana Verify.`,
    body: `Votre identifiant de connexion est : ${email}. Pour activer votre accès, vous devez créer vous-même votre mot de passe via le lien ci-dessous.`,
    button: "Créer mon mot de passe",
    subject: `Activation de votre portail client final ${customerName}`,
    footer:
      "Une fois votre mot de passe créé, vous pourrez vous connecter pour gérer vos codes d'accès, suivre les scans et administrer votre portail.",
  };
}

function buildPortalMailHtml({ customerName, email, kind }: PortalMailParams) {
  const setupUrl = getSetupUrl();
  const loginUrl = getLoginUrl();
  const copy = getPortalMailCopy(kind, customerName, email);

  return `
    <div style="font-family: Arial, sans-serif; background:#f4f7fb; padding:32px;">
      <div style="max-width:680px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden;">
        <div style="background:#0f766e; color:#ffffff; padding:28px 32px;">
          <div style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; opacity:0.85;">Lantana Verify</div>
          <h1 style="margin:12px 0 0; font-size:30px; line-height:1.1;">${copy.title}</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 16px; color:#0f172a; font-size:16px;">Bonjour,</p>
          <p style="margin:0 0 16px; color:#334155; font-size:16px; line-height:1.7;">${copy.intro}</p>
          <p style="margin:0 0 24px; color:#334155; font-size:16px; line-height:1.7;">${copy.body}</p>
          <div style="margin:0 0 24px;">
            <a href="${setupUrl}" style="display:inline-block; background:#0f766e; color:#ffffff; text-decoration:none; font-weight:700; padding:14px 22px; border-radius:10px;">
              ${copy.button}
            </a>
          </div>
          <div style="margin:0 0 24px; padding:18px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
            <p style="margin:0 0 8px; color:#0f172a; font-weight:700;">Liens utiles</p>
            <p style="margin:0 0 6px; color:#475569;">Création / réinitialisation : <a href="${setupUrl}">${setupUrl}</a></p>
            <p style="margin:0; color:#475569;">Connexion : <a href="${loginUrl}">${loginUrl}</a></p>
          </div>
          <p style="margin:0; color:#64748b; font-size:14px; line-height:1.7;">${copy.footer}</p>
        </div>
      </div>
    </div>
  `;
}

async function sendCustomerPortalEmail(params: PortalMailParams) {
  const { apiKey, from } = getMailConfig();

  if (!apiKey || !from) {
    console.warn("Customer portal email skipped: missing RESEND_API_KEY or MAIL_FROM.");
    return { ok: false, skipped: true as const };
  }

  const copy = getPortalMailCopy(params.kind, params.customerName, params.email);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.email],
      subject: copy.subject,
      html: buildPortalMailHtml(params),
      text: [
        "Bonjour,",
        "",
        copy.intro,
        copy.body,
        `Création / réinitialisation : ${getSetupUrl()}`,
        `Connexion : ${getLoginUrl()}`,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    console.error("Customer portal email failed", response.status, details);
    return { ok: false, skipped: false as const };
  }

  return { ok: true, skipped: false as const };
}

export async function sendCustomerPortalInviteEmail(params: Omit<PortalMailParams, "kind">) {
  return sendCustomerPortalEmail({ ...params, kind: "invite" });
}

export async function sendCustomerPortalResetEmail(params: Omit<PortalMailParams, "kind">) {
  return sendCustomerPortalEmail({ ...params, kind: "reset" });
}
