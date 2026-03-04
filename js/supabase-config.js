import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ==========================================
// ⚠️ SUPABASE CONFIG ⚠️
// ==========================================
const supabaseUrl = 'https://thuwajzqjqwxpdgjqehz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRodXdhanpxanF3eHBkZ2pxZWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDAzNDgsImV4cCI6MjA4ODIxNjM0OH0.FNZ_k0Ceount0hczEiGvndhan_8eIgOrU_B3JZbnoGU';

let supabase = null;
let isConfigured = false;

if (supabaseUrl !== 'YOUR_SUPABASE_URL') {
    supabase = createClient(supabaseUrl, supabaseKey);
    isConfigured = true;
}

export { supabase, isConfigured };
