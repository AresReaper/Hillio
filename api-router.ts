import express from 'express';
import QRCode from 'qrcode';
import { Resend } from 'resend';

export const apiRouter = express.Router();

let resendClient: Resend | null = null;
function getResend() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

function getAppUrl() {
  let appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
  if (appUrl.includes('ais-dev')) {
    appUrl = appUrl.replace('ais-dev', 'ais-pre');
  }
  if (process.env.VERCEL_URL) {
    appUrl = `https://${process.env.VERCEL_URL}`;
  }
  return appUrl.replace(/\/$/, '');
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function ticketEmailHtml({
  passengerName,
  tripName,
  destination,
  passUrl,
}: {
  passengerName: string;
  tripName: string;
  destination?: string;
  passUrl: string;
}) {
  const safeName = escapeHtml(passengerName || 'Traveler');
  const safeTrip = escapeHtml(tripName || 'your trip');
  const safeDestination = escapeHtml(destination || 'Departure Terminal');
  const safePassUrl = escapeHtml(passUrl);

  return `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Your Hillo Smart Ticket</title>
      </head>
      <body style="margin:0; padding:0; background:#020617; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#f8fafc;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#020617; padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; border-collapse:separate; border-spacing:0; overflow:hidden; border-radius:32px; background:#f8fafc; color:#0f172a; box-shadow:0 24px 80px rgba(0,0,0,0.35);">
                <tr>
                  <td style="background:linear-gradient(135deg,#064e3b 0%,#1e3a8a 55%,#0f172a 100%); padding:34px 30px 42px; color:#ffffff;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size:28px; font-weight:900; letter-spacing:-1px;">
                          <span style="display:inline-block; width:34px; height:34px; line-height:34px; border-radius:10px; background:#bbff4d; color:#020617; text-align:center; margin-right:8px; vertical-align:middle;">⌃</span>
                          Hillo
                        </td>
                        <td align="right">
                          <span style="display:inline-block; padding:8px 12px; border:1px solid rgba(255,255,255,0.18); border-radius:999px; color:#bbff4d; font-size:10px; font-weight:900; letter-spacing:2px; text-transform:uppercase; background:rgba(255,255,255,0.08);">Smart Ticket</span>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:38px 0 8px; color:#bbff4d; font-size:11px; font-weight:900; letter-spacing:3px; text-transform:uppercase;">Ready to board</p>
                    <h1 style="margin:0; font-size:38px; line-height:1; letter-spacing:-1.5px; font-weight:900; text-transform:uppercase;">${safeName}</h1>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:30px;">
                      <tr>
                        <td style="width:50%; padding-right:10px;">
                          <div style="color:rgba(255,255,255,0.55); font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">Trip</div>
                          <div style="margin-top:6px; color:#fff; font-size:14px; font-weight:900;">${safeTrip}</div>
                        </td>
                        <td align="right" style="width:50%; padding-left:10px;">
                          <div style="color:rgba(255,255,255,0.55); font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">Destination</div>
                          <div style="margin-top:6px; color:#fff; font-size:14px; font-weight:900;">${safeDestination}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:34px 30px 30px; background:#f8fafc;">
                    <p style="margin:0 0 18px; color:#334155; font-size:16px; line-height:1.6;">Your live boarding pass is ready. Open it before boarding to show the latest ticket status and secure QR code.</p>
                    <a href="${safePassUrl}" target="_blank" rel="noopener noreferrer" style="display:block; width:100%; box-sizing:border-box; text-align:center; text-decoration:none; background:#bbff4d; color:#020617; padding:18px 22px; border-radius:18px; font-size:13px; font-weight:900; letter-spacing:2px; text-transform:uppercase; box-shadow:0 16px 32px rgba(187,255,77,0.28);">Open Live Ticket</a>
                    <div style="margin:24px 0; border-top:2px dashed #e2e8f0;"></div>
                    <p style="margin:0 0 8px; color:#64748b; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px;">Ticket link</p>
                    <p style="margin:0; word-break:break-all; color:#0f172a; font-size:13px; line-height:1.5;"><a href="${safePassUrl}" style="color:#064e3b; font-weight:800;">${safePassUrl}</a></p>
                    <p style="margin:24px 0 0; color:#94a3b8; font-size:12px; line-height:1.6;">This email does not attach the ticket image, so the passenger always opens the latest live ticket from Hillo.</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:18px 24px 26px; background:#f8fafc; color:#94a3b8; font-size:10px; font-weight:900; letter-spacing:3px; text-transform:uppercase;">Powered by Hillo</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

apiRouter.get('/qr/:tripId/:userId', async (req, res) => {
  try {
    const { tripId } = req.params;
    let { userId } = req.params;
    if (userId.endsWith('.png')) {
      userId = userId.replace('.png', '');
    }
    
    const qrData = JSON.stringify({ t: tripId, u: userId });
    const qrBuffer = await QRCode.toBuffer(qrData, {
      width: 400,
      margin: 2,
      color: { dark: '#064e3b', light: '#ffffff' }
    });
    res.setHeader('Content-Type', 'image/png');
    res.send(qrBuffer);
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).send('Error generating QR code');
  }
});

apiRouter.get('/qr/:tripId/:userId.png', async (req, res) => {
  try {
    const { tripId } = req.params;
    let { userId } = req.params;
    if (userId.endsWith('.png')) {
      userId = userId.replace('.png', '');
    }
    
    const qrData = JSON.stringify({ t: tripId, u: userId });
    const qrBuffer = await QRCode.toBuffer(qrData, {
      width: 400,
      margin: 2,
      color: { dark: '#064e3b', light: '#ffffff' }
    });
    res.setHeader('Content-Type', 'image/png');
    res.send(qrBuffer);
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).send('Error generating QR code');
  }
});

apiRouter.get('/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ error: 'Missing address parameter' });
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address as string)}&limit=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ReactApplet/1.0 (admin@hilltrip.com)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Geocoding Proxy Error:', error);
    res.status(500).json({ error: 'Failed to geocode address' });
  }
});

apiRouter.get('/shorten', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url as string)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const shortUrl = await response.text();
    res.json({ shortUrl });
  } catch (error) {
    console.error('TinyURL Proxy Error:', error);
    res.status(500).json({ error: 'Failed to shorten URL' });
  }
});

apiRouter.post('/notify', async (req, res) => {
  try {
    const { users = [], tripName, destination } = req.body;
    const appUrl = getAppUrl();
    const resendClient = getResend();

    if (!resendClient) {
      return res.json({ 
        success: true, 
        missingKeys: true, 
        message: 'Resend API key is not configured. Email notifications skipped.' 
      });
    }

    const results = [];

    for (const user of users) {
      const passUrl = `${appUrl}/trip/${user.tripId}/user/${user.id}`;
      let notified = false;

      if (user.email && user.tripId && user.id) {
        try {
          await resendClient.emails.send({
            from: process.env.RESEND_FROM || 'Hillo Tickets <onboarding@resend.dev>',
            to: user.email,
            subject: `Your live Hillo ticket for ${tripName}`,
            html: ticketEmailHtml({
              passengerName: user.name,
              tripName,
              destination,
              passUrl,
            }),
          });
          notified = true;
        } catch (e) {
          console.error(`Resend error for ${user.email}:`, e);
        }
      }

      results.push({ id: user.id, notified });
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Notify API Error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
