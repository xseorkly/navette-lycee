async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function login(username, password) {
  try {
    const hash = await hashPassword(password);
    const { data, error } = await db
      .from('users')
      .select('id, username, full_name, email, role, password_hash')
      .eq('username', username.trim().toLowerCase())
      .single();
    if (error || !data) return { success: false };
    if (data.password_hash !== hash) return { success: false };
    const session = {
      id: data.id, username: data.username, full_name: data.full_name,
      email: data.email, role: data.role, loginAt: new Date().toISOString()
    };
    sessionStorage.setItem('navette_user', JSON.stringify(session));
    return { success: true, user: session };
  } catch (e) {
    console.error('Login error:', e);
    return { success: false };
  }
}

function logout() {
  sessionStorage.removeItem('navette_user');
  window.location.href = 'index.html';
}

function getCurrentUser() {
  const raw = sessionStorage.getItem('navette_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function requireAuth(adminOnly = false) {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'index.html'; return null; }
  if (adminOnly && user.role !== 'admin') { window.location.href = 'dashboard.html'; return null; }
  return user;
}

function generateTempPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pass = '';
  for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
}

async function resetPasswordByEmail(username) {
  try {
    const { data, error } = await db
      .from('users')
      .select('id, username, email, full_name')
      .eq('username', username.trim().toLowerCase())
      .single();
    if (error || !data) return { success: false, error: 'not_found' };

    const tempPassword = generateTempPassword();
    const hash = await hashPassword(tempPassword);

    const { error: updateError } = await db
      .from('users')
      .update({ password_hash: hash })
      .eq('id', data.id);
    if (updateError) return { success: false, error: 'db' };

    // Appel direct à la Edge Function via fetch
    const res = await fetch('https://bypkuthotyjaigdohoiz.supabase.co/functions/v1/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        type: 'reset_password',
        email: data.email,
        username: data.username,
        tempPassword: tempPassword
      })
    });

    if (!res.ok) return { success: false, error: 'email' };
    return { success: true, email: data.email };

  } catch (e) {
    console.error('Reset error:', e);
    return { success: false, error: 'unknown' };
  }
}
