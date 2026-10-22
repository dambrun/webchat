const Local = {
  KEY_CURRENT_THEME: "keyCurrentTheme",
  KEY_CURRENT_CHANNEL: "keyCurrentChannel",

  readCurrentTheme() {
    try {
      var savedTheme = localStorage.getItem(this.KEY_CURRENT_THEME);
      if (savedTheme) return savedTheme;
      return "system";
    } catch (error) {
      return "system";
    }
  },

  writeCurrentTheme(theme) {
    localStorage.setItem(this.KEY_CURRENT_THEME, theme);
    this.applyTheme(theme);
  },

  applyTheme(theme) {
    let shouldUseDarkTheme = false;
    let systemThemePreferenceToDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (theme == "dark") {
      shouldUseDarkTheme = true;
    } else if (theme == "system") {
      shouldUseDarkTheme = systemThemePreferenceToDark;
    }

    let themeToApply = shouldUseDarkTheme ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", themeToApply);
  },

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

/*
Événements
*/

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function() {
  if (Local.readCurrentTheme() == "system") {
    Local.applyTheme("system");
  }
});

/*
Initialisation
*/

Local.applyTheme(Local.readCurrentTheme());