export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const match = pathname.match(/^\/api\/car\/([a-zA-Z0-9_-]+)$/);
    if (!match) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const publicId = match[1];

    try {
      const stmt = env.DB.prepare(`
        SELECT owner_name, vehicle_number, contact_number 
        FROM cars 
        WHERE public_id = ? AND is_active = 1
      `);
      const result = await stmt.bind(publicId).first();

      if (!result) {
        return new Response(JSON.stringify({ error: "Car not found" }), {
          status: 404,
          headers: corsHeaders
        });
      }

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: corsHeaders
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: "Internal Server Error", detail: e.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};
