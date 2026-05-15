import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FEEDBACK_NOTIFICATION_TO =
  process.env.FEEDBACK_NOTIFICATION_TO ||
  process.env.SMTP_FEEDBACK_TO ||
  "agapay.saas@gmail.com";

const NON_ROUTABLE_TLDS = new Set([
  "demo",
  "example",
  "invalid",
  "localhost",
  "local",
  "test",
]);

function getEmailDomain(email: string) {
  return email.trim().toLowerCase().split("@")[1] || "";
}

export function isDeliverableEmailAddress(email: string) {
  const normalized = email.trim().toLowerCase();
  const domain = getEmailDomain(normalized);

  if (!normalized || !domain) {
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return false;
  }

  const tld = domain.split(".").pop() || "";
  if (NON_ROUTABLE_TLDS.has(tld)) {
    return false;
  }

  return true;
}

async function guardedSendMail(options: nodemailer.SendMailOptions) {
  const recipients = [options.to, options.cc, options.bcc]
    .flat()
    .filter(Boolean)
    .flatMap((value) =>
      typeof value === "string" ? value.split(",") : [String(value)],
    )
    .map((value) => value.trim())
    .filter(Boolean);

  const undeliverable = recipients.filter(
    (email) => !isDeliverableEmailAddress(email),
  );

  if (undeliverable.length > 0) {
    console.warn(
      `[mail] Skipping outbound email for non-routable recipient(s): ${undeliverable.join(", ")}`,
    );
    return { delivered: false, skipped: true as const };
  }

  await transporter.sendMail(options);
  return { delivered: true, skipped: false as const };
}

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  return guardedSendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "2FA Code - Agapay Shared Treasury",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #059669; padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-style: italic;">Agapay</h1>
        </div>
        <div style="padding: 40px; color: #1e293b;">
          <h2 style="margin-top: 0;">Your 2FA Code</h2>
          <p>Use the code below to sign in to your Agapay account.</p>
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 30px 0;">
            ${token}
          </div>
          <p style="font-size: 14px; color: #64748b;">If you did not request this, you can safely ignore it.</p>
        </div>
      </div>
    `,
  });
};

export const verifyEmailExists = async (email: string): Promise<boolean> => {
  // Real-time SMTP Verification Helper (Pre-check)
  // This simulates the check for AbstractAPI / SendGrid Validation
  // Logic:
  // 1. Basic Regex (NextAuth already does this, but we're strict)
  // 2. Domain existence check (Simulated)
  // 3. Blacklist check (Simulated)

  const domain = email.split("@")[1];
  const blacklist = ["tempmail.com", "burner.com", "test-fake.com"];

  if (blacklist.includes(domain)) return false;

  // Simulation: Fail if email contains "fake" or "nonexistent"
  if (email.includes("fake") || email.includes("nonexistent")) return false;

  return true;
};

export const sendVerificationEmail = async (email: string, token: string, tenantSlug?: string) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://agapay-saas.vercel.app";
  const slugPath = tenantSlug ? `/${tenantSlug}` : "";
  const confirmLink = `${baseUrl}${slugPath}/auth/new-verification?token=${token}`;

  return guardedSendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Verify your Agapay account",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #059669; padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-style: italic;">Agapay</h1>
        </div>
        <div style="padding: 40px; color: #1e293b;">
          <h2>You Are Now Ready for Agapay!</h2>
          <p>Thank you for registering. Click the button below to verify your account.</p>
          <a href="${confirmLink}" style="display: block; width: 200px; margin: 30px auto; padding: 15px; background-color: #059669; color: white; text-decoration: none; text-align: center; border-radius: 30px; font-weight: bold;">Verify Account</a>
          <p style="font-size: 14px; color: #64748b;">Or copy this link to your browser: ${confirmLink}</p>
        </div>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `\${baseUrl}/auth/new-password?token=\${token}`;
  return guardedSendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Reset Your Password - Agapay",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #059669; padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-style: italic;">Agapay</h1>
        </div>
        <div style="padding: 40px; color: #1e293b;">
          <h2>Forgot Your Password?</h2>
          <p>Click the button below to reset your password for Agapay. This link is valid for one hour only.</p>
          <a href="${resetLink}" style="display: block; width: 200px; margin: 30px auto; padding: 15px; background-color: #059669; color: white; text-decoration: none; text-align: center; border-radius: 30px; font-weight: bold;">Reset Password</a>
          <p style="font-size: 14px; color: #64748b;">Or copy this link to your browser: ${resetLink}</p>
          <p style="font-size: 14px; color: #64748b; margin-top: 20px;">If you did not request this, you can safely ignore it.</p>
        </div>
      </div>
    `,
  });
};

export const sendTenantScopedPasswordResetEmail = async ({
  email,
  token,
  tenantName,
}: {
  email: string;
  token: string;
  tenantName?: string | null;
}) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://agapay-saas.vercel.app";
  const resetLink = `${baseUrl}/auth/new-password?token=${token}`;
  const tenantLabel = tenantName?.trim() || "iyong cooperative account";

  return guardedSendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Reset your Password - ${tenantLabel}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #059669; padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-style: italic;">Agapay</h1>
        </div>
        <div style="padding: 40px; color: #1e293b;">
          <h2>Forgot Your Password?</h2>
          <p>Click the button below to reset your password for <strong>${tenantLabel}</strong>. This link is valid for one hour only.</p>
          <a href="${resetLink}" style="display: block; width: 200px; margin: 30px auto; padding: 15px; background-color: #059669; color: white; text-decoration: none; text-align: center; border-radius: 30px; font-weight: bold;">Reset Password</a>
          <p style="font-size: 14px; color: #64748b;">Or copy this link to your browser: ${resetLink}</p>
          <p style="font-size: 14px; color: #64748b; margin-top: 20px;">If you did not request this, you can safely ignore it.</p>
        </div>
      </div>
    `,
  });
};

export const sendFeedbackNotificationEmail = async ({
  name,
  email,
  category,
  pagePath,
  subject,
  message,
}: {
  name: string;
  email?: string | null;
  category: string;
  pagePath?: string | null;
  subject?: string | null;
  message: string;
}) => {
  const normalizedSubject =
    subject?.trim() || `New ${category} feedback from ${name}`;

  return guardedSendMail({
    from: `"${name} via Agapay" <${process.env.SMTP_USER}>`,
    to: FEEDBACK_NOTIFICATION_TO,
    replyTo: email || undefined,
    subject: `[Agapay Feedback] ${normalizedSubject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 680px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #059669; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-style: italic;">Agapay Feedback Inbox</h1>
        </div>
        <div style="padding: 32px; color: #1e293b;">
          <h2 style="margin-top: 0;">There is a new feedback submission</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tbody>
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 160px;">Name</td>
                <td style="padding: 8px 0; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Email</td>
                <td style="padding: 8px 0; font-weight: 600;">${email || "None given"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Category</td>
                <td style="padding: 8px 0; font-weight: 600;">${category}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Page</td>
                <td style="padding: 8px 0; font-weight: 600;">${pagePath || "None stated"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Subject</td>
                <td style="padding: 8px 0; font-weight: 600;">${subject || "No subject"}</td>
              </tr>
            </tbody>
          </table>
          <div style="padding: 20px; background-color: #f8fafc; border-radius: 12px; white-space: pre-line; line-height: 1.6;">
            ${message}
          </div>
        </div>
      </div>
    `,
  });
};

export const sendSystemNotificationEmail = async ({
  to,
  subject,
  title,
  body,
  actionUrl,
}: {
  to: string;
  subject: string;
  title: string;
  body: string;
  actionUrl?: string | null;
}) => {
  return guardedSendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 640px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 28px; text-align: center;">
          <h1 style="color: white; margin: 0; font-style: italic;">Agapay</h1>
        </div>
        <div style="padding: 32px; color: #1e293b;">
          <h2 style="margin-top: 0;">${title}</h2>
          <div style="white-space: pre-line; line-height: 1.65;">${body}</div>
          ${
            actionUrl
              ? `<a href="${actionUrl}" style="display:inline-block; margin-top:24px; padding:12px 20px; background-color:#059669; color:white; text-decoration:none; border-radius:999px; font-weight:700;">Access in Agapay</a>`
              : ""
          }
        </div>
      </div>
    `,
  });
};
