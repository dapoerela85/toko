document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search");
    const searchStatus = document.getElementById("searchStatus");
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get("q") || "";
    const sortBtn = document.getElementById("sortBtn");
    const productList = document.getElementById("productList");
    const favoritesList = document.getElementById("favoritesList");
    const clearFavoritesBtn = document.getElementById("clearFavoritesBtn");
    const gridViewBtn = document.getElementById("gridViewBtn");
    const listViewBtn = document.getElementById("listViewBtn");
    const categoryFilter = urlParams.get("category");
    
    let sortAscending = localStorage.getItem("sortOrder") !== "desc";
    let viewMode = localStorage.getItem("viewMode") || "grid";
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    let currentPage = 1;
    const itemsPerPage = 3;

    // ✅ Set search input value on page load
    searchInput.value = searchQuery;
    filterProducts();

    function updateMetaTitle() {
        document.title = categoryFilter ? `Products in ${categoryFilter} - Dapoer Ela 85` : "Dapoer Ela 85";
    }

    function filterProducts() {
        let searchQuery = searchInput.value.trim().toLowerCase();
        let products = document.querySelectorAll(".product");
        let resultCount = 0;

        products.forEach(product => {
            let name = product.getAttribute("data-name").toLowerCase();
            let category = product.getAttribute("data-category");

            let matchesSearch = name.includes(searchQuery);
            let matchesCategory = categoryFilter ? category === categoryFilter : true;

            if (matchesSearch && matchesCategory) {
                product.style.display = "block";
                resultCount++;
            } else {
                product.style.display = "none";
            }
        });

        // ✅ Update URL dynamically
        let url = new URL(window.location);
        if (searchQuery) {
            url.searchParams.set("q", searchQuery);
        } else {
            url.searchParams.delete("q");
        }
        window.history.replaceState({}, "", url);

        // ✅ Display search result status
        searchStatus.innerHTML = searchQuery
            ? `You searched for "<b>${searchQuery}</b>" and found <b>${resultCount}</b> results.`
            : "Showing all products.";

        updateMetaTitle();
    }

    function sortProducts() {
        let productsArray = Array.from(document.querySelectorAll(".card.h-100"));
        productsArray.sort((a, b) => {
            let priceA = parseInt(a.getAttribute("data-price"));
            let priceB = parseInt(b.getAttribute("data-price"));
            return sortAscending ? priceA - priceB : priceB - priceA;
        });

        productsArray.forEach(product => productList.appendChild(product.parentElement));

        sortBtn.innerHTML = sortAscending
            ? '<i class="bi bi-sort-up"></i> Harga Tertinggi'
            : '<i class="bi bi-sort-down"></i> Harga Terendah';

        filterProducts();
    }

    function toggleFavorite(slug, name, price, image) {
        let index = favorites.findIndex(item => item.slug === slug);
        
        if (index === -1) {
            favorites.push({ slug, name, price, image });
        } else {
            favorites.splice(index, 1);
        }

        localStorage.setItem("favorites", JSON.stringify(favorites));
        renderFavorites();
        updateFavoriteIcons();
    }

    function updateFavoriteIcons() {
        document.querySelectorAll(".favorite-btn").forEach(btn => {
            let slug = btn.getAttribute("data-slug");
            let icon = btn.querySelector("i");

            if (favorites.some(item => item.slug === slug)) {
                btn.classList.remove("btn-primary");
                btn.classList.add("btn-danger");
                icon.classList.remove("bi-heart");
                icon.classList.add("bi-heart-fill");
            } else {
                btn.classList.remove("btn-danger");
                btn.classList.add("btn-primary");
                icon.classList.remove("bi-heart-fill");
                icon.classList.add("bi-heart");
            }
        });
    }

    function renderFavorites() {
        favoritesList.innerHTML = "";
        let searchQuery = document.getElementById("favoriteSearch").value.toLowerCase();

        if (favorites.length === 0) {
            favoritesList.innerHTML = "<p>No favorites added.</p>";
            document.getElementById("totalFavoritesPrice").textContent = "0";
            document.getElementById("favoritesPagination").style.display = "none";
            return;
        }

        document.getElementById("favoritesPagination").style.display = "flex";

        let filteredFavorites = favorites.filter(product => 
            product.name.toLowerCase().includes(searchQuery)
        );

        // ✅ Calculate total price only for visible favorites
        let totalPrice = filteredFavorites.reduce((sum, product) => sum + product.price, 0);
        document.getElementById("totalFavoritesPrice").textContent = totalPrice.toLocaleString();

        let totalPages = Math.ceil(filteredFavorites.length / itemsPerPage);
        if (currentPage > totalPages) currentPage = totalPages || 1;

        let start = (currentPage - 1) * itemsPerPage;
        let end = start + itemsPerPage;
        let paginatedFavorites = filteredFavorites.slice(start, end);

        if (paginatedFavorites.length === 0 && currentPage > 1) {
            currentPage--;
            return renderFavorites();
        }

        paginatedFavorites.forEach(product => {
            let li = document.createElement("li");
            li.innerHTML = `
              <div class="ms-2 me-auto">
                <img src="${product.image}" alt="${product.name}" width="50">
                <div class="fw-bold">${product.name}</div>
                <div class="d-flex justify-content-between">
                  <p>IDR ${product.price.toLocaleString()}</p>
                  <button class="remove-favorite btn btn-sm btn-danger" data-slug="${product.slug}">
                    <i class="bi bi-x-square-fill"></i>
                  </button>
                </div>
              </div>
            `;
            favoritesList.appendChild(li);
        });

        document.getElementById("currentPageIndicator").textContent = `Page ${currentPage} of ${totalPages || 1}`;
        document.getElementById("prevPageBtn").disabled = currentPage === 1;
        document.getElementById("nextPageBtn").disabled = currentPage >= totalPages;

        document.querySelectorAll(".remove-favorite").forEach(btn => {
            btn.addEventListener("click", function () {
                let slug = this.getAttribute("data-slug");
                favorites = favorites.filter(item => item.slug !== slug);
                localStorage.setItem("favorites", JSON.stringify(favorites));
                renderFavorites();
                updateFavoriteIcons();
            });
        });
    }

    document.getElementById("favoriteSearch").addEventListener("input", function () {
        currentPage = 1;
        renderFavorites();
    });

    document.getElementById("prevPageBtn").addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;
            renderFavorites();
        }
    });

    document.getElementById("nextPageBtn").addEventListener("click", function () {
        if (currentPage * itemsPerPage < favorites.length) {
            currentPage++;
            renderFavorites();
        }
    });

    clearFavoritesBtn.addEventListener("click", function () {
        favorites = [];
        localStorage.removeItem("favorites");
        renderFavorites();
        updateFavoriteIcons();
    });

    sortBtn.addEventListener("click", function () {
        sortAscending = !sortAscending;
        localStorage.setItem("sortOrder", sortAscending ? "asc" : "desc");
        sortProducts();
    });

    searchInput.addEventListener("input", filterProducts);

    gridViewBtn.addEventListener("click", function () {
        viewMode = "grid";
        localStorage.setItem("viewMode", viewMode);
        updateView();
    });

    listViewBtn.addEventListener("click", function () {
        viewMode = "list";
        localStorage.setItem("viewMode", viewMode);
        updateView();
    });

    sortProducts();
    renderFavorites();
    updateFavoriteIcons();
});
