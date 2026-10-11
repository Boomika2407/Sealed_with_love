import nodemailer from 'nodemailer';

let transporter = null;

// Initialize transporter
async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Development fallback using Ethereal or test stub
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`[Notification] Using Ethereal test mailer: ${testAccount.user}`);
    } catch {
      // Fallback stub transporter for offline/CI environments
      transporter = {
        sendMail: async (mailOptions) => {
          console.log(`[Notification Stub] Email would be sent to: ${mailOptions.to} - Subject: ${mailOptions.subject}`);
          return { messageId: `stub_${Date.now()}` };
        }
      };
    }
  }

  return transporter;
}

/**
 * Sends a notification email informing the student that their capsule has matured.
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.userName - Recipient name
 * @param {string} params.capsuleTitle - Title of the time capsule
 * @param {string} params.spotName - Target campus spot name
 * @param {Date|string} params.unlockDate - Target unlock date
 */
export async function sendCapsuleReadyEmail({ to, userName, capsuleTitle, spotName, unlockDate }) {
  try {
    const mailer = await getTransporter();
    const formattedDate = new Date(unlockDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const info = await mailer.sendMail({
      from: process.env.SMTP_FROM || '"Sealed Campus App" <notifications@sealedapp.college>',
      to,
      subject: `💌 Your time capsule "${capsuleTitle}" is ready to be opened!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #fff5f7; border: 3px solid #ffb6c1; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4a0e4e; margin: 0; font-size: 26px;">💌 Sealed: Time Capsule Network</h1>
            <p style="color: #6b21a8; font-style: italic; margin-top: 4px;">Preserving college memories until the exact moment.</p>
          </div>
          <div style="background: white; border: 2px dashed #ff80bf; border-radius: 12px; padding: 24px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <h2 style="color: #3b0764; margin-top: 0;">Hey ${userName || 'Fellow Student'}! 👋</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              The moment has arrived. Your capsule <strong>"${capsuleTitle}"</strong>, sealed for <em>${formattedDate}</em>, is now ready!
            </p>
            <div style="background: #fdf2f8; border-left: 4px solid #ec4899; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #831843; font-weight: bold;">📍 Location Required: ${spotName}</p>
              <p style="margin: 4px 0 0 0; color: #9d174d; font-size: 14px;">
                Remember: The server will only let you open it when you physically arrive within range of this spot!
              </p>
            </div>
            <p style="color: #4b5563;">Grab your phone, take a walk to <strong>${spotName}</strong>, and press the wax seal to unlock your memories!</p>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
            Sealed Campus Network • Server-Enforced Access Control
          </p>
        </div>
      `
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Notification Error] Failed to send email:', error);
    return { success: false, error: error.message };
  }
}
