const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@cloudnest.com';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'CloudNest';

async function sendEmail({ to, subject, html }) {
    if (!BREVO_API_KEY) {
        console.warn('[Email] BREVO_API_KEY not configured, skipping email');
        return { success: false, message: 'Email service not configured' };
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': BREVO_API_KEY,
                'accept': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: BREVO_SENDER_NAME,
                    email: BREVO_SENDER_EMAIL
                },
                to: [{ email: to }],
                subject: subject,
                htmlContent: html
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[Email] Brevo API error:', data);
            return { success: false, message: data.message || 'Failed to send email' };
        }

        return { success: true, messageId: data.messageId };
    } catch (error) {
        console.error('[Email] Send failed:', error.message);
        return { success: false, message: error.message };
    }
}

async function sendUploadNotification({ to, fileName, userName, uploadDate }) {
    const subject = `New file uploaded: ${fileName}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3b82f6, #10b981); padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 20px;">📁 New File Uploaded</h1>
            </div>
            <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0;">
                <p style="color: #334155; font-size: 16px;">Hello,</p>
                <p style="color: #334155;">A new file has been uploaded to your CloudNest account:</p>
                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 15px 0;">
                    <p style="margin: 5px 0; color: #64748b;"><strong>File:</strong> ${fileName}</p>
                    <p style="margin: 5px 0; color: #64748b;"><strong>Uploaded by:</strong> ${userName}</p>
                    <p style="margin: 5px 0; color: #64748b;"><strong>Date:</strong> ${uploadDate}</p>
                </div>
                <p style="color: #94a3b8; font-size: 12px;">This is an automated notification from CloudNest.</p>
            </div>
            <div style="padding: 15px; text-align: center; background: #f1f5f9;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 CloudNest. All rights reserved.</p>
            </div>
        </div>
    `;

    return sendEmail({ to, subject, html });
}

module.exports = { sendEmail, sendUploadNotification };