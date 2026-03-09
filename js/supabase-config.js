// ==========================================
// ⚠️ SUPABASE CONFIG ⚠️
// ==========================================
const supabaseUrl = 'https://thuwajzqjqwxpdgjqehz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRodXdhanpxanF3eHBkZ2pxZWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDAzNDgsImV4cCI6MjA4ODIxNjM0OH0.FNZ_k0Ceount0hczEiGvndhan_8eIgOrU_B3JZbnoGU';

window.supabaseClient = null;
window.isConfigured = false;

if (supabaseUrl !== 'YOUR_SUPABASE_URL') {
    // Rely on the global supabase library imported via HTML script tag
    window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    window.isConfigured = true;
}
