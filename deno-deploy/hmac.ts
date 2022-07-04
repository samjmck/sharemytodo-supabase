import { verify } from "https://deno.land/x/djwt@v2.2/mod.ts"
import { serve } from "https://deno.land/std@0.146.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@^1.33.2";
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

const headers = {
    "access-control-allow-headers": "authorization",
    "access-control-allow-origin": "*",
};

// env:
// SERVICE_ROLE_KEY
// JWT_SECRET
// HMAC_SECRET

const SUPABASE_URL = <string> Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = <string> Deno.env.get("SERVICE_ROLE_KEY");
const JWT_SECRET = <string> Deno.env.get("JWT_SECRET");
const HMAC_SECRET = <string> Deno.env.get("HMAC_SECRET");

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function generateHMAC(request: Request) {
    const { id } = await request.json();

    const authorizationHeader = request.headers.get("authorization");
    if(authorizationHeader === null) {
        return new Response("No authorization header", { status: 401, headers });
    }
    try {
        const payload = await verify(authorizationHeader.replace("Bearer ", ""), JWT_SECRET, "HS256");
        const userId = payload.sub;
        const { data } = await supabase.from("lists").select("*").eq("id", id);
        if(data === null) {
            return new Response("Could not find list", { status: 500, headers });
        }
        if(data[0].user_id === userId) {
            return new Response(hmac("sha256", HMAC_SECRET, `${id}`, "utf8", "hex"), { status: 200 });
        }
        return new Response("User not owner of list", { status: 401, headers });
    } catch(error) {
        return new Response("Could not verify JWT", { status: 401, headers });
    }
}

function verifyHMAC(id: string, matchHmac: string) {
    return hmac("sha256", HMAC_SECRET, `${id}`, "utf8", "hex") === matchHmac;
}

async function getList(request: Request): Promise<Response> {
    const searchParams = new URL(request.url).searchParams;
    const id = searchParams.get("id");
    const matchHmac = searchParams.get("hmac");
    if(id === null || matchHmac === null) {
        return new Response(null, { status: 500, headers });
    }
    if(!verifyHMAC(id, matchHmac)) {
        return new Response(null, { status: 401, headers });
    }
    const { data, error } = await supabase.from("lists").select("*").eq("id", id);
    if(error) {
        return new Response(null, { status: 500, headers });
    }
    if(!data[0].publicly_viewable) {
        return new Response(null, { status: 401, headers });
    }
    return new Response(JSON.stringify(data[0]), { status: 200, headers: { ...headers, "content-type": "application/json" } });
}

serve(request => {
    const url = new URL(request.url);
    switch(url.pathname) {
        case "/generate":
            return generateHMAC(request);
        case "/list":
            return getList(request);
    }
    return new Response(null, { status: 500, headers });
});
