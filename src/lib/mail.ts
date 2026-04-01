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

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "2FA Code - Asenso Shared Treasury",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #059669; padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-style: italic;">Asenso</h1>
        </div>
        <div style="padding: 40px; color: #1e293b;">
          <h2 style="margin-top: 0;">Ang Inyong 2FA Code</h2>
          <p>Gamitin ang code sa ibaba upang makapasok sa iyong Asenso account.</p>
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 30px 0;">
            ${token}
          </div>
          <p style="font-size: 14px; color: #64748b;">Kung hindi mo ito hiningi, maaari mo itong balewalain.</p>
        </div>
      </div>
    `,
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-verification?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "I-verify ang iyong Asenso Account",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #059669; padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-style: italic;">Asenso</h1>
        </div>
        <div style="padding: 40px; color: #1e293b;">
          <h2>Handa na ang iyong Asenso!</h2>
          <p>Salamat sa pagrehistro. I-click ang button sa ibaba upang i-verify ang iyong account.</p>
          <a href="${confirmLink}" style="display: block; width: 200px; margin: 30px auto; padding: 15px; background-color: #059669; color: white; text-decoration: none; text-align: center; border-radius: 30px; font-weight: bold;">I-verify ang Account</a>
          <p style="font-size: 14px; color: #64748b;">O i-copy itong link sa iyong browser: ${confirmLink}</p>
        </div>
      </div>
    `,
  });
};
