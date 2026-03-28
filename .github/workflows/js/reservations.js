// Récupère les navettes d'une période de dates
async function getNavettesForDates(dateList) {
  const { data, error } = await db
    .from('navettes')
    .select('*')
    .in('jour_date', dateList)
    .order('jour_date', { ascending: true })
    .order('horaire', { ascending: true });
  if (error) { console.error(error); return []; }
  return data || [];
}

// Récupère toutes les réservations pour une liste de navette IDs
async function getReservationsForNavettes(navetteIds) {
  if (!navetteIds.length) return [];
  const { data, error } = await db
    .from('reservations')
    .select('id, navette_id, user_id, created_by, created_at, users(full_name, email)')
    .in('navette_id', navetteIds)
    .order('created_at', { ascending: true });
  if (error) { console.error(error); return []; }
  return data || [];
}

// Réserver une place
async function createReservation(navetteId, userId, createdBy = 'user') {
  // Vérifier places disponibles
  const { data: navette } = await db.from('navettes').select('places_max').eq('id', navetteId).single();
  const { count } = await db.from('reservations').select('id', { count: 'exact', head: true }).eq('navette_id', navetteId);
  if ((count || 0) >= (navette?.places_max || 19)) return { success: false, error: 'full' };

  // Vérifier si déjà inscrit
  const { data: existing } = await db.from('reservations').select('id').eq('navette_id', navetteId).eq('user_id', userId).maybeSingle();
  if (existing) return { success: false, error: 'already' };

  const { error } = await db.from('reservations').insert({ navette_id: navetteId, user_id: userId, created_by: createdBy });
  if (error) return { success: false, error: 'db' };
  return { success: true };
}

// Annuler une réservation
async function cancelReservation(reservationId) {
  const { error } = await db.from('reservations').delete().eq('id', reservationId);
  if (error) return { success: false };
  return { success: true };
}

// Admin : créer une navette
async function createNavette(jourDate, nom, horaire, placesMax) {
  const { error } = await db.from('navettes').insert({ jour_date: jourDate, nom, horaire, places_max: placesMax });
  return !error;
}

// Admin : modifier une navette
async function updateNavette(id, nom, horaire, placesMax) {
  const { error } = await db.from('navettes').update({ nom, horaire, places_max: placesMax }).eq('id', id);
  return !error;
}

// Admin : supprimer une navette
async function deleteNavette(id) {
  const { error } = await db.from('navettes').delete().eq('id', id);
  return !error;
}

// Admin : attribuer un utilisateur à une navette
async function assignUserToNavette(navetteId, userId) {
  return await createReservation(navetteId, userId, 'admin');
}

// Export CSV
async function exportCSV(dateList) {
  const navettes = await getNavettesForDates(dateList);
  if (!navettes.length) return;
  const ids = navettes.map(n => n.id);
  const reservations = await getReservationsForNavettes(ids);

  const rows = [['Date', 'Navette', 'Horaire', 'Nom', 'Email', 'Réservé par']];
  navettes.forEach(nav => {
    const res = reservations.filter(r => r.navette_id === nav.id);
    if (!res.length) {
      rows.push([nav.jour_date, nav.nom, nav.horaire, '—', '—', '—']);
    } else {
      res.forEach(r => {
        rows.push([nav.jour_date, nav.nom, nav.horaire, r.users?.full_name || '—', r.users?.email || '—', r.created_by]);
      });
    }
  });

  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `navettes-export.csv`; a.click();
  URL.revokeObjectURL(url);
}
