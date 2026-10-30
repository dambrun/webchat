/* 
Page principale : liste des salons, affichage et envoi des messages.
Organisation du fichier :
  1. variables d'état   
  2. éléments du DOM   
  3. événements
  4. salons            
  5. messages          
  6. démarrage (init)
*/


// -- 1. Variables de l'état de la page


// Salon ouvert (objet { id, name, ... }) ou `null`. 
// Cela permet de retrouver le même salon si la personne recharge la page sans la quitter ou si elle revient dessus après être allée dans les paramètres.
let currentChannel = Local.readCurrentChannel();

// Personne connectée. Reste `null` tant que la fonction init (appelé plus tard) n'a pas fini.
let currentUser = null;

// Pour stocker une fonction qui coupera l'écoute temps réel du salon ouvert (`null` si aucune écoute en cours).
let unsubscribeMessages = null;


// -- 2. Éléments du DOM (Document Object Model)


const inputChannel = document.getElementById("input-channel");
const inputMessage = document.getElementById("input-message");

const ulChannels = document.getElementById("ul-channels");
const divMessages = document.getElementById("div-messages");

const spanChannelTitle = document.getElementById("span-channel-title");


// -- 3. Événements


document.getElementById("form-channel").addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = inputChannel.value.trim();
  if (!name) return;

  const { error } = await Data.createChannel(name);
  if (error) {
    // Cas typique d'une erreur : un salon du même nom existe déjà (colonne `name` unique).
    // On ne vide pas le champ pour que la personne puisse corriger sa saisie.
    console.error("Impossible de créer le salon.", error);
    return;
  }
  inputChannel.value = "";
  // Pas besoin de rafraîchir la liste des salons ici : l'abonnement temps réel s'en charge.
});

document.getElementById("form-message").addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = inputMessage.value.trim();
  // Garde-fou : message vide alors on s'arrête dans la fonction (on retourne rien)
  if (!content) return;

  const { error } = await Data.sendMessage(
    currentChannel.id,
    content,
    currentUser.email
  );
  if (error) {
    console.error(error.code, error.message);
    return;
  }
  // On vide le champ seulement si l'envoi a réussi. Le message s'affichera via l'abonnement temps réel
  inputMessage.value = "";
});

// Bouton « Retour » (visible seulement sur petit écran) : on ferme le salon en cours (la vue des messages).
document.getElementById("button-back").addEventListener("click" , () => {
  unsubscribeMessages?.();   // `?.()` : appelle la fonction seulement si elle existe (si la variable n'est pas `null`)
  unsubscribeMessages = null;
  divMessages.replaceChildren();
  clearSelectedChannel();
  document.body.classList.remove("open"); // le CSS affiche/masque les panneaux selon cette classe
});

// Redirige vers la connexion si la personne n'est pas (ou plus) connectée.
Auth.onSessionEnded(() => {
  Local.clearSession();
  window.location.replace("./signin.html");
});


// -- 4. Gestion de l'affichage des salons


async function loadChannels() {
  const { data: channels, error } = await Data.fetchChannels();
  if (error) {
    console.error("Impossible de charger les salons.", error);
    return;
  }

  // On vide la liste avant de la remplir
  ulChannels.replaceChildren();
  
  channels.forEach(channel => {
    displayChannel(channel);
  });
}

// Construit <li><button>…</button></li> avec createElement.
// Utilisation de textContent (et non innerHTML) : le texte est traité comme du texte brut (ce qui empêche qu'un nom de salon contenant du HTML ne soit exécuté, faille XSS).
function displayChannel(channel) {
  const liElement = document.createElement("li");
  const buttonElement = document.createElement("button");

  // Marque le salon actuellement ouvert (p. ex. après un rechargement). Le CSS le met en évidence via le sélecteur [aria-current=true], ce qui sert aussi aux lecteurs d'écran (pour l'accessibilité).
  if (currentChannel && channel.id == currentChannel.id) {
    buttonElement.setAttribute("aria-current", "true");
  }
  buttonElement.className = "channel-item";
  buttonElement.textContent = "# " + channel.name;
  buttonElement.addEventListener("click", async () => selectChannel(buttonElement, channel));

  liElement.appendChild(buttonElement);
  ulChannels.appendChild(liElement);
}

function clearSelectedChannel() {
  Local.deleteCurrentChannel();
  currentChannel = null;
  document.querySelectorAll(".channel-item").forEach(element => {
    element.removeAttribute("aria-current");
  });
}

async function selectChannel(buttonElement, channel) {
  clearSelectedChannel();
  buttonElement.setAttribute("aria-current", "true");
  currentChannel = channel;
  Local.writeCurrentChannel(currentChannel);
  showChannelTitle(currentChannel.name);
  // arrête l'écoute de l'ancien salon
  unsubscribeMessages?.();
  unsubscribeMessages = Data.subscribeToMessages(channel.id, appendMessage);
  await loadMessages();
}

function showChannelTitle(title) {
  spanChannelTitle.textContent = "# " + title;
  document.body.classList.add("open");
}


// -- 5. Gestion de l'affichage des messages


async function loadMessages() {
  const { data: messages, error } = await Data.fetchMessages(currentChannel.id);
  if (error) {
    console.error("Impossible de charger les messages.", error);
    return;
  }
  divMessages.replaceChildren();
  // fetchMessages retourne les messages du plus récent au plus ancien (pour que limit(50) garde les derniers) : on les remet dans l'ordre chronologique avec reverse(), puis on les parcourt avec forEach().
  messages.reverse().forEach(message => {
    displayMessage(message);
  });
  scrollMessages();
}

// Appelée par l'abonnement temps réel pour chaque nouveau message.
function appendMessage(message) {
  displayMessage(message);
  scrollMessages();
}

function displayMessage(message) {
  const articleElement = document.createElement("article");
  const headerElement = document.createElement("header");
  const pElement = document.createElement("p");
  const timeElement = document.createElement("time");

  // Les messages de la personne connectée sont alignés à droite (avec la classe .sent).
  if (message.user_id == currentUser.id) {
    articleElement.classList.add("sent");
  }
  headerElement.textContent = message.username;
  pElement.textContent = message.content;
  // "2026-10-29T14:05:09.123+00:00" devient "2026-10-29 14:05:09" (affichage simple, en UTC).
  // L'attribut datetime garde la valeur complète, lisible par les machines.
  timeElement.textContent = message.created_at.slice(0, 19).replace('T', ' ');
  timeElement.setAttribute('datetime', message.created_at);

  articleElement.appendChild(headerElement);
  articleElement.appendChild(pElement);
  articleElement.appendChild(timeElement);
  divMessages.appendChild(articleElement);
}

// Fait défiler jusqu'au bas : on voit toujours le dernier message.
function scrollMessages() {
  divMessages.scrollTop = divMessages.scrollHeight;
}


// -- 6. Vérifications et chargements (init)


// Affiche (et ouvre) tout de suite le titre du salon mémorisé (avant même la fin des requêtes).
if (currentChannel) {
  showChannelTitle(currentChannel.name);
}

async function init() {
  const { user } = await Auth.getUser();
  // Garde-fou : sans personne connectée, displayMessage (qui lit currentUser.id) planterait. Inutile de rediriger (vers signin.html) ici : onSessionEnded s'en occupe déjà.
  if (!user) return;
  currentUser = user;

  await loadChannels();
  
  // Quand un salon est créé (par n'importe qui), on recharge la liste.
  // Plus simple que d'insérer un seul élément, et le tri alphabétique est respecté.
  Data.subscribeToChannels(() => loadChannels());

  // Rechargement de la page avec un salon déjà ouvert : on rétablit son contenu (et l'abonnement aux messages en temps réel).
  if (currentChannel) {
    unsubscribeMessages?.();
    unsubscribeMessages = Data.subscribeToMessages(currentChannel.id, appendMessage);
    await loadMessages();
  }
}

init();