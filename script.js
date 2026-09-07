//script.js
const form = document.getElementById('search-form'); //requiero el form pq es el q manda el submit
const input = document.getElementById('game-input');//el input este es el texto q escribis en la caja de input

form.addEventListener('submit', function(event) { //la constante form le creo un evento q escucha cuando form se hace submit, y cuando pase eso, corre una funcion con el parametro event
  event.preventDefault(); // este parametro event solo hace q la pagina no se recargue cuando le das submit al form
  console.log(input.value); // muesta el resultado por consola
});