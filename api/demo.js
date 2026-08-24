const nodemailer = require('nodemailer')


// Rate limiting simple en mémoire
const rateLimitMap = new Map()
function checkRateLimit(ip) {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 5
  const requests = rateLimitMap.get(ip) || []
  const recent = requests.filter(t => now - t < windowMs)
  if (recent.length >= maxRequests) return false
  recent.push(now)
  rateLimitMap.set(ip, recent)
  return true
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' })

  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ ok: false, error: 'Trop de requêtes. Réessayez dans une minute.' })
  }

  // Anti-spam honeypot
  const { prenom, nom, email, org, tel, role, message, website } = req.body || {}
  if (website) return res.status(200).json({ ok: true }) // honeypot

  // Validation
  if (!prenom || !nom || !email || !org) {
    return res.status(400).json({ ok: false, error: 'Champs obligatoires manquants' })
  }

  const transporter = nodemailer.createTransport({
    host: 'mail.systalink.com',
    port: 465,
    secure: true,
    auth: {
      user: 'contact@lecorrespondant.ci',
      pass: process.env.SMTP_PASSWORD || 'Garba+Poisson2.0'
    },
    tls: { rejectUnauthorized: false } // Note: passer à true en production avec cert valide
  })

  const emailHtml = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
    <div style="background:#024EA6;padding:32px 40px">
      <div style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-.3px">LE CORRESPONDANT</div>
      <div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:4px">Nouvelle demande de démo</div>
    </div>
    <div style="padding:32px 40px">
      <div style="background:#f8fafc;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #e2e8f0">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;font-size:13px;color:#64748b;width:140px">Prénom & Nom</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#1a1a1a">${prenom} ${nom}</td></tr>
          <tr><td style="padding:8px 0;font-size:13px;color:#64748b">Email</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#024EA6"><a href="mailto:${email}" style="color:#024EA6">${email}</a></td></tr>
          <tr><td style="padding:8px 0;font-size:13px;color:#64748b">Organisation</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#1a1a1a">${org}</td></tr>
          ${tel ? `<tr><td style="padding:8px 0;font-size:13px;color:#64748b">Téléphone</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#1a1a1a">${tel}</td></tr>` : ''}
          ${role ? `<tr><td style="padding:8px 0;font-size:13px;color:#64748b">Fonction</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#1a1a1a">${role}</td></tr>` : ''}
          ${message ? `<tr><td style="padding:8px 0;font-size:13px;color:#64748b;vertical-align:top">Message</td><td style="padding:8px 0;font-size:14px;color:#1a1a1a;line-height:1.6">${message}</td></tr>` : ''}
        </table>
      </div>
      <div style="background:#EFF6FF;border-radius:10px;padding:16px;border-left:4px solid #024EA6;font-size:13px;color:#1e40af;line-height:1.6">
        📅 Répondez rapidement à cette demande pour planifier une démonstration de la plateforme.
      </div>
    </div>
    <div style="padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;font-size:12px;color:#94a3b8">
      LE CORRESPONDANT — Cabinet SMS — contact@sms-ci.net — +225 07 88 88 67 67
    </div>
  </div>
</body>
</html>`

  // Email de confirmation à l'utilisateur
  const confirmHtml = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
    <div style="background:#024EA6;padding:32px 40px">
      <div style="font-size:20px;font-weight:800;color:#fff">LE CORRESPONDANT</div>
      <div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:4px">Votre demande de démo a bien été reçue</div>
    </div>
    <div style="padding:32px 40px">
      <p style="font-size:16px;font-weight:600;color:#1a1a1a;margin-bottom:12px">Bonjour ${prenom},</p>
      <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:20px">Merci pour votre intérêt pour <strong>LE CORRESPONDANT</strong>. Votre demande de démonstration a bien été reçue et sera traitée dans les plus brefs délais.</p>
      <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0">
        <p style="font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">Votre demande</p>
        <p style="font-size:14px;color:#1a1a1a;margin-bottom:6px"><strong>Organisation :</strong> ${org}</p>
        <p style="font-size:14px;color:#1a1a1a"><strong>Email :</strong> ${email}</p>
      </div>
      <p style="font-size:15px;color:#374151;line-height:1.7">Notre équipe vous contactera très prochainement pour planifier votre démonstration personnalisée.</p>
    </div>
    <div style="padding:24px 40px;background:#024EA6;text-align:center">
      <a href="https://platform.lecorrespondant.ci" style="display:inline-block;background:#C00068;color:#fff;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">Accéder à la plateforme</a>
    </div>
    <div style="padding:20px 40px;text-align:center;font-size:12px;color:#94a3b8">
      Cabinet SMS — contact@sms-ci.net — +225 07 88 88 67 67<br>Abidjan, Côte d'Ivoire
    </div>
  </div>
</body>
</html>`

  try {
    // Email aux destinataires
    await transporter.sendMail({
      from: '"LE CORRESPONDANT" <contact@lecorrespondant.ci>',
      to: ['contact@sms-ci.net', 'etinanicet2@gmail.com'],
      subject: `🚀 Nouvelle demande de démo — ${org} (${prenom} ${nom})`,
      html: emailHtml,
      replyTo: email
    })

    // Email de confirmation à l'utilisateur
    await transporter.sendMail({
      from: '"LE CORRESPONDANT" <contact@lecorrespondant.ci>',
      to: email,
      subject: 'Votre demande de démonstration — LE CORRESPONDANT',
      html: confirmHtml
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('SMTP error:', err)
    return res.status(500).json({ ok: false, error: 'Erreur envoi email. Contactez contact@sms-ci.net' })
  }
}
