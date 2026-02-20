import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://gpkhehcnsggwjejkwuyv.supabase.co";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_FyhWQZgHiunW-pltZE0xEA_bMEPq86N";

export const supabase = createClient(supabaseUrl, supabaseKey);
