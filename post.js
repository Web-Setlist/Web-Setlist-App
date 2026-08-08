const urlParams = new URLSearchParams(window.location.search);
const postTitle = urlParams.get("post");

document.getElementById("postTitle").textContent = postTitle;
document.getElementById("post-title").textContent = postTitle;

fetch("Posts/posts.json")
  .then(res => res.json())
  .then(posts => {
    const post = posts.find(p => p.title === postTitle);
    loadPost(post);
  });

async function readTxtList(path) {
  const res = await fetch(`Posts/${path}`);
  const text = await res.text();
  return text.split(/\r?\n/).filter(x => x.trim() !== "");
}

async function readTxtText(path) {
  const res = await fetch(`Posts/${path}`);
  return await res.text();
}

function truncatePostText(fullText) {
  const measure = document.createElement("div");
  measure.style.position = "absolute";
  measure.style.visibility = "hidden";
  measure.style.width = "600px";   // wider than card
  measure.style.fontSize = "18px";
  measure.style.lineHeight = "1.7";
  measure.style.fontFamily = "Inter, sans-serif";
  measure.style.whiteSpace = "normal";
  measure.style.boxSizing = "border-box";
  measure.style.padding = "0";

  document.body.appendChild(measure);

  const maxHeight = 18 * 1.7 * 12; // allow ~12 lines on post page

  let words = fullText.split(" ");
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
  return fullText;
}

async function loadPost(post) {

  const rawText = await readTxtText(post.text);
  const textLines = rawText.split(/\r?\n/).filter(x => x.trim() !== "");

  const textContainer = document.getElementById("post-text");

  if (textLines.length === 0) {
    textContainer.remove();
  } else {
    textContainer.classList.add("web-setlist-panel");

    /* ⭐ APPLY TRUNCATION HERE */
    const combined = textLines.join(" ");
    const truncated = truncatePostText(combined);

    textContainer.innerHTML = `<p>${truncated}</p>`;
  }

  const imageList = await readTxtList(post.images[0]);
  const imgContainer = document.getElementById("post-images");

  if (imageList.length === 0) {
    imgContainer.remove();
  } else {
    imgContainer.classList.add("web-setlist-panel");

    imageList.forEach((img, index) => {
      const fullPath = `Posts/${post.title}/Images/${img}`;
      imgContainer.innerHTML += `<img src="${fullPath}" data-index="${index}">`;
    });

    const overlay = document.getElementById("image-overlay");
    const overlayImg = document.getElementById("overlay-img");
    let currentIndex = 0;

    function loadOverlayImage(index) {
      const fullPath = `Posts/${post.title}/Images/${imageList[index]}`;

      overlayImg.onload = () => {
        overlayImg.style.maxWidth = "none";
        overlayImg.style.maxHeight = "none";

        const naturalW = overlayImg.naturalWidth;
        const naturalH = overlayImg.naturalHeight;

        const screenW = window.innerWidth * 0.90;
        const screenH = window.innerHeight * 0.90;

        const scale = Math.min(screenW / naturalW, screenH / naturalH, 1);

        overlayImg.style.width = naturalW * scale + "px";
        overlayImg.style.height = naturalH * scale + "px";

        overlay.style.display = "flex";
      };

      overlayImg.src = fullPath;
    }

    imgContainer.addEventListener("click", e => {
      if (e.target.tagName === "IMG") {
        currentIndex = parseInt(e.target.dataset.index);
        loadOverlayImage(currentIndex);
      }
    });

    document.getElementById("overlay-close").onclick = () => {
      overlay.style.display = "none";
    };

    document.getElementById("overlay-prev").onclick = () => {
      currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
      loadOverlayImage(currentIndex);
    };

    document.getElementById("overlay-next").onclick = () => {
      currentIndex = (currentIndex + 1) % imageList.length;
      loadOverlayImage(currentIndex);
    };
  }

  const embedLines = await readTxtList(post["videos embed"][0]);
  const localVideos = await readTxtList(post["videos local"][0]);

  const embedContainer = document.getElementById("video-embeds");
  const localContainer = document.getElementById("video-local");

  const hasVideos = embedLines.length > 0 || localVideos.length > 0;

  if (!hasVideos) {
    embedContainer.remove();
    localContainer.remove();
  } else {

    if (embedLines.length > 0) {
      embedContainer.classList.add("web-setlist-panel");
      embedLines.forEach(line => embedContainer.innerHTML += line);
    } else {
      embedContainer.remove();
    }

    if (localVideos.length > 0) {
      localContainer.classList.add("web-setlist-panel");
      localVideos.forEach(v => {
        localContainer.innerHTML += `
          <video controls>
            <source src="Posts/${post.title}/Video Embed/${v}" type="video/mp4">
          </video>
        `;
      });
    } else {
      localContainer.remove();
    }
  }

  const titleText = (await readTxtText(post["attachments title"])).trim();
  const descText = (await readTxtText(post["attachments description"])).trim();

  const localFiles = await readTxtList(post["attachments local"][0]);
  const localTitles = await readTxtList(post["attachments local title"]);

  const externalLinks = await readTxtList(post["attachments link"][0]);
  const externalTitles = await readTxtList(post["attachments link title"]);

  const attachContainer = document.getElementById("attachments");

  const hasAttachmentContent =
    titleText ||
    descText ||
    localFiles.length > 0 ||
    externalLinks.length > 0;

  if (!hasAttachmentContent) {
    attachContainer.remove();
    return;
  }

  let panel = document.createElement("div");
  panel.className = "web-setlist-panel";

  if (titleText) {
    panel.innerHTML += `<h2 class="section-title">${titleText}</h2>`;
  }

  if (descText) {
    panel.innerHTML += `<p class="attachments-description">${descText}</p>`;
  }

  localFiles.forEach((file, index) => {
    const btnText = localTitles[index] || "Download";
    panel.innerHTML += `
      <a href="Posts/${post.title}/Attachments/${file}" download>${btnText}</a>
    `;
  });

  externalLinks.forEach((url, index) => {
    const btnText = externalTitles[index] || "Download";
    panel.innerHTML += `
      <a href="${url}" target="_blank">${btnText}</a>
    `;
  });

  attachContainer.appendChild(panel);
}
