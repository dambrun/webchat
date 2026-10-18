/*
Variables temporaires (tests)
*/

const channels = [
  { 
    id: 10,
    name: "nomDuSalon" 
  },
  {
    id: 11,
    name: "autreNomDuSalon" 
  },
  {
    id: 12,
    name: "autreNomDuSalonCetteFoisAssezLongJustePourTester" 
  },
  {
    id: 13,
    name: "auNoDuSa" 
  }
];

const messages = [
  {
    user_id: 123,
    user_name: "nomPersonne",
    content: "Contenu d'un message",
    created_at : "2026-10-01T10:09:08.123456+00:00"
  },
  {
    user_id: 12345,
    user_name: "nomAutrePersonne",
    content: "Contenu d'un autre message",
    created_at : "2026-10-02T10:09:08.123456+00:00"
  },
  {
    user_id: 1234,
    user_name: "monNom",
    content: "Contenu de mon message",
    created_at : "2026-10-03T10:09:08.123456+00:00"
  },
  {
    user_id: 123,
    user_name: "nomPersonne",
    content: "Contenu d'un autre message plus long cette fois, à nouveau, c'est juste pour tester.",
    created_at : "2026-10-04T10:09:08.123456+00:00"
  }
];

/*
Éléments
*/

const inputChannel = document.getElementById("input-channel");
const inputMessage = document.getElementById("input-message");

const ulChannels = document.getElementById("ul-channels");
const divMessages = document.getElementById("div-messages");

/*
Événements
*/

document.getElementById("form-channel").addEventListener("submit", (event) => {
  event.preventDefault();
  console.log("Envoi du formulaire des salons", inputChannel.value);
});

document.getElementById("form-message").addEventListener("submit", (event) => {
  event.preventDefault();
  console.log("Envoi du formulaire des messages", inputMessage.value);
});

/*
Affichages (fonctions)
*/

function loadChannels(channels) {
  channels.forEach(channel => {
    displayChannel(channel);
  });
}

function displayChannel(channel) {
  const liElement = document.createElement("li");
  const buttonElement = document.createElement("button");

  buttonElement.className = "channel-item";
  buttonElement.textContent = "# " + channel.name;

  liElement.appendChild(buttonElement);
  ulChannels.appendChild(liElement);
}

function loadMessages(messages) {
  messages.forEach(message => {
    displayMessage(message);
  });
}

function displayMessage(message) {
  const articleElement = document.createElement("article");
  const headerElement = document.createElement("header");
  const pElement = document.createElement("p");
  const timeElement = document.createElement("time");

  headerElement.textContent = message.user_name;
  pElement.textContent = message.content;
  timeElement.textContent = message.created_at.slice(0, 19).replace('T', ' ');
  timeElement.setAttribute('datetime', message.created_at);

  articleElement.appendChild(headerElement);
  articleElement.appendChild(pElement);
  articleElement.appendChild(timeElement);
  divMessages.appendChild(articleElement);
}

loadChannels(channels);
loadMessages(messages);