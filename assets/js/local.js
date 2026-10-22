const Local = {
  KEY_CURRENT_CHANNEL: "keyCurrentChannel",
  
  readCurrentChannel() {
    try {
      return JSON.parse(sessionStorage.getItem(this.KEY_CURRENT_CHANNEL));
    } catch (error) {
      console.warn("Salon courant illisible, valeur ignorée.", error);
      return null;
    }
  },
  
  writeCurrentChannel(channel) {
    try {
      sessionStorage.setItem(this.KEY_CURRENT_CHANNEL, JSON.stringify(channel));
    } catch (error) {
      console.warn("Erreur dans la sauvegarde du salon courant.", error);
    }
  },

  deleteCurrentChannel() {
    sessionStorage.removeItem(this.KEY_CURRENT_CHANNEL);
  },
  
  clearSession() {
    sessionStorage.clear();
  },
}