const TRANSLATIONS = {
  fr: {
    appName: 'Navette du Personnel',
    schoolName: 'Lycée Français Anna de Noailles — Bucarest',
    logout: 'Déconnexion',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    loginTitle: 'Connexion',
    loginSubtitle: 'Réservez votre place dans la navette',
    username: "Nom d'utilisateur",
    password: 'Mot de passe',
    loginButton: 'Se connecter',
    loginError: "Nom d'utilisateur ou mot de passe incorrect.",
    usernamePlaceholder: 'Entrez votre identifiant',
    passwordPlaceholder: 'Entrez votre mot de passe',
    welcome: 'Bonjour',
    weekLabel: 'Semaine du',
    placesAvailable: 'places disponibles',
    placesOccupied: 'places occupées',
    totalPlaces: 'places au total',
    myReservation: 'Ma réservation',
    reserveButton: 'Réserver ma place',
    cancelButton: 'Annuler ma réservation',
    reservedSuccess: 'Votre place a été réservée avec succès !',
    cancelledSuccess: 'Votre réservation a été annulée.',
    alreadyReserved: 'Vous avez déjà une réservation pour cette semaine.',
    shuttleFull: 'La navette est complète. Aucune place disponible.',
    notOpenYet: 'Les réservations ouvrent le jeudi pour la semaine suivante.',
    listTitle: 'Liste des réservations',
    noReservations: 'Aucune réservation pour cette semaine.',
    reservedOn: 'Réservé le',
    cancelConfirm: 'Êtes-vous sûr de vouloir annuler votre réservation ?',
    langSwitch: 'Română',
    adminTitle: 'Administration',
    importTitle: 'Importer les utilisateurs (Excel)',
    importButton: 'Importer le fichier Excel',
    importSuccess: 'Utilisateurs importés avec succès.',
    importError: "Erreur lors de l'importation.",
    importInstructions: 'Le fichier Excel doit contenir : nom_utilisateur, mot_de_passe, nom_complet, email',
    usersTitle: 'Gestion des utilisateurs',
    deleteUser: 'Supprimer',
    totalUsers: 'Utilisateurs total',
    weekReservations: 'Réservations cette semaine',
    colName: 'Nom complet',
    colUsername: 'Identifiant',
    colEmail: 'Email',
    colActions: 'Actions',
    reminderSent: 'Rappel envoyé à tous les inscrits.',
    noReservations: 'Aucune réservation pour cette semaine.',
  },
  ro: {
    appName: 'Naveta Personalului',
    schoolName: 'Liceul Francez Anna de Noailles — București',
    logout: 'Deconectare',
    loading: 'Se încarcă...',
    error: 'Eroare',
    success: 'Succes',
    loginTitle: 'Autentificare',
    loginSubtitle: 'Rezervați-vă locul în navetă',
    username: 'Nume utilizator',
    password: 'Parolă',
    loginButton: 'Conectare',
    loginError: 'Nume utilizator sau parolă incorectă.',
    usernamePlaceholder: 'Introduceți identificatorul',
    passwordPlaceholder: 'Introduceți parola',
    welcome: 'Bună ziua',
    weekLabel: 'Săptămâna din',
    placesAvailable: 'locuri disponibile',
    placesOccupied: 'locuri ocupate',
    totalPlaces: 'locuri în total',
    myReservation: 'Rezervarea mea',
    reserveButton: 'Rezervați locul meu',
    cancelButton: 'Anulați rezervarea',
    reservedSuccess: 'Locul dvs. a fost rezervat cu succes !',
    cancelledSuccess: 'Rezervarea dvs. a fost anulată.',
    alreadyReserved: 'Aveți deja o rezervare pentru această săptămână.',
    shuttleFull: 'Naveta este completă. Niciun loc disponibil.',
    notOpenYet: 'Rezervările se deschid joi pentru săptămâna viitoare.',
    listTitle: 'Lista rezervărilor',
    noReservations: 'Nicio rezervare pentru această săptămână.',
    reservedOn: 'Rezervat pe',
    cancelConfirm: 'Sigur doriți să anulați rezervarea ?',
    langSwitch: 'Français',
    adminTitle: 'Administrare',
    importTitle: 'Importați utilizatorii (Excel)',
    importButton: 'Importați fișierul Excel',
    importSuccess: 'Utilizatorii au fost importați cu succes.',
    importError: 'Eroare la importare.',
    importInstructions: 'Fișierul Excel trebuie să conțină: nom_utilisateur, mot_de_passe, nom_complet, email',
    usersTitle: 'Gestionarea utilizatorilor',
    deleteUser: 'Șterge',
    totalUsers: 'Total utilizatori',
    weekReservations: 'Rezervări această săptămână',
    colName: 'Nume complet',
    colUsername: 'Identificator',
    colEmail: 'Email',
    colActions: 'Acțiuni',
    reminderSent: 'Reminder trimis tuturor înscriși.',
    noReservations: 'Nicio rezervare pentru această săptămână.',
  }
};

let currentLang = localStorage.getItem('navette_lang') || DEFAULT_LANG;

function t(key) {
  return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key])
    || (TRANSLATIONS['fr'] && TRANSLATIONS['fr'][key])
    || key;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('navette_lang', lang);
  document.documentElement.lang = lang;
  if (typeof renderPage === 'function') renderPage();
}

function toggleLang() {
  setLang(currentLang === 'fr' ? 'ro' : 'fr');
}
