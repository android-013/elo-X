import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- IMPORTANT: REPLACE WITH YOUR SUPABASE DETAILS ---
const SUPABASE_URL = 'https://dflgcunlcuiimafabbmy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmbGdjdW5sY3VpaW1hZmFiYm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2Njg2OTYsImV4cCI6MjA3MDI0NDY5Nn0.YK-QvBOjeIiGNZ2CZP8sPMcw_qS2uEJrH0u_2hEKlSM';
// ----------------------------------------------------

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const addPlayerForm = document.getElementById('add-player-form');
const submitBtn = document.getElementById('submit-btn');
const statusMessage = document.getElementById('status-message');

async function handleAddPlayer(event) {
    // Prevent the form from actually submitting (which would refresh the page)
    event.preventDefault();

    // Disable the button to prevent multiple submissions
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';
    statusMessage.textContent = '';
    statusMessage.classList.remove('text-green-600', 'text-red-600');

    const form = event.target;
    const formData = new FormData(form);
    const playerName = formData.get('player-name');
    const photoUrl = formData.get('photo-url');

    try {
        // Use the Supabase client to insert a new row
        const { error } = await supabase
            .from('players')
            .insert([
                { name: playerName, photo_url: photoUrl }
            ]);

        if (error) {
            // If Supabase returns an error, throw it to be caught by the catch block
            throw error;
        }

        // Success!
        statusMessage.textContent = `Successfully added ${playerName}!`;
        statusMessage.classList.add('text-green-600');
        form.reset(); // Clear the form fields

    } catch (error) {
        console.error('Error adding player:', error);
        statusMessage.textContent = `Error: ${error.message}`;
        statusMessage.classList.add('text-red-600');
    } finally {
        // Re-enable the button whether it succeeded or failed
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Player';
    }
}

// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        alert('Please update the SUPABASE_URL and SUPABASE_ANON_KEY in the script!');
        return;
    }
    addPlayerForm.addEventListener('submit', handleAddPlayer);
});
