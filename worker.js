export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS Headers (Taaki frontend error na de)
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. Message Send karna
    if (request.method === "POST" && url.pathname === "/send") {
      try {
        const { room_id, username, message } = await request.json();
        // D1 Database mein daalna
        await env.DB.prepare(
          "INSERT INTO messages (room_id, username, message, created_at) VALUES (?, ?, ?, ?)"
        ).bind(room_id, username, message, Date.now()).run();
        
        return new Response(JSON.stringify({ status: "Sent" }), { headers: corsHeaders });
      } catch (e) {
        return new Response("Error: " + e.message, { status: 500, headers: corsHeaders });
      }
    }

    // 2. Messages Read karna
    if (request.method === "GET" && url.pathname === "/messages") {
      const room_id = url.searchParams.get("room_id");
      const { results } = await env.DB.prepare(
        "SELECT * FROM messages WHERE room_id = ? ORDER BY created_at DESC LIMIT 50"
      ).bind(room_id).all();

      return new Response(JSON.stringify(results.reverse()), { headers: corsHeaders });
    }

    return new Response("Chat API Ready", { headers: corsHeaders });
  },
};
