let currentPokemonId = null;

document.addEventListener("DOMContentLoaded", () => {
    const MAX_POKEMONS = 1010;
    const pokemonID = new URLSearchParams(window.location.search).get("id");
    const id = parseInt(pokemonID, 10);

    if (id < 1 || id > MAX_POKEMONS) {
        return (window.location.href = "./index.html");
    }

    currentPokemonId = id;
    loadPokemon(id);
});

function displayPokemonType(pokemon) {
    const typeElement = document.getElementById("pokemonType");
    if (!typeElement) return;

    const types = pokemon.types.map((t) => t.type.name);
    typeElement.innerHTML = "";

    types.forEach((type) => {
        const typeSpan = document.createElement("span");
        typeSpan.textContent = type;
        typeSpan.style.backgroundColor = typeColors[type];
        typeSpan.style.color = "#fff"; 
        typeSpan.style.padding = "5px 10px";
        typeSpan.style.borderRadius = "10px";
        typeSpan.style.marginRight = "5px";
        typeElement.appendChild(typeSpan);
    });
}

async function loadPokemon(id) {
    try {
        const [pokemon, pokemonSpecies] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json()),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) => res.json()),
        ]);

        if (currentPokemonId === id) {
            displayPokemonDetails(pokemon);
            displayPokemonType(pokemon); // Add this line
            const flavorText = getEnglishFlavorText(pokemonSpecies);
            document.querySelector(".pokemon-description").textContent = flavorText;

            const [leftArrow, rightArrow] = ["#LeftArrow", "#RightArrow"].map((sel) =>
                document.querySelector(sel)
            );

            leftArrow.removeEventListener("click", navigatePokemon);
            rightArrow.removeEventListener("click", navigatePokemon);

            if (id !== 1) {
                leftArrow.addEventListener("click", () => {
                    navigatePokemon(id - 1);
                });
            }
            if (id !== 1010) {
                rightArrow.addEventListener("click", () => {
                    navigatePokemon(id + 1);
                });
            }

            window.history.pushState({}, "", `./detail.html?id=${id}`);
        }

        return true;
    } catch (error) {
        console.error("An error occurred while fetching Pokemon data:", error);
        return false;
    }
}

async function navigatePokemon(id) {
    currentPokemonId = id;
    await loadPokemon(id);
}

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

function setElementStyles(elements, cssProperty, value) {
    elements.forEach((element) => {
        element.style[cssProperty] = value;
    });
}

function rgbaFromHex(hexColor) {
    return [
        parseInt(hexColor.slice(1, 3), 16),
        parseInt(hexColor.slice(3, 5), 16),
        parseInt(hexColor.slice(5, 7), 16),
    ].join(", ");
}

function setTypeBackgroundColor(pokemon) {
    const mainType = pokemon.types[0].type.name;
    const color = typeColors[mainType];

    if (!color) {
        console.warn(`Color not defined for type: ${mainType}`);
        return;
    }

    const detailMainElement = document.querySelector(".detail-main");
    setElementStyles([detailMainElement], "backgroundColor", color);
    setElementStyles([detailMainElement], "borderColor", color);

    setElementStyles(
        document.querySelectorAll(".power-wrapper > p"),
        "backgroundColor",
        color
    );

    setElementStyles(
        document.querySelectorAll(".stats-wrap p.stats"),
        "color",
        color
    );

    setElementStyles(
        document.querySelectorAll(".stats-wrap progress"),
        "color",
        color
    );

    const rgbaColor = rgbaFromHex(color);
    setElementStyles(
        document.querySelectorAll(".stats-wrap progress"),
        "backgroundColor",
        `rgba(${rgbaColor}, 0.2)`
    );
}

const typeWeaknesses = {
    normal: ["rock", "ghost", "steel"],
    fighting: ["flying", "poison", "psychic", "bug", "ghost", "fairy"],
    flying: ["rock", "steel", "electric"],
    poison: ["poison", "ground", "rock", "ghost", "steel"],
    ground: ["flying", "bug", "grass"],
    rock: ["fighting", "ground", "steel"],
    bug: ["fighting", "flying", "poison", "ghost", "steel", "fire", "fairy"],
    ghost: ["normal", "dark"],
    steel: ["steel", "fire", "water", "electric"],
    fire: ["rock", "fire", "water", "dragon"],
    water: ["water", "grass", "dragon"],
    grass: ["flying", "poison", "bug", "steel", "fire", "grass", "dragon"],
    electric: ["ground", "grass", "electric", "dragon"],
    psychic: ["steel", "psychic", "dark"],
    ice: ["steel", "fire", "water", "ice"],
    dragon: ["steel", "fairy"],
    dark: ["fighting", "dark", "fairy"],
    fairy: ["poison", "steel", "fire"],
};

function calculateWeaknesses(types) {
    const allWeaknesses = new Set();
    
    types.forEach(type => {
        const weaknesses = typeWeaknesses[type] || [];
        weaknesses.forEach(weakness => {
            allWeaknesses.add(weakness);
        });
    });

    return Array.from(allWeaknesses);
}

function displayWeaknesses(pokemon) {
    const types = pokemon.types.map(t => t.type.name);
    console.log("Types:", types); 

    const weaknessesList = calculateWeaknesses(types);
    console.log("Weaknesses:", weaknessesList); 

    const weaknessesElement = document.querySelector(".weaknesses"); 
    if (weaknessesElement) {
        // Update the element content
        weaknessesElement.textContent = weaknessesList.length > 0 ? weaknessesList.join(", ") : "None";
    } else {
        // Log an error if the element is not found
        console.error("Weaknesses element not found.");
    }
}


function displayPokemonDetails(pokemon) {
    const nameElement = document.querySelector(".name-wrap > h1.name");
    const idElement = document.querySelector(".pokemon-id-wrap > p");
    const imageElement = document.querySelector(".pokemonImage > img");
    const heightElement = document.querySelector(".height");
    const weightElement = document.querySelector(".weight");
    const moveElement = document.querySelector(".move");

    if (nameElement) nameElement.textContent = pokemon.name;
    if (idElement) idElement.textContent = `#${String(pokemon.id).padStart(3, "0")}`;
    if (imageElement) imageElement.src = pokemon.sprites.other["official-artwork"].front_default;
    if (heightElement) heightElement.textContent = `${pokemon.height / 10} m`;
    if (weightElement) weightElement.textContent = `${pokemon.weight / 10} kg`;

    const types = pokemon.types.map((t) => t.type.name);
    types.forEach((type, index) => {
        if (index < 2) {
            const typeElement = document.querySelector(`.type-${type}`);
            if (typeElement) typeElement.textContent = type;
        }
    });

    const moves = pokemon.abilities.map((a) => a.ability.name).join(", ");
    if (moveElement) moveElement.textContent = moves;

    const stats = document.querySelectorAll(".stats-wrap");
    pokemon.stats.forEach((stat, index) => {
        const statElements = stats[index]?.querySelectorAll("p.stats, progress");
        if (statElements) {
            statElements[0].textContent = stat.stat.name.toUpperCase();
            statElements[1].textContent = stat.base_stat;
            statElements[2].value = stat.base_stat;
        }
    });

    setTypeBackgroundColor(pokemon);
    displayWeaknesses(pokemon); 
}



function getEnglishFlavorText(pokemonSpecies) {
    const flavorEntry = pokemonSpecies.flavor_text_entries.find(
        (entry) => entry.language.name === "en"
    );

    return flavorEntry ? flavorEntry.flavor_text : "No description available.";
}
