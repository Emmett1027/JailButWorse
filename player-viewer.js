// player-viewer.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.30.0/+esm';

// Get the input elements from the DOM
const playerNameEl = document.getElementById('playerName');
const loadBtn = document.getElementById('loadBtn');
const autoPollEl = document.getElementById('autoPoll');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');

const displayNameEl = document.getElementById('displayName');
const lastOnlineEl = document.getElementById('lastOnline');
const levelValEl = document.getElementById('levelVal');
const expValEl = document.getElementById('expVal');
const balanceValEl = document.getElementById('balanceVal');
const killsValEl = document.getElementById('killsVal');
const deathsValEl = document.getElementById('deathsVal');
const createdAtEl = document.getElementById('createdAt');
const descriptionEl = document.getElementById('description');
const metadataRawEl = document.getElementById('metadataRaw');

let supabase = null;
let pollTimer = null;
let lastQueryName = '';

function initSupabase() {
    const url = "https://xkoufgfrhhlbkpxylasc.supabase.co"; // your Supabase URL
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrb3VmZ2ZyaGhsYmtweHlsYXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MjkxNzEsImV4cCI6MjA4NDAwNTE3MX0.-4mKEmSCni0-2-aQZq5-6gOFhkQBWmHL5po1GoHunVY"; // your anon key
    supabase = createClient(url, key, { auth: { persistSession: false } });
    return true;
}


function formatTS(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch (e) {
    return iso;
  }
}

async function fetchPlayer(name) {
  if (!supabase) {
    if (!initSupabase()) return;
  }
  if (!name) {
    statusEl.textContent = 'Enter a player name.';
    return;
  }

  statusEl.textContent = 'Loading...';
  loadBtn.disabled = true;

  try {
    const { data, error } = await supabase
      .from('player_data')
      .select('*')
      .eq('player_name', name)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(error);
      statusEl.textContent = 'Error fetching player: ' + (error.message || JSON.stringify(error));
      resultEl.style.display = 'none';
      return;
    }
    if (!data) {
      statusEl.textContent = 'Player not found';
      resultEl.style.display = 'none';
      return;
    }

    // Render safely
    displayNameEl.textContent = data.player_name ?? '—';
    lastOnlineEl.textContent = 'Last online: ' + formatTS(data.last_online);
    levelValEl.textContent = data.level ?? '—';
    expValEl.textContent = data.experience ?? '0';
    balanceValEl.textContent = (data.balance ?? 0).toString();
    killsValEl.textContent = (data.kills ?? 0).toString();
    deathsValEl.textContent = (data.deaths ?? 0).toString();
    createdAtEl.textContent = formatTS(data.created_at);
    descriptionEl.textContent = data.description ?? '';
    metadataRawEl.textContent = JSON.stringify(data.metadata ?? {}, null, 2);

    statusEl.textContent = 'Loaded';
    resultEl.style.display = 'block';
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Unexpected error: ' + (err.message || String(err));
    resultEl.style.display = 'none';
  } finally {
    loadBtn.disabled = false;
  }
}

// Event listeners
loadBtn.addEventListener('click', () => {
  const name = playerNameEl.value.trim();
  lastQueryName = name;
  fetchPlayer(name);
});

autoPollEl.addEventListener('change', () => {
  if (autoPollEl.checked) {
    if (!lastQueryName) {
      statusEl.textContent = 'Load a player first to enable auto-refresh.';
      autoPollEl.checked = false;
      return;
    }
    pollTimer = setInterval(() => {
      fetchPlayer(lastQueryName);
    }, 10000);
  } else {
    clearInterval(pollTimer);
    pollTimer = null;
  }
});

playerNameEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loadBtn.click();
});
