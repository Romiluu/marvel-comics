// Configuracion de la API
const apiUrl = "https://gateway.marvel.com/v1/public/";
const publicKey = "10f5836a64fa9ea27bf6fb9cbf41e826";
const privateKey = "c3859b369c4d5d8bb057b8d15b2058ec31f0db25";
const ts = "marvelromilu";
const hash = "3625cd0f9789029f5d8d27b459b86464";


// Funciones personalizadas para seleccionar elementos
const $ = (query) => document.querySelector(query);
const $$ = (query) => document.querySelectorAll(query);

// DOM 
const cardsContainer = $("#cards-container");
// Selección de tipo de contenido (personajes o comics) 
const marvelSelect = $("#marvel-select");
// Selección de botones de paginación
const btnFirst = $("#first-page");
const btnPrevious = $("#previous-page");
const btnNext = $("#next-page");
const btnLast = $("#last-page");
// Selecciona la sección de cómics
const comicSection = $(".comic-section");
const resultsSection = $(".results-section");

const searchButton = $("#btn-search");
const orderSelect = $("#sort-order");

// TOTAL RESULTADOS
const total = $("#total-results");
let totalResults = 0;

// Función para crear tarjetas
function createCard(card) {
    const cardItem = document.createElement("div");
    cardItem.classList.add("card", "bg-gray-100", "border", "border-gray-300", "rounded-lg", "flex", "flex-col", "p-4", "w-64", "text-center", "shadow-2xl", "transition-transform", "duration-300", "hover:scale-105");
    
    const cardImg = document.createElement("img");
    cardImg.src = `${card.thumbnail.path}.${card.thumbnail.extension}`;
    cardImg.alt = card.name;

    const cardName = document.createElement("h3");
    cardName.textContent = card.name || card.title;

    // Pasa el ID del cómic a la función loadMarvelContent cuando se hace clic
    cardItem.addEventListener("click", () => {
        if (marvelSelect.value.toUpperCase() === "COMICS") {
            loadMarvelContent("comics", "", "", card.id); // Pasa el comicId aquí
        } else {
            console.log("Detalles solo disponibles para cómics.");
        }
    });

    cardItem.appendChild(cardImg);
    cardItem.appendChild(cardName);
    cardsContainer.appendChild(cardItem);
}


// Función para limpiar tarjetas
function clearCards() {
    cardsContainer.innerHTML = "";
}

// Función para obtener personajes o cómics
function loadMarvelContent(endpoint, searchValue = "", searchType = "", comicId = null) {
    clearCards();

    let url;
    if (comicId) {
        // URL específica para detalles del cómic
        url = `${apiUrl}comics/${comicId}?ts=${ts}&apikey=${publicKey}&hash=${hash}`;
    } else if (searchValue) {
        const searchParameter = `${searchType}StartsWith=${searchValue}`;
        url = `${apiUrl}${endpoint}?${searchParameter}&orderBy=${orderSelect.value === "A-Z" ? searchType : "-" + searchType}&ts=${ts}&apikey=${publicKey}&hash=${hash}&limit=${pageLimit}&offset=${currentOffset}`;
    } else {
        url = `${apiUrl}${endpoint}?orderBy=${orderSelect.value === "A-Z" ? searchType : "-" + searchType}&ts=${ts}&apikey=${publicKey}&hash=${hash}&limit=${pageLimit}&offset=${currentOffset}`;
    }

    showLoader();

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            if (comicId) {
                // Muestra los detalles del cómic cuando se selecciona uno específico
                const comic = data.data.results[0];
                showComicDetails(comic);
            } else {
                totalResults = data.data.total;
                total.textContent = `${totalResults} RESULTADOS`;
                let results = data.data.results;
                results.forEach((card) => createCard(card));
            }
            hideLoader();
            updatePaginationButtons();
        })
        .catch((error) => console.error("Error al obtener los datos:", error));
}

// Click en el botón buscar
searchButton.addEventListener("click", () => {
    const selectedValue = marvelSelect.value.toUpperCase();
    const searchValue = $("#input-search").value.trim();
    if (selectedValue === "PERSONAJES") {
        loadMarvelContent("characters", searchValue, "name");
    } else if (selectedValue === "COMICS") {
        loadMarvelContent("comics", searchValue, "title");
    }
});


function showLoader() {
    $("#loader").style.display = "block";
}
function hideLoader() {
    $("#loader").style.display = "none";
}
// Cargar comics al iniciar
window.onload = () => loadMarvelContent("comics");


// Función para habilitar o deshabilitar los botones de paginación
function updatePaginationButtons() {
    const maxOffset = Math.floor((totalResults - 1) / pageLimit) * pageLimit;
    btnFirst.disabled = currentOffset === 0;
    btnPrevious.disabled = currentOffset === 0;
    btnNext.disabled = currentOffset >= maxOffset;
    btnLast.disabled = currentOffset >= maxOffset;
}

let pageLimit = 20; // Límite de resultados por página
let currentOffset = 0; // Offset inicial

// Botones de paginación
btnFirst.addEventListener("click", () => {
    currentOffset = 0;
    loadMarvelContent(marvelSelect.value === "COMICS" ? "comics" : "characters");
});

btnPrevious.addEventListener("click", () => {
    if (currentOffset > 0) {
        currentOffset -= pageLimit;
        loadMarvelContent(marvelSelect.value === "COMICS" ? "comics" : "characters");
    }
});

btnNext.addEventListener("click", () => {
    const maxOffset = Math.floor((totalResults - 1) / pageLimit) * pageLimit;
    if (currentOffset < maxOffset) {
        currentOffset += pageLimit;
        loadMarvelContent(marvelSelect.value === "COMICS" ? "comics" : "characters");
    }
});

btnLast.addEventListener("click", () => {
    currentOffset = Math.floor((totalResults - 1) / pageLimit) * pageLimit;
    loadMarvelContent(marvelSelect.value === "COMICS" ? "comics" : "characters");
});

/* ----------------------------------------------------------------------- */

// Función para mostrar los detalles del cómic, incluyendo personajes
function showComicDetails(comic) {
    const coverPath = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
    const title = comic.title || "Título no disponible";
    const published = comic.dates.find(date => date.type === "onsaleDate")?.date || "Fecha no disponible";
    const writers = comic.creators.items.map(writer => writer.name).join(', ') || "Guionistas no disponibles";
    const description = comic.description || "Descripción no disponible";
    
    $(".comic-cover").src = coverPath;
    $(".comic-title").textContent = title;
    $(".comic-published").textContent = published;
    $(".comic-writers").textContent = writers;
    $(".comic-description").textContent = description;

    // Llamada a la función que carga los personajes
    loadComicCharacters(comic.id);

    comicSection.classList.remove("hidden");
    resultsSection.classList.add("hidden");
}


// Función para obtener y mostrar personajes relacionados con el cómic
function loadComicCharacters(comicId) {
    const url = `${apiUrl}comics/${comicId}/characters?ts=${ts}&apikey=${publicKey}&hash=${hash}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            const characters = data.data.results;
            const characterContainer = document.querySelector(".character-cards");
            characterContainer.innerHTML = ""; // Limpiar personajes previos

            characters.forEach(character => {
                const charCard = document.createElement("div");
                charCard.classList.add("character-card", "bg-black", "p-4", "rounded-md", "shadow-md", "text-white", "flex", "flex-col", "items-center", "w-48", "transition-transform", "duration-300", "hover:scale-105",  "hover:bg-red-600"); // Aumentar el tamaño de la tarjeta y aplicar zoom

                const charImage = document.createElement("img");
                charImage.src = `${character.thumbnail.path}.${character.thumbnail.extension}`;
                charImage.alt = character.name;
                charImage.classList.add("rounded-md", "mb-2", "object-cover", "h-36", "w-full"); // Aumentar la altura de la imagen

                const charName = document.createElement("p");
                charName.textContent = character.name;
                charName.classList.add("text-sm", "text-center", "font-bold", "mt-auto", "pt-1", "border-t", "border-red-600"); // Cambiar el color del nombre al pasar el mouse

                charCard.appendChild(charImage);
                charCard.appendChild(charName);
                characterContainer.appendChild(charCard);
            });
        })
        .catch((error) => console.error("Error al obtener los personajes:", error));
}