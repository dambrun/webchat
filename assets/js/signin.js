/*
Éléments
*/

const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");

/*
Événements
*/

document.getElementById("form-signin").addEventListener("submit", async (event) => {
  event.preventDefault();
  Auth.signIn(inputEmail, inputPassword);
});

document.getElementById("button-signup").addEventListener("click", () => {
  Auth.signUp(inputEmail, inputPassword);
});