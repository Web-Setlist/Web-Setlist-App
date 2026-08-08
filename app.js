let allPosts = [];
let filteredPosts = null;
let currentPage = 1;
let postsPerPage = 20;

let pinnedTitles = [];
let pinnedPosts = [];
let pinnedHeaderTitle = "";

/* ---------------- PINNED ---------------- */

async function loadPinned() {
  const t = await fetch("Posts/Pinned/pinned.txt").then(r => r.text());
  pinnedTitles = t
    .split(/\r?\n/)
    .map(x => x.trim())
    .filter(x => x !== "");

  const header = await fetch("Posts/Pinned/pinned title.txt").then(r => r.text());
  pinnedHeaderTitle = header.trim();
}

async function loadPosts() {
  const posts = await fetch("Posts/posts.json").then(r => r.json());
  allPosts = posts;

  pinnedPosts = pinnedTitles
    .map(title => allPosts.find(p => p.title === title))
    .filter(p => p);

  allPosts = allPosts.filter(p => !pinnedTitles.includes(p.title));
}

/* ---------------- INIT ---------------- */

async function init() {
  await loadPinned();
  await loadPosts();

  if (pinnedTitles.length === 0 || pinnedHeaderTitle === "") {
    document.getElementById("pinnedHeader").style.display = "none";
    document.getElementById("pinnedCards").style.display = "none";
  } else {
    renderPinnedHeader();
    renderPinnedCards(pinnedPosts);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const categoryFilter = urlParams.get("category");

  if (categoryFilter) {
    filterByCategory(categoryFilter);
  } else {
    filteredPosts = null;
    renderPage();
  }
}

init();

/* ---------------- CATEGORY FILTER ---------------- */

async function filterByCategory(cat) {
  const filtered = [];
  const target = cat.trim().toLowerCase();

  for (const post of allPosts) {
    let catPath = post.categories[0].trim();

    if (!catPath.startsWith(post.title)) {
      catPath = `${post.title}/Categories/categories.txt`;
    }

    const catFile = `Posts/${catPath}`;
    const txt = await fetch(catFile).then(r => r.text());
    const postCats = txt
      .split(/\r?\n/)
      .filter(x => x.trim() !== "")
      .map(x => x.trim().toLowerCase());

    if (postCats.includes(target)) {
      filtered.push(post);
    }
  }

  filteredPosts = filtered;
  currentPage = 1;
  renderPage();
}

/* ---------------- TXT READERS ---------------- */

async function readTxtList(path) {
  const res = await fetch(`Posts/${path}`);
  const text = await res.text();
  return text.split(/\r?\n/).filter(x => x.trim() !== "");
}

async function readTxtText(path) {
  const res = await fetch(`Posts/${path}`);
  return await res.text();
}

/* ---------------- TRUNCATION ---------------- */

function buildShortDesc(fullText) {
  let clean = fullText.replace(/\s+/g, " ").trim();

  const measure = document.createElement("div");
  measure.style.position = "absolute";
  measure.style.visibility = "hidden";

  // MATCH EXACT CSS WIDTH (350px card - 20px overlay padding left - 28px right)
  measure.style.width = "310px";

  measure.style.fontSize = "18px";
  measure.style.lineHeight = "1.7";
  measure.style.fontFamily = "Inter, sans-serif";
  measure.style.whiteSpace = "normal";

  document.body.appendChild(measure);

  // FIXED: ensure ellipsis stays inside overlay
  const maxHeight = 140;

  let words = clean.split(" ");
  let result = "";

  for (let i = 0; i < words.length; i++) {
    result += words[i] + " ";
    measure.textContent = result + "…";

    if (measure.offsetHeight > maxHeight) {
      document.body.removeChild(measure);
      return result.trim() + "…";
    }
  }

  document.body.removeChild(measure);
  return clean;
}

/* ---------------- PAGE RENDER ---------------- */

function renderPage() {
  const activeList = filteredPosts || allPosts;

  const start = (currentPage - 1) * postsPerPage;
  const end = start + postsPerPage;

  const pagePosts = activeList.slice(start, end);

  renderCards(pagePosts);

  document.getElementById("pageNumber").textContent = currentPage;
}

document.getElementById("nextPage").onclick = () => {
  const activeList = filteredPosts || allPosts;

  if (currentPage * postsPerPage < activeList.length) {
    currentPage++;
    renderPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

document.getElementById("prevPage").onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

/* ---------------- CARD RENDER ---------------- */

async function renderCards(posts) {
  const container = document.getElementById("postCards");
  container.innerHTML = "";

  for (const post of posts) {
    const coverList = await readTxtList(post.cover[0]);
    const randomCover = coverList[Math.floor(Math.random() * coverList.length)];

    const fullText = await readTxtText(post.text);
    const shortDesc = buildShortDesc(fullText);

    container.innerHTML += `
      <div class="post-card" onclick="openPost('${post.title}')">
        <img src="Posts/${post.title}/Post Cover/${randomCover}">
        <div class="post-card-overlay">
          <div class="post-card-title">${post.title}</div>
          <div class="post-card-desc">${shortDesc}</div>
        </div>
      </div>
    `;
  }
}

/* ---------------- PINNED ---------------- */

function renderPinnedHeader() {
  const header = document.getElementById("pinnedHeader");
  header.innerHTML = pinnedHeaderTitle;
}

async function renderPinnedCards(posts) {
  const container = document.getElementById("pinnedCards");
  container.innerHTML = "";

  for (const post of posts) {
    const coverList = await readTxtList(post.cover[0]);
    const randomCover = coverList[Math.floor(Math.random() * coverList.length)];

    const fullText = await readTxtText(post.text);
    const shortDesc = buildShortDesc(fullText);

    container.innerHTML += `
      <div class="post-card pinned" onclick="openPost('${post.title}')">
        <img src="Posts/${post.title}/Post Cover/${randomCover}">
        <div class="post-card-overlay">
          <div class="post-card-title">${post.title}</div>
          <div class="post-card-desc">${shortDesc}</div>
        </div>
      </div>
    `;
  }
}

/* ---------------- OPEN POST ---------------- */

function openPost(title) {
  window.location.href = `post.html?post=${encodeURIComponent(title)}`;
}
