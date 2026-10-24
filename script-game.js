// script-game.js

// Obtener el appid que viene en la URL (ej: game.html?appid=730)
const urlParams = new URLSearchParams(window.location.search);
const appId = urlParams.get('appid');

const container = document.getElementById('game-detail');

// Proxy CORS para saltar el bloqueo del navegador
const CORS_PROXY = "https://corsproxy.io/?";

// PEGÁ TU API KEY DE STEAM ACÁ 👇
const STEAM_API_KEY = "PEGAR_TU_API_KEY_AQUI"; 

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
          
          <hr style="border-color: #333; margin: 20px 0;">
          
          <h2>Logros del Juego</h2>
          <div id="achievements-container" style="display: grid; grid-template-columns: 1fr; gap: 10px; margin-top: 15px;">
            <p style="color:#9c9993;">Cargando logros desde Steam...</p>
          </div>
        `;

        // 2. Una vez cargado el juego, pedimos los logros con la API de Steam
        fetchAchievements(appId);

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
function fetchAchievements(id) {
  const achievementsBox = document.getElementById('achievements-container');
  
  const schemaUrl = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=${SteamAPIKey}&appid=${id}&l=english`;

  fetch(CORS_PROXY + encodeURIComponent(schemaUrl))
    .then(response => response.json())
    .then(data => {
      const stats = data.game && data.game.availableGameStats;
      const achievements = stats && stats.achievements;

      if (!achievements || achievements.length === 0) {
        achievementsBox.innerHTML = `<p style="color:#9c9993;">Este juego no tiene logros públicos registrados en la API.</p>`;
        return;
      }

      // Vaciamos el "Cargando..."
      achievementsBox.innerHTML = '';

      // Mostramos los logros (limitamos a los primeros 30 para no saturar la pantalla visualmente)
      achievements.slice(0, 30).forEach(ach => {
        achievementsBox.innerHTML += `
          <div style="background: #151718; border: 1px solid #333; padding: 12px; border-radius: 8px; display: flex; align-items: center; gap: 15px;">
            <img src="${ach.icon}" alt="${ach.displayName}" style="width: 50px; height: 50px; border-radius: 4px;">
            <div>
              <h4 style="margin: 0; color: #fff; font-size: 15px;">${ach.displayName}</h4>
              <p style="margin: 4px 0 0 0; color: #9c9993; font-size: 13px;">${ach.description || 'Sin descripción disponible.'}</p>
            </div>
          </div>
        `;
      });

      if (achievements.length > 30) {
        achievementsBox.innerHTML += `<p style="color: #9c9993; text-align: center; margin-top: 10px;">Y ${achievements.length - 30} logros más...</p>`;
      }
    })
    .catch(err => {
      console.error("Error al traer los logros:", err);
      achievementsBox.innerHTML = `<p style="color: #ff5050;">Error al conectar con la API de logros. Verificá tu API Key.</p>`;
    });
}