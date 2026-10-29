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
  
  async getUser() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error || !data.session) {
      return { user: null, error: error ?? new Error("Aucune session") };
    }
    return { user: data.session.user, error: null };
  },
  
  onSessionChange(callback) {
    supabaseClient.auth.onAuthStateChange((event, session) => callback(event, session));
  },

  onSessionEnded(callback) {
    return Auth.onSessionChange((event, session) => {
      if (event === "SIGNED_OUT" || (event === "INITIAL_SESSION" && !session)) {
        callback();
      }
    });
  },
}