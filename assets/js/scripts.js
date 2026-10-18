/*
SIGNIN
*/

const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");

document.getElementById("form-signin").onsubmit = (event) => {
  event.preventDefault();
  console.log("Envoi du formulaire de connexion", inputEmail.value, inputPassword.value);
  login();
}

document.getElementById("button-signup").onclick = () => {
  console.log("Appui sur le bouton d'inscription", inputEmail.value, inputPassword.value);
}

function login() {
  window.location.replace('./index.html');
}