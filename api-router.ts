import express from 'express';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';

export const apiRouter = express.Router();

let transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  
  // Basic check: if SMTP isn't setup, we'll return null to skip notifications
  // For most users avoiding custom domains, Gmail + App Passwords is the best route.
  if (!transporter && user && pass) {
    const port = Number(process.env.SMTP_PORT) || 465;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: port,
      secure: port === 465, // true for 465, false for other ports
      auth: { user, pass }
    });
  }
  return transporter;
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
    const { users, tripName } = req.body;
    let appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    if (appUrl.includes('ais-dev')) {
      appUrl = appUrl.replace('ais-dev', 'ais-pre');
    }
    // Hard check for Vercel auto-injected URL if needed
    if (process.env.VERCEL_URL) {
      appUrl = `https://${process.env.VERCEL_URL}`;
    }
    
    const transporter = getTransporter();

    if (!transporter) {
      return res.json({ 
        success: true, 
        missingKeys: true, 
        message: 'SMTP credentials are not configured. Email notifications skipped.' 
      });
    }

    const results = [];

    for (const user of users) {
      const qrUrl = `${appUrl}/api/qr/${user.tripId}/${user.id}.png`;
      const passUrl = `${appUrl}/trip/${user.tripId}/user/${user.id}`;
      let notified = false;

      if (user.email && transporter) {
        try {
          const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Hillo App" <hello@trip.com>',
            to: user.email,
            subject: `Your Boarding Pass for ${tripName} is Ready`,
            html: `
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #020617; color: #ffffff; padding: 40px; border-radius: 24px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #bbff4d; margin: 0; font-size: 32px; letter-spacing: -1px;">Hillo.</h1>
                  <p style="color: rgba(255,255,255,0.6); margin-top: 5px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Smart Ticket System</p>
                </div>
                
                <div style="background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 30px; text-align: center;">
                  <h2 style="margin-top: 0; font-size: 24px;">Hi ${user.name},</h2>
                  <p style="color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 30px;">
                    Your boarding pass for <strong>${tripName}</strong> is ready. Click the button below to view your live Smart Ticket with real-time updates and QR boarding.
                  </p>
                  
                  <a href="${passUrl}" style="display: inline-block; background-color: #bbff4d; color: #020617; text-decoration: none; font-weight: bold; padding: 16px 32px; border-radius: 12px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
                    View Live Ticket
                  </a>
                </div>
                
                <div style="text-align: center; margin-top: 30px; color: rgba(255,255,255,0.4); font-size: 12px;">
                  <p>Powered by Hillo Track • Seamless Tour Logistics</p>
                </div>
              </div>
            `
          });
          
          notified = true;
          results.push({ id: user.id, notified });
        } catch (e: any) {
          console.error(`Nodemailer error for ${user.email}:`, e);
          results.push({ id: user.id, notified: false, error: e.message || String(e) });
        }
      } else {
        results.push({ id: user.id, notified: false, error: 'No email provided' });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Notify API Error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
