//script.js
const form = document.getElementById('search-form'); //requiero el form pq es el q manda el submit
const input = document.getElementById('game-input');//el input este es el texto q escribis en la caja de input
let timer;

form.addEventListener('input', function(event) { //la constante form le creo un evento q escucha cuando form ve q input tiene algo, y cuando pase eso, corre una funcion con el parametro event
  clearTimeout(timer);
  timer = setTimeout(function() {
  fetch(`https://store.steampowered.com/api/storesearch/?term=${input.value}&l=english&cc=us`) //fetch hace un pedido http a ese link y la convierte en promesa
  .then(response => response.json()) //esta promesa se transforma en la respuesta y se convierte en json
  .then(data => {
  for (let i = 0; i < 4; i++) {
    const game = data.items[i];
    const article = document.getElementById('suggestion' + (i + 1));
    article.querySelector('img').src = game.tiny_image;
    article.querySelector('p').textContent = game.name;
  }
});
}, 400); //este timeout hace q no se haga el fetch hasta q el usuario deje de escribir por 400ms
});