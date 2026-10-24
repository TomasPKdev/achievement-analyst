// Obtener el appid que viene en la URL (ej: game.html?appid=976730)
const urlParams = new URLSearchParams(window.location.search);
const appId = urlParams.get('appid');
//busca mi contenedor game-detail en el html para renderizar ahi la info del juego
const container = document.getElementById('game-detail');

if (appId) {
  // Petición a la API de Steam para traer la información detallada del juego
  fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`)
    .then(response => response.json())
    .then(data => {
      const gameData = data[appId]; //busca el appid en la respuesta de la api y la guarda en gameData
        // Verifica si la respuesta fue exitosa y si hay datos del juego
      if (gameData && gameData.success) {
        const game = gameData.data;

        container.innerHTML = `
          <a href="analyst.html" class="back-btn">← Volver a la búsqueda</a>
          <h1>${game.name}</h1>
          <img src="${game.header_image}" alt="${game.name}" class="game-banner">
          <p>${game.short_description || 'Sin descripción disponible.'}</p>
          <p><strong>Desarrollador:</strong> ${game.developers ? game.developers.join(', ') : 'N/A'}</p>
          
          <hr style="border-color: #333; margin: 20px 0;">
          
          <h2>Logros y Análisis</h2>
          <div id="achievements-section">
            <p style="color:#9c9993;">Acá podés renderizar la lista de logros u objetivos del juego.</p>
          </div>
        `;
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