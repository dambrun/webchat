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
Variables de l'état de la page
*/

const KEY_CURRENT_CHANNEL_ID = "keyCurrentChannelId";

let currentChannelId = sessionStorage.getItem(KEY_CURRENT_CHANNEL_ID);
if (currentChannelId) {
  document.body.classList.add("open");
}

let currentUserId = 1234;

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
  channels.push({ id: -1, name: inputChannel.value.trim() }); // test
  inputChannel.value = "";
  loadChannels(channels);
});

document.getElementById("form-message").addEventListener("submit", (event) => {
  event.preventDefault();
  if (inputMessage.value.trim()) {
    messages.push({ 
      user_id: 1234,
      user_name: "monNom",
      content: inputMessage.value,
      created_at : "2026-10-03T10:09:08.123456+00:00" 
    });
    inputMessage.value = "";
    loadMessages(messages);
  }
});

document.getElementById("button-back").addEventListener("click" , () => {
  clearSelectedChannel();
  document.body.classList.remove("open");
});

/*
Affichages (fonctions)
*/

function loadChannels(channels) {
  ulChannels.innerHTML = "";
  channels.forEach(channel => {
    displayChannel(channel);
  });
}

function displayChannel(channel) {
  const liElement = document.createElement("li");
  const buttonElement = document.createElement("button");
  
  if (channel.id == currentChannelId) {
    buttonElement.setAttribute("aria-current", "true");
  }
  buttonElement.className = "channel-item";
  buttonElement.textContent = "# " + channel.name;
  buttonElement.addEventListener("click", () => selectChannel(buttonElement, channel));
  
  liElement.appendChild(buttonElement);
  ulChannels.appendChild(liElement);
}

function clearSelectedChannel() {
  sessionStorage.removeItem(KEY_CURRENT_CHANNEL_ID);
  currentChannelId = null;
  document.querySelectorAll(".channel-item").forEach(element => {
    element.removeAttribute("aria-current");
  });
}

function selectChannel(buttonElement, channel) {
  clearSelectedChannel();
  buttonElement.setAttribute("aria-current", "true");
  currentChannelId = channel.id;
  sessionStorage.setItem(KEY_CURRENT_CHANNEL_ID, currentChannelId);
  document.body.classList.add("open");
}

function loadMessages(messages) {
  divMessages.innerHTML = "";
  messages.forEach(message => {
    displayMessage(message);
  });
  scrollMessages();
}

function displayMessage(message) {
  const articleElement = document.createElement("article");
  const headerElement = document.createElement("header");
  const pElement = document.createElement("p");
  const timeElement = document.createElement("time");
  
  if (message.user_id == currentUserId) {
    articleElement.classList.add("sent");
  }
  headerElement.textContent = message.user_name;
  pElement.textContent = message.content;
  timeElement.textContent = message.created_at.slice(0, 19).replace('T', ' ');
  timeElement.setAttribute('datetime', message.created_at);
  
  articleElement.appendChild(headerElement);
  articleElement.appendChild(pElement);
  articleElement.appendChild(timeElement);
  divMessages.appendChild(articleElement);
}

function scrollMessages() {
  divMessages.scrollTop = divMessages.scrollHeight;
}

loadChannels(channels);
loadMessages(messages);