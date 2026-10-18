/*
Éléments
*/

const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");

/*
Événements
*/

document.getElementById("form-signin").addEventListener("submit", (event) => {
  event.preventDefault();
  console.log("Envoi du formulaire de connexion", inputEmail.value, inputPassword.value);
  login();
});

document.getElementById("button-signup").addEventListener("click", () => {
  console.log("Appui sur le bouton d'inscription", inputEmail.value, inputPassword.value);
});

/*
Fonctions
*/

function login() {
  window.location.replace('./index.html');
}