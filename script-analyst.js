//script.js
const form = document.getElementById('search-form'); //requiero el form pq es el q manda el submit
const input = document.getElementById('game-input');//el input este es el texto q escribis en la caja de input
const suggestionsBox = document.getElementById('suggestions'); //caja contenedora de sugerencias
let timer;

// Funciones auxiliares para mostrar/ocultar
function hideSuggestions() {
  suggestionsBox.style.display = 'none';
}

function showSuggestions() {
  suggestionsBox.style.display = 'block';
}

form.addEventListener('input', function(event) { //la constante form le creo un evento q escucha cuando form ve q input tiene algo, y cuando pase eso, corre una funcion con el parametro event
  clearTimeout(timer);
  
  timer = setTimeout(function() {
    const term = input.value.trim();
    if (term === '') {
      hideSuggestions();
      return;
    }

  fetch(`https://store.steampowered.com/api/storesearch/?term=${input.value}&l=english&cc=us`) //fetch hace un pedido http a ese link y la convierte en promesa
  .then(response => response.json()) //esta promesa se transforma en la respuesta y se convierte en json
  .then(data => {
    const items = data.items || [];

    // Doble condición: validamos si hay resultados antes de mostrar
    if (items.length > 0) {
      showSuggestions(); // Esto pone #suggestions en display: block

      for (let i = 0; i < 4; i++) {
        const article = document.getElementById('suggestion' + (i + 1));
        
        if (items[i]) {
          const game = items[i];
          article.style.display = 'flex';
          article.querySelector('img').src = game.tiny_image;
          article.querySelector('p').textContent = game.name;

          // Al hacer clic, redirige a la página dedicada pasando el id del juego
          article.onclick = function() {
            window.location.href = `game.html?appid=${game.id}`;
          };
        } else {
          article.style.display = 'none'; // Oculta si hay menos de 4 resultados
        }
      }
    } else {
      hideSuggestions();
    }
  })
}, 400); //este timeout hace q no se haga el fetch hasta q el usuario deje de escribir por 400ms
});