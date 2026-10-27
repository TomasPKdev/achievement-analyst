// script-game.js

// Obtener el appid que viene en la URL (ej: game.html?appid=730)
const urlParams = new URLSearchParams(window.location.search);
const appId = urlParams.get('appid');

const container = document.getElementById('game-detail');

// Proxy CORS para saltar el bloqueo del navegador (Cambiado a allorigins para evitar que rompa parámetros largos)
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

if (appId) {
  // 1. Petición para traer la info general del juego
  fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`)
    .then(response => response.json())
    .then(data => {
      const gameData = data[appId];

      if (gameData && gameData.success) {
        const game = gameData.data;

        // Renderizamos la estructura visual del juego
        container.innerHTML = `
          <a href="analyst.html" class="back-btn">← Volver a la búsqueda</a>
          <h1>${game.name}</h1>
          <img src="${game.header_image}" alt="${game.name}" class="game-banner">
          <p>${game.short_description || 'Sin descripción disponible.'}</p>
          <p><strong>Desarrollador:</strong> ${game.developers ? game.developers.join(', ') : 'N/A'}</p>

          <div id="hunters-container"><p style="color:#9c9993;">Cargando datos de SteamHunters...</p></div>

            <hr style="border-color: #333; margin: 20px 0;">

            <h2>Logros del Juego</h2>
              <div id="achievements-container" style="display: grid; grid-template-columns: 1fr; gap: 10px; margin-top: 15px;">
                <p style="color:#9c9993;">Cargando logros desde Steam...</p>
              </div>
        `;

        // 2. Una vez cargado el juego, pedimos los logros con la API de Steam
        fetchAchievements(appId);
        fetchHunters(appId);

      } else {
        container.innerHTML = `<p>No se pudo obtener la información de este juego.</p>`;
      }
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = `<p>Error al cargar el juego.</p>`;
    });
} else {
  container.innerHTML = `<p>No se especificó ningún juego.</p>`;
}

// Función para buscar los logros del juego en una sola consulta
// Función para buscar los logros del juego en una sola consulta
function fetchAchievements(id) {
  const box = document.getElementById('achievements-container');
  const url = `https://api.steampowered.com/IPlayerService/GetGameAchievements/v1/?appid=${id}&language=english`;

  // Primero directo; si CORS lo bloquea, probamos con proxy
  fetch(url)
    .catch(() => fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent(url)))
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => {
      const list = (data.response?.achievements || [])
        .map(a => ({ ...a, percent: Number(a.player_percent_unlocked) }))
        .sort((a, b) => a.percent - b.percent); // más difíciles primero

      if (!list.length) {
        box.innerHTML = `<p style="color:#9c9993;">Este juego no tiene logros.</p>`;
        return;
      }

      box.innerHTML = list.map(a => `
        <div style="background:#151718;border:1px solid #333;padding:12px;border-radius:8px;display:flex;align-items:center;gap:15px;">
          <img src="https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/${id}/${a.icon}" style="width:50px;height:50px;border-radius:4px;">
          <div style="flex:1">
            <h4 style="margin:0;color:#fff;font-size:15px;">${a.localized_name}</h4>
            <p style="margin:4px 0 0;color:#9c9993;font-size:13px;">${a.localized_desc || 'Logro oculto'}</p>
          </div>
          <strong style="color:${a.percent < 5 ? '#ff5050' : '#9c9993'}">${a.percent.toFixed(1)}%</strong>
        </div>`).join('');
    })
    .catch(err => {
      console.error(err);
      box.innerHTML = `<p style="color:#ff5050;">No se pudieron cargar los logros.</p>`;
    });
}
const SH_API = 'https://steamhunters.com/api';

function fetchSH(path) {
  const url = `${SH_API}/${path}`;
  return fetch(url)
    .catch(() => fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent(url)))
    .then(r => (r.ok ? r.json() : null))
    .catch(() => null);
}

const fmtTime = (min) => {
  if (!min) return null;
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  return h > 0 ? `${h.toLocaleString()}h ${m}m` : `${m}m`;
};
const fmtCount = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(n);

function fetchHunters(id) {
  const box = document.getElementById('hunters-container');

  Promise.all([fetchSH(`apps/${id}`), fetchSH(`apps/${id}/achievements`)]).then(([app, ach]) => {
    if (!app || !app.achievementCount) {
      box.innerHTML = `<p style="color:#9c9993;">Sin datos de SteamHunters para este juego.</p>`;
      return;
    }

    const count = (v) => Array.isArray(ach) ? ach.filter(a => a.obtainability === v).length : null;
    // obtainability: 0 = normal, 1 = roto pero obtenible, 2 = condicional, 3 = imposible
    const unob = count(3) ?? app.unobtainableAchievementCount ?? 0;
    const cond = count(2), broken = count(1);

    const perfPct = app.playersStartedCount
      ? (app.playersPerfectedCount / app.playersStartedCount * 100).toFixed(1) + '% of starters' : '';

    const stat = (label, value, sub = '') => `
      <div style="flex:1;text-align:center;padding:14px 8px;border-right:1px solid #333;">
        <div style="color:#9c9993;font-size:11px;letter-spacing:1px;">${label.toUpperCase()}</div>
        <div style="color:#a4d007;font-size:22px;font-weight:bold;">${value}</div>
        <div style="color:#9c9993;font-size:11px;">${sub}</div>
      </div>`;

    const flag = (label, text, level) => {
      const color = { ok: '#a4d007', warn: '#e5a00d', bad: '#ff5050' }[level];
      return `<div style="display:flex;justify-content:space-between;padding:8px 14px;border-top:1px solid #2a2e30;">
        <span style="color:#c7c7c7;">${label}</span><strong style="color:${color}">${text}</strong></div>`;
    };
    const n = (x) => x > 0 ? `${x} achievement${x > 1 ? 's' : ''}` : 'None';

    box.innerHTML = `
      <div style="background:#1e2122;border-radius:8px;overflow:hidden;margin:20px 0;">
        <div style="display:flex;border-bottom:1px solid #333;">
          ${stat('Perfected', fmtCount(app.playersPerfectedCount), perfPct)}
          ${fmtTime(app.fastestCompletionTime) ? stat('Fastest', fmtTime(app.fastestCompletionTime)) : ''}
          ${fmtTime(app.medianCompletionTime) ? stat('Median', fmtTime(app.medianCompletionTime)) : ''}
          ${stat('Achievements', app.achievementCount)}
        </div>
        ${flag('DLC Required', app.hasPaidDlc ? 'Yes' : 'No', app.hasPaidDlc ? 'warn' : 'ok')}
        ${flag('Unobtainable', n(unob), unob > 0 ? 'bad' : 'ok')}
        ${cond !== null ? flag('Conditional', n(cond), cond > 0 ? 'warn' : 'ok') : ''}
        ${broken !== null ? flag('Broken (obtainable)', n(broken), broken > 0 ? 'warn' : 'ok') : ''}
        <div style="padding:8px 14px;text-align:right;font-size:11px;color:#9c9993;">
          Data from <a href="https://steamhunters.com/apps/${id}" target="_blank" style="color:#9c9993;">steamhunters.com</a>
        </div>
      </div>`;
  });
}