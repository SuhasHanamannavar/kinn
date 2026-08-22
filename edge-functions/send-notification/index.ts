// ============================================================
// Edge Function: send-notification
// Sends email notification via Resend when a new signal is detected
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'alerts@kin.example.com';
const APP_URL = Deno.env.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';

function buildSignalEmailHtml(signal: any, userEmail: string): string {
  const importanceColors: Record<string, string> = {
    high: '#DC2626',
    med: '#D97706',
    low: '#6B7280',
  };
  
  const categoryColors: Record<string, { bg: string; text: string }> = {
    content: { bg: 'rgba(8,145,178,0.08)', text: '#0E7490' },
    pricing: { bg: 'rgba(217,119,6,0.08)', text: '#92400E' },
    policy: { bg: 'rgba(124,58,237,0.08)', text: '#5B21B6' },
    feature: { bg: 'rgba(5,150,105,0.08)', text: '#065F46' },
    announce: { bg: 'rgba(190,24,93,0.08)', text: '#9D174D' },
    deadline: { bg: 'rgba(220,38,38,0.08)', text: '#991B1B' },
  };

  const catStyle = categoryColors[signal.category] || categoryColors.content;
  const impColor = importanceColors[signal.importance] || '#6B7280';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kin Alert - ${signal.title}</title>
</head>
<body style="margin:0;padding:0;background:#FAFAF7;font-family:Inter,-apple-system,sans-serif;color:#1A1A1E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="520" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
          
          <!-- Header -->
          <tr>
            <td style="padding:24px 28px;border-bottom:1px solid rgba(0,0,0,0.06);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:20px;font-weight:700;">🐧 Kin</span>
                  </td>
                  <td align="right">
                    <span style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#8A8D9A;">New Signal</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:28px;">
              <span style="display:inline-block;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600;background:${catStyle.bg};color:${catStyle.text};margin-bottom:12px;">
                ${signal.category_name}
              </span>
              <span style="display:inline-block;margin-left:8px;font-size:11px;font-weight:700;color:${impColor};">
                ● ${signal.importance.toUpperCase()}
              </span>
              
              <h1 style="font-size:20px;font-weight:700;margin:12px 0 8px;line-height:1.3;">
                ${signal.title}
              </h1>
              
              <p style="font-size:14px;color:#5A5D6B;line-height:1.6;margin:0 0 16px;">
                ${signal.summary}
              </p>
              
              ${signal.why_it_matters ? `
              <div style="background:rgba(26,26,30,0.04);border:1px solid rgba(0,0,0,0.06);border-radius:10px;padding:14px 16px;margin-bottom:16px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#5A5D6B;margin-bottom:4px;">
                  Why it matters
                </div>
                <div style="font-size:13px;color:#1A1A1E;line-height:1.5;">
                  ${signal.why_it_matters}
                </div>
              </div>
              ` : ''}
              
              <div style="font-size:12px;color:#8A8D9A;margin-bottom:20px;">
                Source: ${signal.site}
              </div>
              
              <a href="${APP_URL}/app/signals" style="display:inline-block;padding:11px 20px;background:#1A1A1E;color:white;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;">
                View in Kin →
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:20px 28px;background:#FAFAF7;border-top:1px solid rgba(0,0,0,0.06);">
              <p style="font-size:11px;color:#8A8D9A;margin:0;">
                You're receiving this because you enabled email alerts on Kin.
                <a href="${APP_URL}/app/settings" style="color:#2D5F8A;text-decoration:none;">Manage preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('apikey');
  if (authHeader !== SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { signal_id, user_id } = await req.json();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Get signal details
    const { data: signal, error: signalError } = await supabase
      .from('signals')
      .select('*')
      .eq('id', signal_id)
      .single();

    if (signalError) throw signalError;

    // Get user email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user_id)
      .single();

    if (profileError) throw profileError;

    // Build and send email via Resend
    const emailHtml = buildSignalEmailHtml(signal, profile.email);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Kin <${RESEND_FROM_EMAIL}>`,
        to: [profile.email],
        subject: `[Kin] ${signal.importance === 'high' ? '⚠️ ' : ''}${signal.title}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status} ${await response.text()}`);
    }

    // Mark signal as notified
    await supabase
      .from('signals')
      .update({ notified: true })
      .eq('id', signal_id);

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: true, email_id: result.id, to: profile.email }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-notification:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
