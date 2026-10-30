/*
Page de connexion / inscription.
*/

// -- Éléments et fonctions


const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");

function readCredentials() {
  return {
    email: inputEmail.value.trim(),   // trim() : on ignore les espaces accidentels
    password: inputPassword.value,    // pas de trim() : un espace peut faire partie d'un mot de passe
  };
}

// Retourne un message d'erreur, ou null si tout est valide.
function validateCredentials(credentials) {
  if (!credentials.email) 
    return "Veuillez saisir votre adresse courriel.";
  if (!credentials.password) 
    return "Veuillez saisir votre mot de passe.";
  return null;
}

// Combine les deux étapes. Retourne les identifiants valides, ou null.
function getValidCredentials() {
  const credentials = readCredentials();
  const validationError = validateCredentials(credentials);
  if (validationError) {
    console.error(validationError); // à remplacer plus tard par un <p role="alert"> pour afficher le message à la personne utilisatrice
    return null;
  }
  return credentials;
}


// -- Événements


document.getElementById("form-signin").addEventListener("submit", async (event) => {
  event.preventDefault(); // empêche le rechargement de la page par le formulaire
  const credentials = getValidCredentials();
  if (!credentials) return;

  const { error } = await Auth.signIn(credentials.email, credentials.password);
  if (error) {
    console.log(error);
  }
  // En cas de succès, on ne fait rien ici : la redirection est gérée plus bas par onSessionChange, qui réagit à la connexion.
});

document.getElementById("button-signup").addEventListener("click", async () => {
  const credentials = getValidCredentials();
  if (!credentials) return;

  const { error } = await Auth.signUp(credentials.email, credentials.password);
  if (error) {
    console.log(error);
  } else {
    console.log("Compte créé. Veuillez vérifier votre adresse courriel pour confirmer l'inscription.");
  }
});

// Dès qu'une session existe (connexion réussie, ou une personne déjà connectée qui arrive sur cette page), on va vers le chat. 
// Avec `replace` (plutôt que `href`), la page de connexion ne reste pas dans l'historique, le bouton « Précédent » du navigateur ne la ramène pas à cette page.
Auth.onSessionChange((event, session) => {
  if (session?.user) {
    window.location.replace("./index.html");
  }
});