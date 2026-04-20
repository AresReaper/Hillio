import express from 'express';
import { createServer as createViteServer } from 'vite';
import QRCode from 'qrcode';
import { Resend } from 'resend';
import path from 'path';

const app = express();
app.use(express.json());
const PORT = 3000;

// Lazy load clients to prevent crashing if keys are missing
let resendClient: Resend | null = null;

function getResend() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// Endpoint to generate and serve QR code image
app.get('/api/qr/:tripId/:userId', async (req, res) => {
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

// Endpoint to generate and serve QR code image with .png extension (better for WhatsApp previews)
app.get('/api/qr/:tripId/:userId.png', async (req, res) => {
  try {
    const { tripId } = req.params;
    let { userId } = req.params;
    // Express might include .png in the userId parameter depending on routing setup
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

// Endpoint to securely proxy OpenStreetMap Geocoding
app.get('/api/geocode', async (req, res) => {
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

// Endpoint to proxy TinyURL for external domain shortening
app.get('/api/shorten', async (req, res) => {
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

// Endpoint to notify users via Email
app.post('/api/notify', async (req, res) => {
  try {
    const { users, tripName } = req.body;
    let appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    if (appUrl.includes('ais-dev')) {
      appUrl = appUrl.replace('ais-dev', 'ais-pre');
    }
    
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
      const qrUrl = `${appUrl}/api/qr/${user.tripId}/${user.id}.png`;
      const passUrl = `${appUrl}/trip/${user.tripId}/user/${user.id}`;
      let notified = false;

      // Send Email
      if (user.email && resendClient) {
        try {
          await resendClient.emails.send({
            from: 'onboarding@resend.dev',
            to: user.email,
            subject: `Your Boarding Pass for ${tripName}`,
            html: `
              <div style="font-family: sans-serif; text-align: center; color: #333;">
                <h2>Hi ${user.name},</h2>
                <p>Here is your boarding pass for <strong>${tripName}</strong>.</p>
                <img src="${qrUrl}" alt="QR Code" style="width: 250px; height: 250px; border-radius: 16px; margin: 20px 0;" />
                <p>Please present this QR code when boarding.</p>
                <p>Or view it online: <a href="${passUrl}" style="color: #064e3b;">View Pass</a></p>
              </div>
            `
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

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    
    // Explicitly set WASM mime type to prevent "wasm streaming compile failed" errors
    express.static.mime.define({'application/wasm': ['wasm']});
    
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
