let imagesData = [];

//Variables de trie :
let currentSort = "id";
let currentOrder = "asc";
let currentImages = [];

// Variables de filtre :
let currentFilters = {
  tags: "",
  auteur: "",
  lieu: ""
};

let filterMode = "ET"; // Variable Switch ET-OU
const toggleBtn = document.getElementById("toggleMode");
toggleBtn.addEventListener("click", () => {
  filterMode = filterMode === "ET" ? "OU" : "ET";
  toggleBtn.textContent = filterMode;
  toggleBtn.className = filterMode === "ET" ? "mode-on" : "mode-off";
  //applyAll();
});


// Variables Pagination : 
let currentPage = 1;
let imagesPerPage = 20;

let viewMode = "grid"; // Variable affichage "grid" | "list"

//---------------------------------------------------------------
//Side Barre
const burgerBtn = document.getElementById("burgerBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

burgerBtn.addEventListener("click", () => {
  const isOpen = sidebar.classList.toggle("open");
  overlay.classList.toggle("show");

  burgerBtn.textContent = isOpen ? "✕" : "☰";
  burgerBtn.classList.toggle("open", isOpen);
});

overlay.addEventListener("click", closeSidebar);

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
  burgerBtn.textContent = "☰";
  burgerBtn.classList.remove("open");
}
//---------------------------------------------------------------


fetch("images.json")
  .then(res => res.json())
  .then(data => {
    imagesData = data;
    //displayImages(imagesData);
    currentImages = [...imagesData];
    applySort();
  });


document.getElementById("sortBy").addEventListener("change", (e) => {
  currentSort = e.target.value;
  applySort();
});

document.getElementById("sortOrder").addEventListener("click", () => {
  currentOrder = currentOrder === "asc" ? "desc" : "asc";

  document.getElementById("sortOrder").textContent =
    currentOrder === "asc" ? "⬇" : "⬆";

  applySort();
});


// Fonction de trie
function applySort() {
  let sorted = [...currentImages];

  sorted.sort((a, b) => {
    let valA = a[currentSort];
    let valB = b[currentSort];

    // 🔢 TRI NUMÉRIQUE (ID)
    if (currentSort === "id") {
      valA = Number(valA);
      valB = Number(valB);

      return currentOrder === "asc"
        ? valA - valB
        : valB - valA;
    }

    // 📅 TRI DATE
    if (currentSort === "date") {
      valA = new Date(valA);
      valB = new Date(valB);

      return currentOrder === "asc"
        ? valA - valB
        : valB - valA;
    }

    // 🔠 TRI TEXTE (titre)
    valA = valA.toLowerCase();
    valB = valB.toLowerCase();

    return currentOrder === "asc"
      ? valA.localeCompare(valB, "fr", { numeric: true })
      : valB.localeCompare(valA, "fr", { numeric: true });
  });

  currentImages = sorted;
  currentPage = 1; //PAGINATION
  displayImages(sorted);
  updateActiveFilters(); // affiche Filtre Actuel 
}

//Barre de recherche : cherche dans tags, auteur, lieu, ...
document.getElementById("search").addEventListener("input", (e) => {
  currentPage = 1; //PAGINATION
  applyAll();
});


//Affichage Ligne ou Gallerie
document.getElementById("toggleView").addEventListener("click", () => {
  viewMode = viewMode === "grid" ? "list" : "grid";

  // Pagination différente selon le mode
  imagesPerPage = viewMode === "grid" ? 20 : 50;

  currentPage = 1;

  document.getElementById("toggleView").textContent =
    viewMode === "grid" ? "📄" : "🖼️";

  displayImages(currentImages);
});


//Afficher la galleried'image
function displayImages(images) {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  gallery.className = viewMode === "grid" ? "gallery-grid" : "gallery-list";

  const start = (currentPage - 1) * imagesPerPage;
  const end = start + imagesPerPage;
  const imagesToShow = images.slice(start, end);

  imagesToShow.forEach(img => {
    const item = document.createElement("div");

    if (viewMode === "grid") {
      item.className = "image-card";
      item.innerHTML = `
        <img src="images/thumbs/${img.nom}">
        <div class="image-info">
          <strong>${img.titre}</strong><br>
          ${img.tags.join(", ")}
        </div>
      `;
    } else {
      item.className = "image-row";
      item.innerHTML = `
        <strong>${img.titre}</strong>
        <span> — ${img.auteur} (${img.date})</span>
      `;
    }

    item.onclick = () => openPreview(img);
    gallery.appendChild(item);
  });

  renderPagination(images.length);
}



function openPreview(img) {
  const previewModal = document.getElementById("previewModal");
  const previewImg = document.getElementById("previewImg");
  const previewInfo = document.getElementById("previewInfo");

  previewImg.src = "images/full/" + img.nom;  // version full
  previewModal.style.display = "flex";

  //VISUALISATION ORIGINALE :
  document.getElementById("openStereo").onclick = () => {
  const stereoModal = document.getElementById("stereoModal");
  const stereoImg = document.getElementById("stereoImg");

  const baseName = img.nom.replace(/\.[^/.]+$/, "");
  stereoImg.src = "images/" + baseName + "." + img.format; // version originale
  stereoModal.style.display = "flex";
  };

  // INFO GROUPÉES
  previewInfo.innerHTML = `
    <div class="group">
      <h3>Identification</h3>
      <div class="row"><span>ID</span><span>${img.id}</span></div>
      <div class="row"><span>Nom</span><span>${img.nom}</span></div>
    </div>

    <div class="group">
      <h3>Contenu</h3>
      <div class="row"><span>Titre</span><span>${img.titre}</span></div>
      <div class="row"><span>Description</span><span>${img.description}</span></div>
      <div class="row"><span>Lieu</span><span>${img.lieu}</span></div>
    </div>

    <div class="group">
      <h3>Historique</h3>
      <div class="row"><span>Auteur</span><span>${img.auteur}</span></div>
      <div class="row"><span>Date</span><span>${img.date}</span></div>
    </div>

    <div class="group">
      <h3>Technique</h3>
      <div class="row"><span>Support</span><span>${img.support}</span></div>
      <div class="row"><span>Format</span><span>${img.format}</span></div>
      <div class="row"><span>Largeur</span><span>${img.largeur}</span></div>
      <div class="row"><span>Hauteur</span><span>${img.hauteur}</span></div>
    </div>

    <div class="group">
      <h3>Conservation</h3>
      <div class="row"><span>Date d'entrée</span><span>${img.date_entree}</span></div>
      <div class="row"><span>État de Conservation</span><span>${img.etat}</span></div>
      <div class="row"><span>Propriétaire</span><span>${img.proprietaire}</span></div>
      <div class="row"><span>Collection</span><span>${img.collection}</span></div>
      <div class="row"><span>Lieu de Stockage</span><span>${img.stockage}</span></div>
      <div class="row"><span>Diffusion</span><span>${img.diffusion}</span></div>
    </div>
  `;
}

document.getElementById("closePreview").onclick = () => {
  document.getElementById("previewModal").style.display = "none";
};

//Fermeture VISUALISATION OPTI :
const stereoModal = document.getElementById("stereoModal");

stereoModal.onclick = () => {
  stereoModal.style.display = "none";
};

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    stereoModal.style.display = "none";
  }
});


//CALENDRIER Filtre
const inputDate = document.getElementById("filterDateE");
const calendarBtn = document.getElementById("calendarBtn");

calendarBtn.addEventListener("click", () => {
  // On change temporairement le type pour forcer le calendrier natif
  inputDate.type = "date";
  inputDate.focus();

  // Quand on sort, on remet type=text pour garder le placeholder
  inputDate.addEventListener("blur", () => {
    inputDate.type = "text";
  }, { once: true });
});


const filterModal = document.getElementById("filterModal");
document.getElementById("openFilter").onclick = () => {filterModal.style.display = "flex";};
document.getElementById("closeFilter").onclick = () => {filterModal.style.display = "none";};
document.getElementById("resetFilter").onclick = () => {
  resetFilters(); // annule les filtres
  //applyAll();    // remet la galerie d'origine
};


function applyAll() {
  const query = document.getElementById("search").value.toLowerCase();

  // 1) On applique les filtres du modal
  let result = applyFilters(imagesData);

  // 2) On applique la recherche
  if (query) {
    result = result.filter(img =>
      img.tags.some(tag => tag.toLowerCase().includes(query)) ||
      img.auteur.toLowerCase().includes(query) ||
      img.date.toLowerCase().includes(query)||
      img.lieu.toLowerCase().includes(query) ||
      img.titre.toLowerCase().includes(query) ||
      img.description.toLowerCase().includes(query) ||
      img.support.toLowerCase().includes(query) ||
      img.type.toLowerCase().includes(query) ||
      img.format.toLowerCase().includes(query) ||
      String(img.largeur).includes(query) ||
      String(img.hauteur).includes(query) ||
      img.date_entree.toLowerCase().includes(query) ||
      img.etat.toLowerCase().includes(query) ||
      img.proprietaire.toLowerCase().includes(query) ||
      img.collection.toLowerCase().includes(query) ||
      img.stockage.toLowerCase().includes(query)||
      img.diffusion.toLowerCase().includes(query)
      
    );
  }

  currentPage = 1; //PAGINATION
  // 3) On applique le tri
  currentImages = result;
  applySort();
  updateActiveFilters(); // affiche Filtre Actuel 
}



function applyFilters(images) {
  return images.filter(img => {

    const checks = []; //Pour switch

    // Tags
    if (currentFilters.tags) {
      const tagsToCheck = currentFilters.tags
        .toLowerCase()
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);

      // On demande que toutes les tags existent dans l'image (ET)
      const hasAllTags = tagsToCheck.every(tag =>
        img.tags.some(t => t.toLowerCase() === tag)
      );

      if (!hasAllTags) return false;
    }

    // Auteur
    if (currentFilters.auteur) {
      if (!img.auteur.toLowerCase().includes(currentFilters.auteur.toLowerCase()))
        return false;
    }

    // Date
    if (currentFilters.date) {
        checks.push(img.date.toLowerCase().includes(currentFilters.date.toLowerCase()));
      /*if (!img.date.toLowerCase().includes(currentFilters.date.toLowerCase()))
        return false;*/
    }

    // Lieu
    if (currentFilters.lieu) {
        checks.push(img.lieu.toLowerCase().includes(currentFilters.lieu.toLowerCase()));
      /*if (!img.lieu.toLowerCase().includes(currentFilters.lieu.toLowerCase()))
        return false;*/
    }

    // Titre
    if (currentFilters.titre) {
      if (!img.titre.toLowerCase().includes(currentFilters.titre.toLowerCase()))
        return false;
    }

    // Description
    if (currentFilters.description) {
      if (!img.description.toLowerCase().includes(currentFilters.description.toLowerCase()))
        return false;
    }

    // Support
    if (currentFilters.support) {
      if (!img.support.toLowerCase().includes(currentFilters.support.toLowerCase()))
        return false;
    }

    // Type
    if (currentFilters.type) {
      if (!img.type.toLowerCase().includes(currentFilters.type.toLowerCase()))
        return false;
    }

    // Largeur
    if (currentFilters.largeur) {
        if (!String(img.largeur).includes(currentFilters.largeur))
            return false;
    }

    /*if (currentFilters.largeur) {
        if (Number(img.largeur) !== Number(currentFilters.largeur))
            return false;
    }*/

    // Hauteur
    if (currentFilters.hauteur) {
        if (!String(img.hauteur).includes(currentFilters.hauteur))
            return false;
    }

    // DateE
    if (currentFilters.date_entree) {
      if (!img.date_entree.toLowerCase().includes(currentFilters.date_entree.toLowerCase()))
        return false;
    }

    // Etat
    if (currentFilters.etat) {
      if (!img.etat.toLowerCase().includes(currentFilters.etat.toLowerCase()))
        return false;
    }

    // Proprietaire
    if (currentFilters.proprietaire) {
      if (!img.proprietaire.toLowerCase().includes(currentFilters.proprietaire.toLowerCase()))
        return false;
    }

    // Collection
    if (currentFilters.collection) {
        checks.push(img.collection.toLowerCase().includes(currentFilters.collection.toLowerCase()));
      /*if (!img.collection.toLowerCase().includes(currentFilters.collection.toLowerCase()))
        return false;*/
    }

    // Stockage
    if (currentFilters.stockage) {
      if (!img.stockage.toLowerCase().includes(currentFilters.stockage.toLowerCase()))
        return false;
    }

    // Diffusion
    if (currentFilters.diffusion) {
      if (!img.diffusion.toLowerCase().includes(currentFilters.diffusion.toLowerCase()))
        return false;
    }

    //return true;

    // Si aucun filtre n'est rempli : garder tout
    if (checks.length === 0) return true;

    // Mode ET ou OU
    return filterMode === "ET" ? checks.every(Boolean) : checks.some(Boolean);
    });
}

function resetFilters() {
  currentFilters = { tags: "", auteur: "", date: "", lieu: "", titre: "", description: "", support: "", type: "", largeur: "", hauteur: "", date_entree: "", etat: "", proprietaire: "", collection: "", stockage: "", diffusion: "" };
  document.getElementById("filterTags").value = "";
  document.getElementById("filterAuteur").value = "";
  document.getElementById("filterDate").value = "";
  document.getElementById("filterLieu").value = "";
  document.getElementById("filterTitre").value = "";
  document.getElementById("filterDescription").value = "";
  document.getElementById("filterSupport").value = "";
  document.getElementById("filterType").value = "";
  document.getElementById("filterLargeur").value = "";
  document.getElementById("filterHauteur").value = "";
  document.getElementById("filterDateE").value = "";
  document.getElementById("filterEtat").value = "";
  document.getElementById("filterProprietaire").value = "";
  document.getElementById("filterCollection").value = "";
  document.getElementById("filterStockage").value = "";
  document.getElementById("filterDiffusion").value = "";

  //Reset aussi le Bouton Switch ET-OU
  filterMode = "ET";
  toggleBtn.textContent = "ET";
  toggleBtn.className = "mode-on";
}


document.getElementById("filterForm").addEventListener("submit", (e) => {
  e.preventDefault();

  // On récupère les valeurs du formulaire
  currentFilters.tags = document.getElementById("filterTags").value.trim();
  currentFilters.auteur = document.getElementById("filterAuteur").value.trim();
  currentFilters.date = document.getElementById("filterDate").value.trim();
  currentFilters.lieu = document.getElementById("filterLieu").value.trim();
  currentFilters.titre = document.getElementById("filterTitre").value.trim();
  currentFilters.description = document.getElementById("filterDescription").value.trim();
  currentFilters.support = document.getElementById("filterSupport").value.trim();
  currentFilters.type = document.getElementById("filterType").value.trim();
  currentFilters.largeur = document.getElementById("filterLargeur").value.trim();
  currentFilters.hauteur = document.getElementById("filterHauteur").value.trim();
  currentFilters.date_entree = document.getElementById("filterDateE").value.trim();
  currentFilters.etat = document.getElementById("filterEtat").value.trim();
  currentFilters.proprietaire = document.getElementById("filterProprietaire").value.trim();
  currentFilters.collection = document.getElementById("filterCollection").value.trim();
  currentFilters.stockage = document.getElementById("filterStockage").value.trim();
  currentFilters.diffusion = document.getElementById("filterDiffusion").value.trim();

  filterModal.style.display = "none";
  applyAll();
});



// Filtre Actuel Affichage
function updateActiveFilters() {
  const container = document.getElementById("activeFilters");

  const filterParts = [];
  let searchPart = "";

  // 🎛️ Filtres du modal (ET / OU)
  Object.entries(currentFilters).forEach(([key, value]) => {
    if (value) {
      filterParts.push(`${key} = ${value}`);
    }
  });

  // 🔍 Recherche (TOUJOURS ET)
  const searchValue = document.getElementById("search").value.trim();
  if (searchValue) {
    searchPart = `recherche "${searchValue}"`;
  }

  // 🔢 Tri
  let sortPart = "";
  if (currentSort) {
    const orderLabel = currentOrder === "asc" ? "croissant" : "décroissant";
    sortPart = `Tri par ${currentSort}, ordre ${orderLabel}`;
  }

  // 🧾 Construction finale
  let text = "";

  if (filterParts.length) {
    text = filterParts.join(` ${filterMode} `);
  }

  if (searchPart) {
    text = text
      ? `${text} ET ${searchPart}`
      : searchPart;
  }

  if (sortPart) {
    text = text
      ? `${text} , ${sortPart}`
      : sortPart;
  }

  /*container.textContent =
    text
      ? `Filtres actifs : ${text}`
      : "Aucun filtre actif";*/

  document.getElementById("activeFiltersText").textContent =
  text
    ? `Filtres actifs : ${text}`
    : "Aucun filtre actif";

  updateFavoriteStar(); //Etoile Fav

}




//PAGINATION : 
function renderPagination(totalImages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(totalImages / imagesPerPage);

  // Bouton précédent
  const prev = document.createElement("button");
  prev.textContent = "◀";
  prev.disabled = currentPage === 1;
  prev.onclick = () => {
    currentPage--;
    displayImages(currentImages);
  };
  pagination.appendChild(prev);

  // Pages numérotées
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";

    btn.onclick = () => {
      currentPage = i;
      displayImages(currentImages);
    };

    pagination.appendChild(btn);
  }

  // Bouton suivant
  const next = document.createElement("button");
  next.textContent = "▶";
  next.disabled = currentPage === totalPages;
  next.onclick = () => {
    currentPage++;
    displayImages(currentImages);
  };
  pagination.appendChild(next);
}




//Favorite
function getCurrentState() {
  return {
    filters: { ...currentFilters },
    search: document.getElementById("search").value,
    sort: currentSort,
    order: currentOrder,
    mode: filterMode
  };
}

function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favs) {
  localStorage.setItem("favorites", JSON.stringify(favs));
}

/*document.getElementById("saveFavorite").addEventListener("click", () => {
  const favorites = getFavorites();
  const state = getCurrentState();

  favorites.push({
    id: Date.now(),
    label: document.getElementById("activeFiltersText").textContent,
    state
  });

  saveFavorites(favorites);
  renderFavorites();
});*/
document.getElementById("saveFavorite").addEventListener("click", () => {
  const match = getMatchingFavorite();

  if (match) {
    // ⭐ → ☆ (suppression)
    removeFavorite(match.id);
  } else {
    // ☆ → ⭐ (ajout)
    const favorites = getFavorites();
    // Texte complet
    const fullLabel = document.getElementById("activeFiltersText").textContent;
    // Version simplifiée : on supprime "Filtres actifs : "
    const shortLabel = fullLabel.replace(/^Filtres actifs :\s*/, "").replace(/,\s*ordre\s*/, " ").replace(/\s*=\s*/g, " : ").replace(/\spar\s+/gi, " : ");
    const formattedLabel = shortLabel.replace(/,\s*(Tri\s*:)/i, "\n$1") // saut de ligne avant "Tri"


    favorites.push({
      id: Date.now(),
      //label: document.getElementById("activeFiltersText").textContent,
      label: formattedLabel,
      state: getCurrentState()
    });

    saveFavorites(favorites);
    renderFavorites();
  }

  updateFavoriteStar();
});


function applyFavorite(fav) {
  currentFilters = { ...fav.state.filters };
  filterMode = fav.state.mode;
  currentSort = fav.state.sort;
  currentOrder = fav.state.order;

  document.getElementById("search").value = fav.state.search;
  document.getElementById("sortBy").value = currentSort;
  document.getElementById("sortOrder").textContent =
    currentOrder === "asc" ? "⬇" : "⬆";

  toggleBtn.textContent = filterMode;
  toggleBtn.className = filterMode === "ET" ? "mode-on" : "mode-off";

  applyAll();
}

/*
function renderFavorites() {
  const container = document.getElementById("favoritesList");
  container.innerHTML = "";

  const favorites = getFavorites();

  if (!favorites.length) {
    container.innerHTML = "<p>Aucun favori</p>";
    return;
  }

  favorites.forEach(fav => {
    const item = document.createElement("div");
    item.className = "favorite-item";

    const link = document.createElement("a");
    link.href = "#";
    link.textContent = fav.label;
    link.onclick = () => {
      applyFavorite(fav);
      closeSidebar();
    };

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "🗑️";
    removeBtn.title = "Supprimer ce favori";
    removeBtn.onclick = (e) => {
      e.stopPropagation(); // empêche l’application du filtre
      removeFavorite(fav.id);
    };

    item.appendChild(link);
    item.appendChild(removeBtn);
    container.appendChild(item);
  });
}*/
function renderFavorites() {
  const container = document.getElementById("favoritesList");
  container.innerHTML = "";

  const favorites = getFavorites();

  if (!favorites.length) {
    container.innerHTML = `<div class="fav-empty">Aucun favori</div>`;
    return;
  }

  favorites.forEach(fav => {
    const item = document.createElement("div");
    item.className = "fav-item";
    //const displayLabel = fav.label.replace(/\n/g, "<br>");
    let displayLabel = fav.label
  // retour à la ligne avant Tri
  .replace(/(\n)?(Tri\s*:)/i, "\n$2")
  // retour à la ligne après OU / ET
  .replace(/\s+(OU|ET)\s+/gi, "\n$1 ")
  // \n → <br>
  .replace(/\n/g, "<br>");

    item.innerHTML = `
      <div class="fav-main">
        <span class="fav-title" title="${fav.label}">
          ${displayLabel}
        </span>
      </div>
      <div class="fav-actions">
        <button class="fav-delete" title="Supprimer">🗑️</button>
      </div>
    `;

    item.querySelector(".fav-main").onclick = () => {
      applyFavorite(fav);
      closeSidebar();
    };

    item.querySelector(".fav-delete").onclick = (e) => {
      e.stopPropagation();
      removeFavorite(fav.id);
    };

    container.appendChild(item);
  });
}


function removeFavorite(id) {
  let favorites = getFavorites();
  favorites = favorites.filter(fav => fav.id !== id);
  saveFavorites(favorites);
  renderFavorites();

  updateFavoriteStar();
}

function isSameState(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function getMatchingFavorite() {
  const state = getCurrentState();
  const favorites = getFavorites();

  return favorites.find(fav =>
    isSameState(fav.state, state)
  );
}

//---------------------------------------------------------------
//Ouvrir et Fermer la liste de Filtres en Fav
const toggleFavoritesBtn = document.getElementById("toggleFavorites");
const favoritesWrapper = document.getElementById("favoritesWrapper");

toggleFavoritesBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const isHidden = favoritesWrapper.classList.toggle("hidden");

  toggleFavoritesBtn.textContent = isHidden
    ? "Filtres ▸"
    : "Filtres ▾";
});

//Fermer par défaut
favoritesWrapper.classList.add("hidden");
toggleFavoritesBtn.textContent = "Filtres ▸";

/*
//Ouvrir et Fermer la liste d'Image en Fav
const toggleFavoritesImgBtn = document.getElementById("toggleImgFavorites");
const favoritesImgWrapper = document.getElementById("favoritesImgWrapper");

toggleFavoritesImgBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const isHidden2 = favoritesImgWrapper.classList.toggle("hidden");

  toggleFavoritesImgBtn.textContent = isHidden2
    ? "Images ▸"
    : "Images ▾";
});

//Fermer par défaut
favoritesImgWrapper.classList.add("hidden");
toggleFavoritesImgBtn.textContent = "Images ▸";
*/
//---------------------------------------------------------------

function updateFavoriteStar() {
  const btn = document.getElementById("saveFavorite");
  const match = getMatchingFavorite();

  if (match) {
    btn.textContent = "⭐";
    btn.title = "Retirer des favoris";
    btn.classList.add("saved");
  } else {
    btn.textContent = "☆";
    btn.title = "Ajouter aux favoris";
    btn.classList.remove("saved");
  }
}

ondblclick => prompt("Nom du favori")

renderFavorites();

