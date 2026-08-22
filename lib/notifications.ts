import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const resend = new Resend(RESEND_API_KEY);

const RAW_FROM = process.env.RESEND_FROM_EMAIL || 'Kin <onboarding@resend.dev>';
// In Resend free tier without verified domain, from must be onboarding@resend.dev
const DEFAULT_FROM = RAW_FROM.includes('@gmail.com') ? 'Kin <onboarding@resend.dev>' : RAW_FROM;

export async function sendSignalAlertEmail(params: {
  toEmail: string;
  recipientName?: string;
  signal: {
    title: string;
    summary: string;
    site: string;
    category_name: string;
    importance: string;
    why_it_matters?: string;
  };
}) {
  const { toEmail, signal } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kinn-git-main-lith-tech.vercel.app';

  const importanceColor = signal.importance === 'high' ? '#DC2626' : '#2D5F8A';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FAFAF7; margin: 0; padding: 24px; color: #1A1A1E; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid rgba(0,0,0,0.08); overflow: hidden; }
    .header { padding: 24px; border-bottom: 1px solid rgba(0,0,0,0.06); background: #ffffff; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; background: rgba(0,0,0,0.05); color: #5A5D6B; }
    .imp-high { background: rgba(220,38,38,0.1); color: #DC2626; }
    .content { padding: 24px; }
    .title { font-size: 18px; font-weight: 700; margin: 12px 0 8px; color: #1A1A1E; }
    .summary { font-size: 14px; line-height: 1.6; color: #5A5D6B; margin-bottom: 16px; }
    .matters { background: #FAFAF7; border-left: 3px solid ${importanceColor}; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 20px; font-size: 13px; color: #1A1A1E; }
    .btn { display: inline-block; background: #1A1A1E; color: #ffffff !important; text-decoration: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 13px; }
    .footer { padding: 18px 24px; background: #FAFAF7; border-top: 1px solid rgba(0,0,0,0.06); font-size: 11.5px; color: #8A8D9A; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span class="badge ${signal.importance === 'high' ? 'imp-high' : ''}">${signal.category_name.toUpperCase()} â€¢ ${signal.importance.toUpperCase()} PRIORITY</span>
        <span style="font-size: 12px; color: #8A8D9A;">${signal.site}</span>
      </div>
    </div>
    <div class="content">
      <div class="title">${signal.title}</div>
      <div class="summary">${signal.summary}</div>
      ${signal.why_it_matters ? `<div class="matters"><strong>Why it matters:</strong> ${signal.why_it_matters}</div>` : ''}
      <div style="margin-top: 24px;">
        <a href="${appUrl}/app/signals" class="btn">View in Kin Dashboard â†’</a>
      </div>
    </div>
    <div class="footer">
      Monitored automatically by Kin AI â€¢ <a href="${appUrl}/app/settings" style="color: #2D5F8A; text-decoration: none;">Notification preferences</a>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const res = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [toEmail],
      subject: `ðŸš¨ [Kin Signal] ${signal.title}`,
      html,
    });
    return { success: true, id: res.data?.id };
  } catch (error: any) {
    console.warn('Resend email error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendDigestEmail(params: {
  toEmail: string;
  recipientName?: string;
  signals: any[];
}) {
  const { toEmail, signals } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kinn-git-main-lith-tech.vercel.app';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FAFAF7; margin: 0; padding: 24px; color: #1A1A1E; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid rgba(0,0,0,0.08); overflow: hidden; }
    .header { padding: 28px; background: #1A1A1E; color: white; text-align: center; }
    .content { padding: 24px; }
    .signal-item { padding: 14px 0; border-bottom: 1px solid rgba(0,0,0,0.06); }
    .footer { padding: 18px 24px; background: #FAFAF7; border-top: 1px solid rgba(0,0,0,0.06); font-size: 11.5px; color: #8A8D9A; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 style="margin: 0 0 6px; font-size: 20px;">ðŸ§ Kin Weekly Intelligence Brief</h2>
      <p style="margin: 0; font-size: 13px; opacity: 0.8;">Summary of ${signals.length} meaningful changes detected this week</p>
    </div>
    <div class="content">
      ${signals.length === 0 ? '<p style="color: #8A8D9A; text-align: center;">No changes detected this week across your monitored websites.</p>' : ''}
      ${signals.slice(0, 8).map(s => `
        <div class="signal-item">
          <div style="font-size: 11px; font-weight: 700; color: #2D5F8A; text-transform: uppercase;">${s.category_name || s.category} â€¢ ${s.site || 'Site'}</div>
          <div style="font-size: 14px; font-weight: 700; margin: 4px 0; color: #1A1A1E;">${s.title}</div>
          <div style="font-size: 13px; color: #5A5D6B; line-height: 1.5;">${s.summary}</div>
        </div>
      `).join('')}
      <div style="text-align: center; margin-top: 24px;">
        <a href="${appUrl}/app/digest" style="display: inline-block; background: #1A1A1E; color: white; text-decoration: none; padding: 10px 24px; border-radius: 10px; font-weight: 600; font-size: 13px;">Open Full Digest â†’</a>
      </div>
    </div>
    <div class="footer">
      Generated by Kin AI â€¢ Sources verified
    </div>
  </div>
</body>
</html>
  `;

  try {
    const res = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [toEmail],
      subject: `ðŸ§ Kin Weekly Digest: ${signals.length} signal${signals.length !== 1 ? 's' : ''} found`,
      html,
    });
    return { success: true, id: res.data?.id };
  } catch (error: any) {
    console.warn('Resend digest email error:', error.message);
    return { success: false, error: error.message };
  }
}
