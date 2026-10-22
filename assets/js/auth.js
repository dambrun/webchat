const Auth = {
  async signIn(email, password) {
    window.location.replace("./index.html");
  },

  async signUp(email, password) {
    window.location.replace("./index.html");
  },

  async signOut() {
    window.location.replace("./signin.html");
  },

  async getUser() {
    return { id: 1234, email: "blabla@bla" };
  },
}