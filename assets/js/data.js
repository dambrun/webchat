const Data = {
  async fetchChannels() {
    return await supabaseClient
    .from("channels")
    .select("*")
    .order("name");
  },
  
  async createChannel(name) {
    return await supabaseClient
    .from("channels")
    .insert({ name })
    .select()
    .single();
  },
  
  async fetchMessages(channelId) {
    return await supabaseClient
    .from("messages")
    .select("id, content, created_at, user_id, username")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: false })
    .limit(50);
  },
  
  async sendMessage(channelId, content, username) {
    return await supabaseClient
    .from("messages")
    .insert({ 
      channel_id: channelId, 
      content, 
      username 
    });
  },
  
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