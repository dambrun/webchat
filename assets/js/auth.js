/*
Couche "authentification" : seul fichier (avec data.js) qui parle à Supabase.
Les autres scripts passent par `Auth` et ne connaissent pas les détails de Supabase : si on changeait de service, seuls ces fichiers seraient à réécrire.

Convention de Supabase : chaque méthode retourne un objet { data, error } plutôt que de lancer une exception. C'est à l'appelant (nous) de vérifier `error`.
*/

const Auth = {
  async signIn(email, password) {
    return await supabaseClient.auth.signInWithPassword({ 
      email, 
      password 
    });
  },

  async signUp(email, password) {
    return await supabaseClient.auth.signUp({ 
      email, 
      password 
    });
  },

  async signOut() {
    return await supabaseClient.auth.signOut();  
  },

  // Retourne toujours { user, error }, `user` (appelé data dans notre cas) vaut null s'il n'y a pas de session.
  async getUser() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error || !data.session) {
      return { user: null, error: error ?? new Error("Aucune session") };
    }
    return { user: data.session.user, error: null };
  },

  // Appelle `callback` à chaque changement d'état (connexion, déconnexion, renouvellement du jeton...).
  onSessionChange(callback) {
    supabaseClient.auth.onAuthStateChange((event, session) => callback(event, session));
  },

  // Cas particulier utile à toutes les pages protégées : si "la personne n'est plus (ou n'a jamais été) connectée",
  // dans ce cas, la page doit appeler callback (rediriger vers signin.html ou autre).
  onSessionEnded(callback) {
    return Auth.onSessionChange((event, session) => {
      if (event === "SIGNED_OUT" || (event === "INITIAL_SESSION" && !session)) {
        callback();
      }
    });
  },
}