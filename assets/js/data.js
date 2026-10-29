/*
Couche "données" : toutes les requêtes vers les tables `channels` et `messages`.
Le code de l'interface (chat.js) n'écrit jamais de requête lui-même : il appelle `Data.quelqueChose()`.

Les requêtes sont autorisées (ou refusées) par les règles RLS définies dans schema.sql.
*/

const Data = {

  // -- Lectures et écritures ponctuelles --

  async fetchChannels() {
    return await supabaseClient
    .from("channels")
    .select("*")
    .order("name");
  },

  // On n'envoie que `name` (`id`, `created_at` et `created_by` sont directement remplis avec des valeurs par défaut). 
  // `.select().single()` demande de retourner la ligne créée.
  async createChannel(name) {
    return await supabaseClient
    .from("channels")
    .insert({ name })
    .select()
    .single();
  },

  // Pour obtenir les 50 DERNIERS messages, on trie du plus récent au plus ancien AVANT de limiter. 
  // Le tableau arrive donc "à l'envers" : c'est chat.js qui le remet dans l'ordre chronologique avec .reverse().
  async fetchMessages(channelId) {
    return await supabaseClient
    .from("messages")
    .select("id, content, created_at, user_id, username")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: false })
    .limit(50);
  },

  // `user_id` n'est volontairement pas envoyé : la base le remplit avec l'identifiant de la personne connectée (auth.uid()).
  async sendMessage(channelId, content, username) {
    return await supabaseClient
    .from("messages")
    .insert({
      channel_id: channelId,
      content,
      username
    });
  },

  // -- Temps réel (Realtime) --
  
  // Supabase nous prévient quand une ligne est insérée. On n'a donc pas besoin de redemander les données.
  subscribeToChannels(onNewChannel) {
    supabaseClient
    .channel("channels-realtime")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "channels"
      },
      (payload) => onNewChannel(payload.new)
    )
    .subscribe();
  },

  // Le `filter` limite les notifications aux messages du salon ouvert.
  // La fonction retournée sert à se désabonner : indispensable quand on change de salon, sinon on continuerait à recevoir les messages de l'ancien.
  subscribeToMessages(channelId, onNewMessage) {
    const subscription = supabaseClient
    .channel("messages-" + channelId)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: "channel_id=eq." + channelId,
      },
      (payload) => onNewMessage(payload.new)
    )
    .subscribe();

    return () => supabaseClient.removeChannel(subscription);
  },
}