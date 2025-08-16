import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

    const SUPABASE_URL = 'https://dflgcunlcuiimafabbmy.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmbGdjdW5sY3VpaW1hZmFiYm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2Njg2OTYsImV4cCI6MjA3MDI0NDY5Nn0.YK-QvBOjeIiGNZ2CZP8sPMcw_qS2uEJrH0u_2hEKlSM';

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    let players = [];
    let currentSort = { column: "points", direction: "desc" };

    async function fetchPlayers() {
      const { data, error } = await supabase
        .from("players")
        .select("*");

      if (error) {
        console.error("Error fetching players:", error);
        return;
      }

      players = data || [];
      renderTable();
    }

    function renderTable() {
      let filtered = players.filter(player =>
        player.name.toLowerCase().includes(
          document.getElementById("searchInput").value.toLowerCase()
        )
      );

      filtered.sort((a, b) => {
        let col = currentSort.column;
        let dir = currentSort.direction === "asc" ? 1 : -1;

        if (col === "name") {
          return a.name.localeCompare(b.name) * dir;
        } else if (col === "position") {
          return (players.indexOf(a) - players.indexOf(b)) * dir;
        } else {
          return (a[col] - b[col]) * dir;
        }
      });

      const rankingsBody = document.getElementById("rankingsBody");
      rankingsBody.innerHTML = "";

      filtered
        .sort((a, b) => b.points - a.points) // for position rank
        .forEach((player, index) => {
          const row = document.createElement("tr");

          row.innerHTML = `
            <td>${index + 1}</td>
            <td><img src="${player.photo_url}" alt="${player.name}" width="40"></td>
            <td>${player.name}</td>
            <td>${player.points}</td>
            <td>${player.played}</td>
            <td>${player.won}</td>
            <td>${player.lost}</td>
            <td>${player.draw}</td>
          `;

          rankingsBody.appendChild(row);
        });
    }

    // Sorting
    document.querySelectorAll("th[data-sort]").forEach(th => {
      th.addEventListener("click", () => {
        const column = th.getAttribute("data-sort");

        if (currentSort.column === column) {
          currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
        } else {
          currentSort.column = column;
          currentSort.direction = "asc";
        }

        renderTable();
      });
    });

    // Search
    document.getElementById("searchInput").addEventListener("input", renderTable);

    // Initial Fetch
    fetchPlayers();
