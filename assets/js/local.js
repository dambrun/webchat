/*
Stockage local du navigateur (et gestion du thème).

Deux types de stockage sont utilisés, avec des durées de vie différentes :
  - localStorage   : survit à la fermeture du navigateur (préférence du thème)
  - sessionStorage : propre à l'onglet, effacé à sa fermeture (salon courant)

Ce fichier est chargé dans le <head> SANS `defer` : il s'exécute avant que la page ne s'affiche, ce qui permet d'appliquer le thème tout de suite.
*/

const Local = {
  KEY_CURRENT_THEME: "keyCurrentTheme",
  KEY_CURRENT_CHANNEL: "keyCurrentChannel",

  // ---- Thème ("light", "dark" ou "system") ----

  readCurrentTheme() {
    // Le try/catch est nécessaire : l'accès au stockage peut être refusé.
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

  // Traduit le choix de la personne en un thème réel ("light" ou "dark") et le pose sur <html data-theme="...">. 
  // Le CSS (base.css) fait le reste.
  applyTheme(theme) {
    let shouldUseDarkTheme = false;
    let systemThemePreferenceToDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (theme == "dark") {
      shouldUseDarkTheme = true;
    } else if (theme == "system") {
      // "Automatique" : on suit la préférence du système d'exploitation (connu par le navigateur)
      shouldUseDarkTheme = systemThemePreferenceToDark;
    }

    let themeToApply = shouldUseDarkTheme ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", themeToApply);
  },

  // ---- Salon courant (conservé pour survivre à un rechargement de la page) ----

  readCurrentChannel() {
    // Le stockage ne contient que du texte : on y range le salon sous forme de JSON (JSON.stringify) et on le reconvertit en objet à la lecture (JSON.parse).
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

  // Appelée à la déconnexion : on oublie tout ce qui concerne la session. (Le thème, lui, est une préférence : il est dans localStorage et reste.)
  clearSession() {
    sessionStorage.clear();
  },
}

// -- Événements --

// Si le thème est "Automatique" et que la personne change le thème de son système pendant que la page est ouverte, on se met à jour en direct.
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function() {
  if (Local.readCurrentTheme() == "system") {
    Local.applyTheme("system");
  }
});


// -- Initialisation --

Local.applyTheme(Local.readCurrentTheme());