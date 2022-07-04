import { readable, writable } from "svelte/store";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseList } from "./types";

export const lists = writable<SupabaseList[]>([]);

export const supabase = createClient("https://ykjvwwawydkcejzklaao.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlranZ3d2F3eWRrY2VqemtsYWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTY3NTkzMTcsImV4cCI6MTk3MjMzNTMxN30.89JOgwlc3c-swPDq38JU8L3qGymmlrfYZFm4SDhH6Rc");
export const isLoggedIn = readable(supabase.auth.user() !== null, set => {
    supabase.auth.onAuthStateChange(async event => {
        if(event === "SIGNED_IN") {
            set(true);
        }
        const { data, error } = await supabase.from("lists").select("*");
        if(error) {
            console.error(`Could not get lists: ${error}`);
        }
        lists.set(data);
    });
});
