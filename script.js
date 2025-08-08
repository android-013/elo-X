import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- IMPORTANT: REPLACE WITH YOUR SUPABASE DETAILS ---
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
// ----------------------------------------------------

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let player1 = null;
let player2 = null;

const player1Card = document.getElementById('player1-card');
const player2Card = document.getElementById('player2-card');
const player1Img = document.getElementById('player1-img');
const player2Img = document.getElementById('player2-img');
const player1Name = document.getElementById('player1-name');
const player2Name = document.getElementById('player2-name');
const player1VoteBtn = document.getElementById('player1-vote-btn');
const player2VoteBtn = document.getElementById('player2-vote-btn');
const drawVoteBtn = document.getElementById('draw-vote-btn');
const loadingSpinner = document.getElementById('loading-spinner');

// --- CORE FUNCTIONS ---

async function fetchTwoRandomPlayers() {
    setLoadingState(true);

    // Fetch all player IDs first
    const { data: allPlayers, error: idError } = await supabase
        .from('players')
        .select('id');

    if (idError || !allPlayers || allPlayers.length < 2) {
        console.error("Error fetching players or not enough players:", idError);
        alert("Could not load players. Make sure you have at least 2 players in the database.");
        setLoadingState(false);
        return;
    }

    // Get two different random indices
    let index1 = Math.floor(Math.random() * allPlayers.length);
    let index2;
    do {
        index2 = Math.floor(Math.random() * allPlayers.length);
    } while (index1 === index2);

    const id1 = allPlayers[index1].id;
    const id2 = allPlayers[index2].id;

    // Fetch the full data for the two selected players
    const { data: players, error: fetchError } = await supabase
        .from('players')
        .select('*')
        .in('id', [id1, id2]);

    if (fetchError || !players) {
        console.error("Error fetching player details:", fetchError);
        setLoadingState(false);
        return;
    }

    player1 = players[0];
    player2 = players[1];

    updateUI();
    setLoadingState(false);
}

function updateUI() {
    if (!player1 || !player2) return;

    // Update Player 1
    player1Img.src = player1.photo_url;
    player1Name.textContent = player1.name;
    player1VoteBtn.textContent = `Vote for ${player1.name}`;

    // Update Player 2
    player2Img.src = player2.photo_url;
    player2Name.textContent = player2.name;
    player2VoteBtn.textContent = `Vote for ${player2.name}`;
}

async function handleVote(winner, loser, isDraw = false) {
    if (!winner || !loser) return;
    setLoadingState(true);

    try {
        const { data, error } = await supabase.functions.invoke('update-ratings', {
            body: {
                winnerId: winner.id,
                loserId: loser.id,
                isDraw: isDraw
            }
        });

        if (error) throw error;

        console.log('Vote successful:', data);
        // Load the next match
        await fetchTwoRandomPlayers();

    } catch (error) {
        console.error('Error invoking function:', error);
        alert(`An error occurred while voting: ${error.message}`);
        setLoadingState(false);
    }
}

function setLoadingState(isLoading) {
    if (isLoading) {
        loadingSpinner.classList.remove('hidden');
        player1Card.classList.add('loading-state');
        player2Card.classList.add('loading-state');
        player1VoteBtn.disabled = true;
        player2VoteBtn.disabled = true;
        drawVoteBtn.disabled = true;
    } else {
        loadingSpinner.classList.add('hidden');
        player1Card.classList.remove('loading-state');
        player2Card.classList.remove('loading-state');
        player1VoteBtn.disabled = false;
        player2VoteBtn.disabled = false;
        drawVoteBtn.disabled = false;
    }
}

// --- EVENT LISTENERS ---

player1VoteBtn.addEventListener('click', () => handleVote(player1, player2));
player2VoteBtn.addEventListener('click', () => handleVote(player2, player1));
drawVoteBtn.addEventListener('click', () => handleVote(player1, player2, true));

// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        alert('Please update the SUPABASE_URL and SUPABASE_ANON_KEY in the script!');
        return;
    }
    fetchTwoRandomPlayers();
});
