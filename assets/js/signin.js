/*
Éléments et fonctions
*/

const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");

function readCredentials() {
  return {
    email: inputEmail.value.trim(),
    password: inputPassword.value,
  };
}

function validateCredentials(credentials) {
  if (!credentials.email) 
    return "Veuillez saisir votre adresse courriel.";
  if (!credentials.password) 
    return "Veuillez saisir votre mot de passe.";
  return null;
}

function getValidCredentials() {
  const credentials = readCredentials();
  const validationError = validateCredentials(credentials);
  if (validationError) {
    console.log(validationError);
    return null;
  }
  return credentials;
}

/*
Événements
*/

document.getElementById("form-signin").addEventListener("submit", async (event) => {
  event.preventDefault();
  
  const credentials = getValidCredentials();
  if (!credentials) return;
  
  const { error } = await Auth.signIn(credentials.email, credentials.password);
  if (error) {
    console.log(error);
  }
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

Auth.onSessionChange((event, session) => {
  if (session?.user) {
    window.location.replace("./index.html");
  }
});