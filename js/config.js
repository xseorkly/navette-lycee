const SUPABASE_URL = 'https://bypkuthotyjaigdohoiz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5cGt1dGhvdHlqYWlnZG9ob2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNjI1MDcsImV4cCI6MjA4OTgzODUwN30.Ytty20hkJ1SZXly6T3qdLdP-nZcFsUo9mHI58Jfn6dw';

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DEFAULT_LANG = 'fr';

// Navettes par défaut créées automatiquement
const NAVETTES_DEFAUT = [
  { nom: 'Bus matin', horaire: '07:30', places_max: 19 },
  { nom: 'Bus après-midi', horaire: '17:00', places_max: 19 }
];

// Formate une date en YYYY-MM-DD sans décalage UTC
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Lundi de la semaine en cours
function getCurrentWeekMonday() {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Lundi de la semaine suivante
function getNextWeekMonday() {
  const today = new Date();
  const day = today.getDay();
  const daysUntilNextMonday = day === 0 ? 1 : 8 - day;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilNextMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}

// Jeudi → semaine en cours + suivante | autres jours → semaine en cours
function getAvailableWeeks() {
  const day = new Date().getDay();
  if (day === 6 || day === 0) return [getNextWeekMonday()];
  if (day === 4) return [getCurrentWeekMonday(), getNextWeekMonday()];
  return [getCurrentWeekMonday()];
}

// Les 5 jours lun-ven d'une semaine
function getWeekDays(mondayDate) {
  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    d.setHours(12, 0, 0, 0); // Midi pour éviter décalage DST
    days.push(d);
  }
  return days;
}

function formatDateDisplay(dateStr, lang) {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getWeekLabel(mondayDate, lang) {
  const friday = new Date(mondayDate);
  friday.setDate(mondayDate.getDate() + 4);
  const opts = { day: '2-digit', month: 'long' };
  const loc = lang === 'ro' ? 'ro-RO' : 'fr-FR';
  return mondayDate.toLocaleDateString(loc, opts) + ' — ' + friday.toLocaleDateString(loc, opts);
}
