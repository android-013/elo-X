import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://dflgcunlcuiimafabbmy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmbGdjdW5sY3VpaW1hZmFiYm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2Njg2OTYsImV4cCI6MjA3MDI0NDY5Nn0.YK-QvBOjeIiGNZ2CZP8sPMcw_qS2uEJrH0u_2hEKlSM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('addPlayerForm');
const statusDiv = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const photo = document.getElementById('photo').value.trim();

  if (!name || !photo) {
    statusDiv.textContent = "Please fill in both fields.";
    statusDiv.style.color = "red";
    return;
  }

  try {
    const { error } = await supabase.rpc('add_new_player', {
      player_name: name,
      player_photo: photo
    });

    if (error) throw error;

    statusDiv.textContent = `Player "${name}" added successfully!`;
    statusDiv.style.color = "green";
    form.reset();

  } catch (err) {
    console.error(err);
    statusDiv.textContent = "Error adding player: " + err.message;
    statusDiv.style.color = "red";
  }
});
