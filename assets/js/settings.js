/*
Page des paramètres : choix du thème et déconnexion.
*/


// -- Éléments et initialisation


const currentTheme = Local.readCurrentTheme();
// Coche le bouton radio correspondant au thème enregistré.
const allInputNameTheme = document.querySelectorAll('input[name="theme"]');
allInputNameTheme.forEach(function (inputNameTheme) {
  inputNameTheme.checked = inputNameTheme.value == currentTheme;
});

const h2Username = document.getElementById("h2-username");

async function init() {
  h2Username.textContent = (await Auth.getUser()).user.email;
};

init();


// -- Événements


// Le lien « Retour » se comporte comme le bouton « Précédent » du navigateur si la personne vient de notre site (elle retrouve la page telle qu'elle l'a laissée).
// Sinon (avec une arrivée directe sur la page des paramètres), on suit le lien normalement.
document.getElementById("anchor-back").onclick = (event) => {
  event.preventDefault();
  const referrer = document.referrer;
  if (referrer && referrer.startsWith(window.location.origin)) {
    window.history.back();
  } else {
    window.location.replace(event.currentTarget.href);
  }
}

// On écoute sur le <fieldset> plutôt que sur chaque bouton radio. `event.target` indique ensuite lequel a été cliqué.
document.getElementById("fieldset-theme").onchange = (event) => {
  if (event.target.matches('input[type="radio"]')) {
    console.log(`Sélection du thème : ${event.target.value}`);
    Local.writeCurrentTheme(event.target.value);
  }
}

document.getElementById("button-signout").onclick = async () => {
  const { error } = await Auth.signOut();
  if (error) {
    console.error("Impossible de se déconnecter.", error);
  }
  // En cas de succès, la redirection est faite par onSessionEnded ci-dessous.
}

// Si la session se termine (déconnexion, ou session expirée), on nettoie et on renvoie vers la page de connexion.
Auth.onSessionEnded(() => {
  Local.clearSession();
  window.location.replace("./signin.html");
});