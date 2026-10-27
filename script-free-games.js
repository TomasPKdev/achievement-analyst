fetch('https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions?locale=es-AR&country=AR&allowCountries=AR')
    .then(respuesta => respuesta.json())
    .then(datos => {
        const elementos = datos.data.Catalog.searchStore.elements;
        const juegosFree = elementos.filter(juego => {
            return juego.price.totalPrice.discountPrice === 0 && juego.price.totalPrice.originalPrice > 0;
        });
        juegosFree.forEach(element => {
            const grid = document.querySelector(".games-grid")
            const card = document.createElement("article");
            card.className = "card";
            const p = document.createElement("p");
            p.textContent = element.title;
            const img = document.createElement("img");
            img.src = element.keyImages[1].url
            const fechaFin = new Date(element.price.lineOffers[0].appliedRules[0].endDate);
            const fechaHoy = new Date();
            const timedownMilisegundos = fechaFin - fechaHoy
            const timedownDias = Math.floor(timedownMilisegundos / 86400000);
            const timedownHoras = Math.floor((timedownMilisegundos % 86400000) / 3600000)
            const timedown = document.createElement("p")
            timedown.textContent = `${timedownDias} Días y ${timedownHoras} Horas`
            grid.appendChild(card)
            card.appendChild(timedown)
            card.appendChild(p)
            card.appendChild(img)
        });   // <- cierra el forEach
    })        // <- cierra el .then
    .catch(err => console.error(err));   // <- el .catch va ACÁ, después del último .then