// Initialisieren
const dropdownMenu = document.getElementById("dropdownMenu");
const itemList = document.getElementById("itemList");
const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");
const titelInput = document.getElementById("titel");
const infosInput = document.getElementById("infos");
const saveButton = document.getElementById("saveButton");
const newSceneButton = document.getElementById("newSceneButton");
const icons = document.getElementsByClassName("icon-svg");
const contextMenu = document.getElementById("contextMenu");
const deleteSceneButton = document.getElementById("deleteSceneButton");

let sceneData = JSON.parse(localStorage.getItem("sceneData")) || [];
let currentScene = { szenenName: "", szenenInfo: "", Objekte: [] };
let canvasObjects = [];
let activeIndex = null;

// Canvas skalieren
function resizeCanvas() {
  const width = Math.min(window.innerWidth - 400, 900);
  const height = 400;
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.scale(dpr, dpr);
  drawCanvas();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Icon hinzufügen
for (let icon of icons) {
  icon.addEventListener("click", () => {
    const objektName = icon.alt;
    canvasObjects.push({
      objektName,
      x: 100,
      y: 100,
      rotation: 0,
      scale: 1
    });
    activeIndex = canvasObjects.length - 1;
    updateItemList();
    drawCanvas();
  });
}

// Zeichnen
function drawCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvasObjects.forEach((obj, index) => {
    const img = new Image();
    img.src = `images/${obj.objektName}.svg`;
    img.onload = () => {
      const centerX = obj.x;
      const centerY = obj.y;
      const targetHeight = 50 * obj.scale;
      const ratio = img.width / img.height || 1;
      const targetWidth = targetHeight * ratio;

      context.save();
      context.translate(centerX, centerY);
      context.rotate((obj.rotation * Math.PI) / 180);
      context.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);

      if (index === activeIndex) {
        context.strokeStyle = "red";
        context.lineWidth = 2;
        context.strokeRect(-targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
      }

      context.restore();
    };
  });
}

// Liste aufbauen
function updateItemList() {
  itemList.innerHTML = "";
  canvasObjects.forEach((obj, index) => {
    const li = document.createElement("li");
    li.textContent = obj.objektName;
    li.classList.add("list-item");
    li.dataset.index = index;

    if (index === activeIndex) {
      li.style.backgroundColor = "#d2f0d2";
    }

    li.addEventListener("click", () => {
      activeIndex = index;
      updateItemList();
      drawCanvas();
    });

    const btn = document.createElement("button");
    btn.textContent = "X";
    btn.className = "delete-btn";
    btn.addEventListener("click", () => {
      canvasObjects.splice(index, 1);
      if (activeIndex === index) activeIndex = null;
      updateItemList();
      drawCanvas();
    });

    li.appendChild(btn);
    itemList.appendChild(li);
  });
}

// Szene speichern
saveButton.addEventListener("click", () => {
  const name = titelInput.value.trim();
  if (!name) {
    showMessage("Bitte einen Szenennamen eingeben!");
    return;
  }

  const newScene = {
    szenenName: name,
    szenenInfo: infosInput.value,
    Objekte: canvasObjects.map(obj => ({
      objektName: obj.objektName,
      x: obj.x,
      y: obj.y,
      scale: obj.scale,
      rotation: obj.rotation
    }))
  };

  const index = sceneData.findIndex(scene => scene.szenenName === name);
  if (index >= 0) {
    sceneData[index] = newScene;
    showMessage("Szene überschrieben.");
  } else {
    sceneData.push(newScene);
    dropdownMenu.innerHTML += `<li><a href="#" class="scene-link">${name}</a></li>`;
    addSceneLinkFunctionality();
    showMessage("Szene gespeichert!");
  }

  currentScene = newScene;
  localStorage.setItem("sceneData", JSON.stringify(sceneData));
});

// Neue Szene
newSceneButton.addEventListener("click", () => {
  currentScene = { szenenName: "", szenenInfo: "", Objekte: [] };
  titelInput.value = "";
  infosInput.value = "";
  canvasObjects = [];
  activeIndex = null;
  updateItemList();
  drawCanvas();
});

// Szene-Liste klicken
function addSceneLinkFunctionality() {
  const sceneLinks = document.querySelectorAll(".scene-link");
  sceneLinks.forEach((link, index) => {
    link.addEventListener("click", () => {
      const scene = sceneData[index];
      currentScene = scene;
      titelInput.value = scene.szenenName;
      infosInput.value = scene.szenenInfo;
      canvasObjects = scene.Objekte.map(obj => ({
        objektName: obj.objektName,
        x: obj.x,
        y: obj.y,
        scale: obj.scale || 1,
        rotation: obj.rotation || 0
      }));
      activeIndex = null;
      updateItemList();
      drawCanvas();
    });
  });
}

// Szene-Liste beim Start laden
function loadScenes() {
  dropdownMenu.innerHTML = "";
  sceneData.forEach(scene => {
    dropdownMenu.innerHTML += `<li><a href="#" class="scene-link">${scene.szenenName}</a></li>`;
  });
  addSceneLinkFunctionality();
}
loadScenes();

// Drag & Drop
let dragTarget = null;
let offsetX, offsetY;

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  for (let i = canvasObjects.length - 1; i >= 0; i--) {
    const obj = canvasObjects[i];
    const centerX = obj.x;
    const centerY = obj.y;
    const targetHeight = 50 * obj.scale;
    const ratio = 1; // Annahme: gleichmäßig
    const targetWidth = targetHeight * ratio;

    const left = centerX - targetWidth / 2;
    const right = centerX + targetWidth / 2;
    const top = centerY - targetHeight / 2;
    const bottom = centerY + targetHeight / 2;

    if (mx >= left && mx <= right && my >= top && my <= bottom) {
      dragTarget = obj;
      activeIndex = i;
      offsetX = mx - obj.x;
      offsetY = my - obj.y;
      updateItemList();
      drawCanvas();
      return;
    }
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (dragTarget) {
    const rect = canvas.getBoundingClientRect();
    dragTarget.x = e.clientX - rect.left - offsetX;
    dragTarget.y = e.clientY - rect.top - offsetY;
    drawCanvas();
  }
});

canvas.addEventListener("mouseup", () => {
  dragTarget = null;
});

// Szenen löschen per Kontextmenü
let contextTargetIndex = null;
dropdownMenu.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  const target = e.target;
  if (target.classList.contains("scene-link")) {
    const links = Array.from(document.querySelectorAll(".scene-link"));
    contextTargetIndex = links.indexOf(target);
    contextMenu.style.top = `${e.pageY}px`;
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.display = "block";
  } else {
    contextMenu.style.display = "none";
  }
});

deleteSceneButton.addEventListener("click", () => {
  if (contextTargetIndex !== null) {
    sceneData.splice(contextTargetIndex, 1);
    localStorage.setItem("sceneData", JSON.stringify(sceneData));
    loadScenes();
    contextMenu.style.display = "none";
    showMessage("Szene gelöscht!");
  }
});

document.addEventListener("click", () => {
  contextMenu.style.display = "none";
});

// Tastatursteuerung: w/s (Skalierung), a/d (Rotation)
document.addEventListener("keydown", (e) => {
  if (activeIndex === null) return;
  const obj = canvasObjects[activeIndex];

  if (e.key === "w") obj.scale += 0.1;
  if (e.key === "s") obj.scale = Math.max(0.1, obj.scale - 0.1);
  if (e.key === "a") obj.rotation -= 5;
  if (e.key === "d") obj.rotation += 5;

  drawCanvas();
});

// Feedback-Nachricht
function showMessage(msg) {
  let box = document.createElement("div");
  box.innerText = msg;
  box.style.position = "fixed";
  box.style.bottom = "20px";
  box.style.left = "50%";
  box.style.transform = "translateX(-50%)";
  box.style.backgroundColor = "#4CAF50";
  box.style.color = "white";
  box.style.padding = "10px 20px";
  box.style.borderRadius = "5px";
  box.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
  box.style.zIndex = 9999;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2000);
}
