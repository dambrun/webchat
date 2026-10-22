/*
Variables de l'état de la page
*/

let currentChannel = Local.readCurrentChannel();
let currentUser = null;
let unsubscribeMessages = null;

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
});

document.getElementById("form-message").addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = inputMessage.value.trim();
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
  inputMessage.value = "";
});

document.getElementById("button-back").addEventListener("click" , () => {
  unsubscribeMessages?.();
  unsubscribeMessages = null;
  divMessages.replaceChildren();
  clearSelectedChannel();
  document.body.classList.remove("open");
});

Auth.onSessionEnded(() => {
  Local.clearSession();
  window.location.replace("./signin.html");
});

/*
Gestion de l'affichage des salons
*/

async function loadChannels() {
  const { data: channels, error } = await Data.fetchChannels();
  if (error) {
    showError("Impossible de charger les salons.");
    return;
  }

  ulChannels.replaceChildren();
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
  // arrête l'écoute de l'ancien salon
  unsubscribeMessages?.();
  unsubscribeMessages = Data.subscribeToMessages(channel.id, appendMessage);
  await loadMessages();
}

function showChannelTitle(title) {
  spanChannelTitle.textContent = "# " + title;
  document.body.classList.add("open");
}

/*
Gestion de l'affiche des messages
*/

async function loadMessages() {
  const { data: messages, error } = await Data.fetchMessages(currentChannel.id);
  if (error) {
    showError("Impossible de charger les messages.");
    return;
  }
  divMessages.replaceChildren();
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
  headerElement.textContent = message.username;
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
  currentUser = (await Auth.getUser()).user;
  await loadChannels();
  Data.subscribeToChannels(() => loadChannels());

  if (currentChannel) {
    unsubscribeMessages?.();
    unsubscribeMessages = Data.subscribeToMessages(currentChannel.id, appendMessage);
    await loadMessages();
  }
}

init();