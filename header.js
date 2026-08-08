/* ============================================================
   LOAD CATEGORY LIST
   ============================================================ */
let allCategories = [];

fetch("Categories/categories.txt")
  .then(res => res.text())
  .then(text => {
    allCategories = text
      .split(/\r?\n/)
      .map(x => x.trim())
      .filter(x => x !== "");

    loadCategoriesMenu();
  });

/* ============================================================
   BUILD DROPDOWN MENU
   ============================================================ */
function loadCategoriesMenu() {
  const menu = document.getElementById("genresMenu");
  if (!menu) return;

  menu.innerHTML = allCategories
    .map(cat => `<a onclick="filterByCategory('${cat}')">${cat}</a>`)
    .join("");
}

/* ============================================================
   MENU TOGGLE
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const genresBtn = document.getElementById("genresBtn");
  const genresMenu = document.getElementById("genresMenu");

  if (!genresBtn || !genresMenu) return;

  // Toggle menu
  genresBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    genresMenu.style.display =
      genresMenu.style.display === "block" ? "none" : "block";
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    const insideMenu = genresMenu.contains(e.target);
    const clickedBtn = genresBtn.contains(e.target);

    if (!insideMenu && !clickedBtn) {
      genresMenu.style.display = "none";
    }
  });
});

/* ============================================================
   CATEGORY
   ============================================================ */
function filterByCategory(cat) {
  window.location.href = `index.html?category=${encodeURIComponent(cat)}`;
}
