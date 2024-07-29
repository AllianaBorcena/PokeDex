const typeColors = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    fairy: "#EE99AC",
};

document.addEventListener("DOMContentLoaded", () => {
    const MAX_POKEMON = 1010;
    const listwrapper = document.querySelector(".list");
    const searchInput = document.querySelector("#search-input");
    const numberFilter = document.querySelector("#number");
    const nameFilter = document.querySelector("#name");
    const MsgnotFound = document.querySelector("#notFound");
    const loadMoreButton = document.querySelector(".loadmore button");
    const sortByLabel = document.querySelector("#sort-by-label");
    const filterWrap = document.querySelector(".filter-wrap");
    const searchIcon = document.querySelector(".search-icon");
    let pokemons = [];
    let offset = 0;
    const LIMIT = 10;

    fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
        .then(response => response.json())
        .then(data => {
            pokemons = data.results;
            displayPokemon(pokemons.slice(offset, offset + LIMIT));
        });

    async function fetchPokemonData(id) {
        try {
            const [pokemon, pokemonSpecies] = await Promise.all([
                fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json()),
                fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) => res.json())
            ]);
            return pokemon;  
        } catch (error) {
            console.error("Failed to fetch Pokemon data before redirect");
            return null; 
        }
    }

    async function displayPokemon(pokemonList) {
        for (const pokemon of pokemonList) {
            const pokemonID = pokemon.url.split("/")[6];
            const imageID = pokemonID.padStart(3, '0');
            const pokemonData = await fetchPokemonData(pokemonID);
    
            if (pokemonData) {
                const types = pokemonData.types.map(typeInfo => typeInfo.type.name);
                const typeHTML = types.map(type => `<span class="type" style="color: ${typeColors[type]};">${type}</span>`).join(" · ");
                const listItem = document.createElement("div"); 
                listItem.className = "list-item";
                listItem.innerHTML = `
                    <div class="number-wrap">
                        <p class="caption-font">#${imageID}</p> <!-- Display padded ID -->
                    </div>
                    <div class="img-wrap">
                        <img src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/${imageID}.png" 
                            alt="${pokemon.name}" />
                    </div>
                    <div class="name-wrap">
                        <p class="body-font">${pokemon.name}</p>
                        <p class="body-font">${typeHTML}</p>
                    </div>   
                `;
    
                listItem.addEventListener("click", async () => {
                    const success = await fetchPokemonData(pokemonID);
                    if (success) {
                        window.location.href = `./detail.html?id=${pokemonID}`;
                    }
                });
    
                listwrapper.appendChild(listItem);
            }
        }
    }

    function performSearch() {
        const query = searchInput.value.toLowerCase();
        let filteredPokemons;
        
        if (numberFilter.checked && isNaN(query)) {
            filteredPokemons = [];
        } else if (nameFilter.checked && /\d/.test(query)) {
            filteredPokemons = [];
        } else {
            filteredPokemons = pokemons.filter(pokemon => {
                const pokemonID = pokemon.url.split("/")[6];
                return pokemon.name.includes(query) || pokemonID.includes(query);
            });
        }

        listwrapper.innerHTML = ""; 
        displayPokemon(filteredPokemons.slice(0, LIMIT));
    }

    searchIcon.addEventListener("click", () => {
        performSearch();
    });

    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            performSearch();
        }
    });

    numberFilter.addEventListener("change", () => {
        pokemons.sort((a, b) => a.url.split("/")[6] - b.url.split("/")[6]);
        listwrapper.innerHTML = ""; 
        offset = 0; 
        displayPokemon(pokemons.slice(0, LIMIT));
    });

    nameFilter.addEventListener("change", () => {
        pokemons.sort((a, b) => a.name.localeCompare(b.name));
        listwrapper.innerHTML = ""; 
        offset = 0; 
        displayPokemon(pokemons.slice(0, LIMIT));
    });

    loadMoreButton.addEventListener("click", () => {
        offset += LIMIT;
        displayPokemon(pokemons.slice(offset, offset + LIMIT));
    });

    window.addEventListener("scroll", () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            offset += LIMIT;
            displayPokemon(pokemons.slice(offset, offset + LIMIT));
        }
    });
});

