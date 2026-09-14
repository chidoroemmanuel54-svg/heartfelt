require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const emails = [];

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log('Incoming:', req.method, req.path);
  next();
});

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'homepage.html'));
});

function serveSayYes(req, res) {
  res.sendFile(path.join(__dirname, 'SayYes.html'));
}

app.get('/sayyes', serveSayYes);
app.get('/SayYes', serveSayYes);
app.get('/SayYes.html', serveSayYes);

const transporter = nodemailer.createTransport(
  process.env.SMTP_HOST
    ? {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }
    : {
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }
);

app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;
  const recipient = email || process.env.EMAIL_TO;

  if (!recipient) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!name || !message) {
    return res.status(400).json({ error: 'Missing name or message' });
  }

  emails.push(recipient);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(500).json({ error: 'SMTP credentials are not configured' });
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: recipient,
    subject: process.env.EMAIL_SUBJECT || `Request accepted by ${name}`,
    text: process.env.EMAIL_TEXT || message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response || info);
    return res.json({ ok: true, message: 'email stored', emails });
  } catch (err) {
    console.error('Error sending email:', err);
    return res.status(500).json({ error: 'Failed to send email', detail: err.message });
  }
});

app.post('/store-email', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  emails.push(email);
  return res.json({ message: 'email stored', emails });
});

app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
