/* =========================
   CONFIG
========================= */
const SUPABASE_URL = 'https://xkoufgfrhhlbkpxylasc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qC6j9fHHcOI5MikiWG-y2w_Zi8Npf2R';
const SUPABASE_TABLE = 'server_stats';
const SUPABASE_REFRESH = 5000;

const MINEHUT_SERVER = 'JailButWorse';
const MINEHUT_API = `https://api.minehut.com/server/JailButWorse?byName=true
`;

const MINEHUT_REFRESH = 10000;

const DEFAULT_MAP = 'Unknown';

/* =========================
   ELEMENTS
========================= */
const statusEl = document.getElementById('status-online');
const playerCountEl = document.getElementById('player-count');
const extraEl = document.getElementById('server-extra');
const motdEl = document.getElementById('motd'); // optional
/* =========================
   SUPABASE FUNCTIONS
========================= */
let supabaseTimer = null;

async function fetchSupabaseStats() {
    statusEl.textContent = 'Loading…';
    const url = new URL(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`);
    url.searchParams.set('select', 'server_name,warden,map,players');
    url.searchParams.set('server_name', `eq.Server Stats`);

    try {
        console.log("testcarzy");
        
        const res = await fetch(url.toString(), {
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
                Accept: 'application/json'
            }
        });
        console.log("PASS 1");
        if (!res.ok) return setOfflineSupabase();
        console.log("PASS 2");
        const rows = await res.json();
        console.log(rows.length);
        if (!rows.length) return setOfflineSupabase();
        console.log("PASS 3");
        const r = rows[0];
        const mapName = r.map || DEFAULT_MAP;
        const players = r.players ?? [];
        console.log(mapName);
        console.log("test");
        extraEl.innerHTML = `
            <div class="status-sub">Map: <strong>${mapName}</strong></div>
            <div class="status-sub">Warden: <strong>${r.warden ?? 'None'}</strong></div>
        `;
        // optionally set player count if supabase is preferred
        // playerCountEl.textContent = players.length;
    } catch (err) {
        console.warn("Supabase fetch failed:", err);
        setOfflineSupabase();
    }
}

function setOfflineSupabase() {
    extraEl.innerHTML = '';
}

/* =========================
   MINEHUT FUNCTIONS
========================= */
async function fetchMinehutStatus() {
    if (!statusEl || !playerCountEl) return;

    try {
        const res = await fetch(MINEHUT_API, { cache: "no-store" });
        if (!res.ok) throw new Error("Minehut API response not OK");

        const data = await res.json();
        const s = data.server || data;

        // Server Online/Offline
        const onlineStatus = s.online ? "Online" : "Offline";
        statusEl.textContent = onlineStatus;

        // Player Count
        let playersOnline = "—";
        if (s.players && typeof s.players.online !== "undefined") {
            playersOnline = `${s.players.online}/${s.players.max || "?"}`;
        } else if (typeof s.playerCount !== "undefined") {
            playersOnline = s.playerCount;
        }
        playerCountEl.textContent = playersOnline;

    } catch (err) {
        console.warn("Minehut API fetch failed:", err);
        statusEl.textContent = "Offline";
        playerCountEl.textContent = "—";
    }
}


/* =========================
   AUTO REFRESH
========================= */
function startSupabaseRefresh() {
    if (supabaseTimer) clearInterval(supabaseTimer);
    supabaseTimer = setInterval(fetchSupabaseStats, SUPABASE_REFRESH);
}

function startMinehutRefresh() {
    setInterval(fetchMinehutStatus, MINEHUT_REFRESH);
}

/* =========================
   DOM & UI INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
    // Set current year
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Mobile nav toggle
    document.querySelectorAll('[id^="nav-toggle"]').forEach(btn => {
        btn.addEventListener("click", () => {
            const nav = btn.nextElementSibling;
            const expanded = btn.getAttribute("aria-expanded") === "true";
            btn.setAttribute("aria-expanded", (!expanded).toString());
            if (nav) nav.style.display = expanded ? "none" : "block";
        });
    });

    // Rules tabs
    document.querySelectorAll(".rules-nav .tab").forEach(t => {
        t.addEventListener("click", () => {
            const target = t.getAttribute("data-target");
            document.querySelectorAll(".rules-panel").forEach(p => p.hidden = true);
            const panel = document.getElementById(target);
            if (panel) panel.hidden = false;
            panel && panel.focus();
            panel && panel.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    // Deep linking for rules
    if (location.hash) {
        const hash = location.hash.replace("#", "");
        const el = document.getElementById(`rules-${hash}`);
        if (el) {
            document.querySelectorAll(".rules-panel").forEach(p => p.hidden = true);
            el.hidden = false;
            el.scrollIntoView();
        }
    }

    // Initial fetch + refresh
    fetchSupabaseStats();
    fetchMinehutStatus();
    startSupabaseRefresh();
    startMinehutRefresh();
});
