import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gfzvxtwxxwjmzlohazpv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmenZ4dHd4eHdqbXpsb2hhenB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzODU0ODgsImV4cCI6MjA5Mzk2MTQ4OH0.IcuHkVreQXiCAuq0bxXKp04eesNRNArtGKw_LiRN8K8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
