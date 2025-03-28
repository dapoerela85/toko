document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search");
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

    function updateMetaTitle() {
        document.title = categoryFilter
            ? `Products in ${categoryFilter} - Dapoer Ela 85`
            : "Dapoer Ela 85";
    }

    function filterProducts() {
        let searchQuery = searchInput.value.toLowerCase();
        let products = document.querySelectorAll(".product");

        products.forEach(product => {
            let name = product.getAttribute("data-name").toLowerCase();
            let category = product.getAttribute("data-category");

            let matchesSearch = name.includes(searchQuery);
            let matchesCategory = categoryFilter ? category === categoryFilter : true;

            product.style.display = matchesSearch && matchesCategory ? "block" : "none";
        });

        updateMetaTitle();
    }

    function sortProducts() {
        let productsArray = Array.from(document.querySelectorAll(".product"));

        productsArray.sort((a, b) => {
            let priceA = parseInt(a.getAttribute("data-price"));
            let priceB = parseInt(b.getAttribute("data-price"));
            return sortAscending ? priceA - priceB : priceB - priceA;
        });

        productList.innerHTML = "";
        productsArray.forEach(product => productList.appendChild(product));

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
        if (!favoritesList) return;

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

        let totalPrice = filteredFavorites.reduce((sum, product) => sum + product.price, 0);
        document.getElementById("totalFavoritesPrice").textContent = totalPrice.toLocaleString();

        let totalPages = Math.ceil(filteredFavorites.length / itemsPerPage);
        if (currentPage > totalPages) currentPage = totalPages || 1;

        let start = (currentPage - 1) * itemsPerPage;
        let end = start + itemsPerPage;
        let paginatedFavorites = filteredFavorites.slice(start, end);

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
        if (currentPage < Math.ceil(favorites.length / itemsPerPage)) {
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
    sortProducts();
    renderFavorites();
    updateFavoriteIcons();
});