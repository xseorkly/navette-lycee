async function importUsersFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        if (!rows.length) { resolve({ success: false, error: 'empty', count: 0 }); return; }

        const required = ['nom_utilisateur', 'mot_de_passe', 'nom_complet', 'email'];
        const missing = required.filter(col => !(col in rows[0]));
        if (missing.length) { resolve({ success: false, error: 'missing_columns', missing, count: 0 }); return; }

        let imported = 0, errors = [];

        for (const row of rows) {
          const username = String(row.nom_utilisateur).trim().toLowerCase();
          const password = String(row.mot_de_passe).trim();
          const fullName = String(row.nom_complet).trim();
          const email = String(row.email).trim().toLowerCase();
          const role = row.role ? String(row.role).trim().toLowerCase() : 'personnel';

          if (!username || !password || !fullName || !email) { errors.push(username || 'vide'); continue; }

          const encoder = new TextEncoder();
          const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
          const passwordHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

          const { error: dbError } = await db
            .from('users')
            .upsert({ username, password_hash: passwordHash, full_name: fullName, email, role }, { onConflict: 'username' });

          if (dbError) errors.push(username); else imported++;
        }
        resolve({ success: true, count: imported, errors });
      } catch(err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Erreur lecture'));
    reader.readAsArrayBuffer(file);
  });
}

async function getAllUsers() {
  const { data, error } = await db
    .from('users')
    .select('id, username, full_name, email, role')
    .order('full_name', { ascending: true });
  if (error) return [];
  return data || [];
}

async function deleteUser(userId) {
  const { error } = await db.from('users').delete().eq('id', userId);
  return !error;
}

async function addUser(username, password, fullName, email, role = 'personnel') {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  const passwordHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  const { error } = await db.from('users').insert({
    username: username.trim().toLowerCase(),
    password_hash: passwordHash,
    full_name: fullName.trim(),
    email: email.trim().toLowerCase(),
    role
  });
  return !error;
}

async function exportReservationsCSV(weekStart) {
  const reservations = await getReservationsForWeek(weekStart);
  if (!reservations.length) return;
  const rows = [['Nom complet', 'Email', 'Date de réservation']];
  reservations.forEach(r => {
    rows.push([r.users?.full_name || '', r.users?.email || '', new Date(r.created_at).toLocaleString('fr-FR')]);
  });
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `navette-${weekStart}.csv`; a.click();
  URL.revokeObjectURL(url);
}
