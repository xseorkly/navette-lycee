import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = 're_P7gN8c87_Hj3fA6Y5gJZjeg8eAq91zNyw'
const FROM_EMAIL = 'onboarding@resend.dev'
const SUPABASE_URL = Deno.env.get('DB_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('DB_SERVICE_KEY')!

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html })
  })
  return res.ok
}

function emailBase(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    body{font-family:Arial,sans-serif;background:#f5f5f0;margin:0;padding:0}
    .box{max-width:520px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)}
    .top{background:#1a3560;padding:24px 32px;color:white}
    .top h1{font-family:Georgia,serif;font-size:20px;margin:8px 0 4px}
    .top p{font-size:13px;opacity:0.65;margin:0}
    .body{padding:32px;color:#333}
    .body h2{color:#1a3560;font-family:Georgia,serif}
    .info{background:#f5f5f0;border-radius:8px;padding:16px;margin:16px 0}
    .btn{display:inline-block;background:#1a3560;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;margin-top:12px}
    .foot{background:#f5f5f0;padding:16px 32px;text-align:center;font-size:12px;color:#999}
  </style></head><body>
  <div class="box">
    <div class="top"><h1>Navette du Personnel</h1><p>Lycée Français de Bucarest</p></div>
    <div class="body">${content}</div>
    <div class="foot">Lycée Français de Bucarest · Navette du Personnel</div>
  </div></body></html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' } })
  }

  try {
    const body = await req.json()
    const { type, email, username, tempPassword } = body

    if (type === 'reset_password') {
      const html = emailBase(`
        <h2>Réinitialisation du mot de passe</h2>
        <p>Bonjour,</p>
        <p>Votre mot de passe a été réinitialisé. Voici vos nouveaux identifiants :</p>
        <div class="info">
          <p style="margin:0"><strong>Identifiant :</strong> ${username}</p>
          <p style="margin:8px 0 0"><strong>Mot de passe temporaire :</strong> <span style="font-family:monospace;background:#e2e8f0;padding:2px 8px;border-radius:4px">${tempPassword}</span></p>
        </div>
        <p style="font-size:13px;color:#666">Pensez à changer ce mot de passe après votre connexion.</p>
        <a href="https://xseorkly.github.io/navette-lycee/" class="btn">Se connecter</a>
      `)
      await sendEmail(email, 'Navette — Réinitialisation de votre mot de passe', html)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})
