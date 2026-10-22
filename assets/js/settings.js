/*
Éléments (initialisation)
*/
const allInputNameTheme = document.querySelectorAll('input[name="theme"]');
const currentTheme = Local.readCurrentTheme();
allInputNameTheme.forEach(function (inputNameTheme) {
  inputNameTheme.checked = inputNameTheme.value == currentTheme;
});

const h2Username = document.getElementById("h2-username");

async function init() {
  h2Username.textContent = (await Auth.getUser()).user.email;
};

init();

/*
Événements
*/

document.getElementById("anchor-back").onclick = (event) => {
  event.preventDefault();
  const referrer = document.referrer;
  if (referrer && referrer.startsWith(window.location.origin)) {
    window.history.back();
  } else {
    window.location.replace(event.currentTarget.href);
  }
}

document.getElementById("fieldset-theme").onchange = (event) => {
  if (event.target.matches('input[type="radio"]')) {
    console.log(`Sélection du thème : ${event.target.value}`);
    Local.writeCurrentTheme(event.target.value);
  }
}

document.getElementById("button-signout").onclick = async () => {
  const { error } = await Auth.signOut();
  if (error) {
    console.log(error.message);
  }
}

Auth.onSessionEnded(() => {
  Local.clearSession();
  window.location.replace("./signin.html");
});