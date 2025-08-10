import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- IMPORTANT: REPLACE WITH YOUR SUPABASE DETAILS ---
const SUPABASE_URL = 'https://dflgcunlcuiimafabbmy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmbGdjdW5sY3VpaW1hZmFiYm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2Njg2OTYsImV4cCI6MjA3MDI0NDY5Nn0.YK-QvBOjeIiGNZ2CZP8sPMcw_qS2uEJrH0u_2hEKlSM';
// ----------------------------------------------------

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loadingSpinner = document.getElementById('loading-spinner');
const rankingsTable = document.getElementById('rankings-table');
const rankingsBody = document.getElementById('rankings-body');

async function fetchAndDisplayRankings() {
    try {
        // Fetch all players, ordered by points descending
        const { data: players, error } = await supabase
            .from('players')
            .select('*')
            .order('points', { ascending: false });

        if (error) throw error;

        // Clear previous entries
        rankingsBody.innerHTML = '';

        // Populate the table
        players.forEach((player, index) => {
            const rank = index + 1;
            const row = document.createElement('tr');
            
            // Add special classes for top ranks
            if (rank <= 3) {
                row.classList.add(`rank-${rank}`);
            }

            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${rank}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img class="h-10 w-10 rounded-full object-cover" src="${player.photo_url}" alt="${player.name}">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${player.name}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">${player.points}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${player.won}-${player.lost}-${player.draw}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${player.played}</td>
            `;
            rankingsBody.appendChild(row);
        });

        // Hide spinner and show table
        loadingSpinner.style.display = 'none';
        rankingsTable.classList.remove('hidden');

    } catch (error) {
        console.error('Error fetching rankings:', error);
        loadingSpinner.innerHTML = `<p class="text-red-500">Could not load rankings. ${error.message}</p>`;
    }
}

// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        alert('Please update the SUPABASE_URL and SUPABASE_ANON_KEY in the script!');
        return;
    }
    fetchAndDisplayRankings();
});
