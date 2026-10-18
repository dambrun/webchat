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
  }
}

document.getElementById("button-signout").onclick = () => {
  console.log("Appui sur le bouton de déconnexion");
}