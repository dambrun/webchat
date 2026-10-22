/*
Variables de l'état de la page
*/

let currentChannel = Local.readCurrentChannel();
let currentUser = null;

/*
Éléments
*/

const inputChannel = document.getElementById("input-channel");
const inputMessage = document.getElementById("input-message");

const ulChannels = document.getElementById("ul-channels");
const divMessages = document.getElementById("div-messages");

const spanChannelTitle = document.getElementById("span-channel-title");

/*
Événements
*/

document.getElementById("form-channel").addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = inputChannel.value.trim();
  if (!name) return;

  Data.createChannel(name)
  inputChannel.value = "";

  const channels = await Data.fetchChannels();
  loadChannels(channels); // à enlever une fois l'écoute en temps réel de la liste des salons sur Supabase
});

document.getElementById("form-message").addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = inputMessage.value.trim();
  if (!content) return;
  
  appendMessage(await Data.sendMessage(currentUser, currentChannel.id, content));
  inputMessage.value = "";
});

document.getElementById("button-back").addEventListener("click" , () => {
  clearSelectedChannel();
  document.body.classList.remove("open");
});

/*
Gestion de l'affichage des salons
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
  loadMessages(await Data.fetchMessages(currentChannel.id));
}

function showChannelTitle(title) {
  spanChannelTitle.textContent = "# " + title;
  document.body.classList.add("open");
}

/*
Gestion de l'affiche des messages
*/

function loadMessages(messages) {
  divMessages.innerHTML = "";
  messages.forEach(message => {
    displayMessage(message);
  });
  scrollMessages();
}

function appendMessage(message) {
  displayMessage(message);
  scrollMessages();
}

function displayMessage(message) {
  const articleElement = document.createElement("article");
  const headerElement = document.createElement("header");
  const pElement = document.createElement("p");
  const timeElement = document.createElement("time");
  
  if (message.user_id == currentUser.id) {
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

/*
Vérifications et chargements
*/

if (currentChannel) {
  showChannelTitle(currentChannel.name);
}

async function init() {
  currentUser = await Auth.getUser();
  loadChannels(await Data.fetchChannels());
}

init();