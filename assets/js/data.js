/*
Variables temporaires (tests)
*/

const Data = {
  
  channels: [
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
  ],
  
  messages: [
    {
      user_id: 123,
      channel_id: 12,
      user_name: "nomPersonne",
      content: "Contenu d'un message",
      created_at : "2026-10-01T10:09:08.123456+00:00"
    },
    {
      user_id: 12345,
      channel_id: 12,
      user_name: "nomAutrePersonne",
      content: "Contenu d'un autre message",
      created_at : "2026-10-02T10:09:08.123456+00:00"
    },
    {
      user_id: 1234,
      channel_id: 12,
      user_name: "monNom",
      content: "Contenu de mon message",
      created_at : "2026-10-03T10:09:08.123456+00:00"
    },
    {
      user_id: 123,
      channel_id: 12,
      user_name: "nomPersonne",
      content: "Contenu d'un autre message plus long cette fois, à nouveau, c'est juste pour tester.",
      created_at : "2026-10-04T10:09:08.123456+00:00"
    }
  ],
  
  async fetchChannels() {
    return structuredClone(this.channels);
  },
  
  async createChannel(name) {
    const channel = { id: crypto.randomUUID(), name };
    this.channels.push(channel);
    return channel;
  },
  
  async fetchMessages(channelId) {
    return this.messages.filter(
      message => message.channel_id === channelId
    );
  }, 
  
  async sendMessage(currentUser, channelId, content) {
    const message = { 
      channel_id: channelId, 
      user_id: currentUser.id, 
      user_name: currentUser.name, 
      content, 
      created_at: new Date().toISOString() 
    };
    this.messages.push(message);
    return message;
  },
  
  subscribeToChannels() { },
  subscribeToMessages() { }
}