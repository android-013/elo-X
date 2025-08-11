import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://dflgcunlcuiimafabbmy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmbGdjdW5sY3VpaW1hZmFiYm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2Njg2OTYsImV4cCI6MjA3MDI0NDY5Nn0.YK-QvBOjeIiGNZ2CZP8sPMcw_qS2uEJrH0u_2hEKlSM';

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

async function fetchTwoRandomPlayers() {
    setLoadingState(true);

    const { data: allPlayers, error: idError } = await supabase
        .from('players')
        .select('id');

    if (idError || !allPlayers || allPlayers.length < 2) {
        console.error("Error fetching players:", idError);
        alert("Could not load players. Need at least 2 players.");
        setLoadingState(false);
        return;
    }

    let index1 = Math.floor(Math.random() * allPlayers.length);
    let index2;
    do {
        index2 = Math.floor(Math.random() * allPlayers.length);
    } while (index1 === index2);

    const id1 = allPlayers[index1].id;
    const id2 = allPlayers[index2].id;

    const { data: players, error: fetchError } = await supabase
        .from('players')
        .select('*')
        .in('id', [id1, id2]);

    if (fetchError || !players || players.length < 2) {
        console.error("Error fetching player details:", fetchError);
        setLoadingState(false);
        return;
    }

    // Ensure correct assignment to player1 and player2
    player1 = players.find(p => p.id === id1);
    player2 = players.find(p => p.id === id2);

    updateUI();
    setLoadingState(false);
}

function updateUI() {
    player1Img.src = player1.photo_url || 'https://placehold.co/400x400?text=No+Image';
    player1Name.textContent = player1.name;
    player1VoteBtn.textContent = `Vote for ${player1.name}`;

    player2Img.src = player2.photo_url || 'https://placehold.co/400x400?text=No+Image';
    player2Name.textContent = player2.name;
    player2VoteBtn.textContent = `Vote for ${player2.name}`;
}

async function handleVote(winner, loser, isDraw = false) {
    if (!winner || !loser) return;
    setLoadingState(true);

    const { error } = await supabase.rpc("update_elo", {
        winner_id: winner.id,
        loser_id: loser.id,
        is_draw: isDraw
    });

    if (error) {
        console.error(error);
        alert(`An error occurred while voting: ${error.message}`);
        setLoadingState(false);
    } else {
        console.log("Elo updated");
        await fetchTwoRandomPlayers();
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

player1VoteBtn.addEventListener('click', () => handleVote(player1, player2));
player2VoteBtn.addEventListener('click', () => handleVote(player2, player1));
drawVoteBtn.addEventListener('click', () => handleVote(player1, player2, true));

document.addEventListener('DOMContentLoaded', fetchTwoRandomPlayers);
