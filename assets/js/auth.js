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
  
  signOut() {
    supabaseClient.auth.signOut();  
  },
  
  async getUser() {
    return { id: 1234, email: "blabla@bla" };
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