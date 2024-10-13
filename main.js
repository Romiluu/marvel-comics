// Configuracion de la API
const apiUrl = "https://gateway.marvel.com/v1/public/";
const publicKey = "10f5836a64fa9ea27bf6fb9cbf41e826";
const privateKey = "c3859b369c4d5d8bb057b8d15b2058ec31f0db25";
const ts = "marvelromilu";
const hash = "3625cd0f9789029f5d8d27b459b86464";

// DOM 
const cardsContainer = document.getElementById("cards-container");
// Selección de tipo de contenido (personajes o comics) 
const marvelSelect = document.getElementById("marvel-select");
// Selección de botones de paginación
const btnFirst = document.getElementById("first-page");
const btnPrevious = document.getElementById("previous-page");
const btnNext = document.getElementById("next-page");
const btnLast = document.getElementById("last-page");

// TOTAL RESULTADOS
const total = document.getElementById("total-results");
let totalResults = 0;

// Funcion para crear tarjetas
function createCard(card) {
    const cardItem = document.createElement("div");
    cardItem.classList.add("card", "bg-gray-100", "border", "border-gray-300", "rounded-lg", "flex", "flex-col", "p-4", "w-64", "text-center", "shadow-2xl", "transition-transform", "duration-300", "hover:scale-105");
    
    const cardImg = document.createElement("img");
    cardImg.src = `${card.thumbnail.path}.${card.thumbnail.extension}`;
    cardImg.alt = card.name;

    const cardName = document.createElement("h3");
    cardName.textContent = card.name || card.title;

    cardItem.appendChild(cardImg);
    cardItem.appendChild(cardName);
    cardsContainer.appendChild(cardItem);
}
// Función para limpiar tarjetas
function clearCards() {
    cardsContainer.innerHTML = "";
}

// Funcion para obtener personajes o comics
function loadMarvelContent(endpoint, searchValue = "", searchType = "") {
    clearCards();
    const orderSelect = document.getElementById("sort-order");
    
    let url;
    if (searchValue) {
        const searchParameter = `${searchType}StartsWith=${searchValue}`;
        url = `${apiUrl}${endpoint}?${searchParameter}&orderBy=${orderSelect.value === "A-Z" ? searchType : "-" + searchType}&ts=${ts}&apikey=${publicKey}&hash=${hash}&limit=${pageLimit}&offset=${currentOffset}`;
    } else {
        url = `${apiUrl}${endpoint}?orderBy=${orderSelect.value === "A-Z" ? searchType : "-" + searchType}&ts=${ts}&apikey=${publicKey}&hash=${hash}&limit=${pageLimit}&offset=${currentOffset}`;
    }

    showLoader();

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            totalResults = data.data.total;
            total.textContent = `${totalResults} RESULTADOS`;
            let results = data.data.results;
            results.forEach((card) => createCard(card));
            hideLoader();
            updatePaginationButtons(); // Actualiza el estado de los botones
        })
        .catch((error) => console.error("Error al obtener los datos:", error));
}

// Click en el botón buscar
const searchButton = document.getElementById("btn-search");
searchButton.addEventListener("click", () => {
    const selectedValue = marvelSelect.value.toUpperCase();
    const searchValue = document.getElementById("input-search").value.trim();
    if (selectedValue === "PERSONAJES") {
        loadMarvelContent("characters", searchValue, "name");
    } else if (selectedValue === "COMICS") {
        loadMarvelContent("comics", searchValue, "title");
    }
});


function showLoader() {
    document.getElementById("loader").style.display = "block";
}
function hideLoader() {
    document.getElementById("loader").style.display = "none";
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

// Manejadores de eventos para cada botón de paginación
btnNext.addEventListener("click", () => {
    currentOffset += pageLimit;
    const searchValue = document.getElementById("input-search").value.trim();
    const selectedValue = marvelSelect.value.toUpperCase();
    if (selectedValue === "PERSONAJES") {
      loadMarvelContent("characters", searchValue, "name");
    } else if (selectedValue === "COMICS") {
      loadMarvelContent("comics", searchValue, "title");
    }
    updatePaginationButtons();
  });
  
  btnPrevious.addEventListener("click", () => {
    if (currentOffset > 0) {
      currentOffset -= pageLimit;
      const searchValue = document.getElementById("input-search").value.trim();
      const selectedValue = marvelSelect.value.toUpperCase();
      if (selectedValue === "PERSONAJES") {
        loadMarvelContent("characters", searchValue, "name");
      } else if (selectedValue === "COMICS") {
        loadMarvelContent("comics", searchValue, "title");
      }
      updatePaginationButtons();
    }
  });
  
  btnFirst.addEventListener("click", () => {
    currentOffset = 0;
    const searchValue = document.getElementById("input-search").value.trim();
    const selectedValue = marvelSelect.value.toUpperCase();
    if (selectedValue === "PERSONAJES") {
      loadMarvelContent("characters", searchValue, "name");
    } else if (selectedValue === "COMICS") {
      loadMarvelContent("comics", searchValue, "title");
    }
    updatePaginationButtons();
  });
  
  btnLast.addEventListener("click", () => {
    const maxOffset = Math.floor((totalResults - 1) / pageLimit) * pageLimit;
    currentOffset = maxOffset;
    const searchValue = document.getElementById("input-search").value.trim();
    const selectedValue = marvelSelect.value.toUpperCase();
    if (selectedValue === "PERSONAJES") {
      loadMarvelContent("characters", searchValue, "name");
    } else if (selectedValue === "COMICS") {
      loadMarvelContent("comics", searchValue, "title");
    }
    updatePaginationButtons();
  });
