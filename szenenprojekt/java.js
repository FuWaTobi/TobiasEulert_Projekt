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
const sidebarNewScene = document.getElementById("sidebarNewScene");

let sceneData = JSON.parse(localStorage.getItem("sceneData")) || [];
let currentScene = { szenenName: "", szenenInfo: "", Objekte: [] };
let canvasObjects = [];
let activeIndex = null;


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

  console.log("Debug Szene wird gespeichert:", newScene);
  saveToServer(newScene);


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
});

newSceneButton.addEventListener("click", () => {
  currentScene = { szenenName: "", szenenInfo: "", Objekte: [] };
  titelInput.value = "";
  infosInput.value = "";
  canvasObjects = [];
  activeIndex = null;
  updateItemList();
  drawCanvas();
});

if (sidebarNewScene) {
  sidebarNewScene.addEventListener("click", (e) => {
    e.preventDefault();
    currentScene = { szenenName: "", szenenInfo: "", Objekte: [] };
    titelInput.value = "";
    infosInput.value = "";
    canvasObjects = [];
    activeIndex = null;
    updateItemList();
    drawCanvas();
  });
}

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



// Drag & Drop KI
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
    const ratio = 1; 
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
// Drag & Drop Ende KI

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

deleteSceneButton.addEventListener("click", async () => {
  if (contextTargetIndex !== null) {
    const sceneName = sceneData[contextTargetIndex].szenenName;
    await deleteSceneFromServer(sceneName);
    await loadScenesFromServer();
    contextMenu.style.display = "none";
    showMessage(`Szene "${sceneName}" gelöscht!`);
  }
});


document.addEventListener("click", () => {
  contextMenu.style.display = "none";
});


document.addEventListener("keydown", (e) => {
  if (activeIndex === null) return;
  const obj = canvasObjects[activeIndex];

  if (e.key === "w") obj.scale += 0.1;
  if (e.key === "s") obj.scale = Math.max(0.1, obj.scale - 0.1);
  if (e.key === "a") obj.rotation -= 5;
  if (e.key === "d") obj.rotation += 5;

  drawCanvas();
});


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


// Export to PDF KI
const exportScenesLink = document.getElementById("exportScenesLink");
exportScenesLink.addEventListener("click", async (e) => {
  e.preventDefault();
  await exportToPDF();
});


async function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageHeight = pdf.internal.pageSize.height;
  const margin = 10;
  const rowHeight = 60;
  let y = margin;

  const widths = {
    szene: 20,
    bild: 70,
    info: 50,
    liste: 40
  };

 
  pdf.setFontSize(10);
  pdf.setFont(undefined, "bold");
  pdf.text("Szene", margin + 2, y + 5);
  pdf.text("Bild", margin + widths.szene + 2, y + 5);
  pdf.text("Info", margin + widths.szene + widths.bild + 2, y + 5);
  pdf.text("Elemente", margin + widths.szene + widths.bild + widths.info + 2, y + 5);
  pdf.setFont(undefined, "normal");
  y += 8;

  for (let i = 0; i < sceneData.length; i++) {
    const scene = sceneData[i];

    
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 300;
    exportCanvas.height = 200;
    const ctx = exportCanvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    const scaleFactor = 0.3;

    for (const obj of scene.Objekte) {
      const img = new Image();
      img.src = `images/${obj.objektName}.svg`;

      await new Promise(resolve => {
        img.onload = () => {
          const x = obj.x * scaleFactor;
          const y = obj.y * scaleFactor;
          const scale = (obj.scale || 1) * scaleFactor;
          const rotation = (obj.rotation || 0) * Math.PI / 180;
          const size = 50 * scale;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rotation);
          ctx.drawImage(img, -size / 2, -size / 2, size, size);
          ctx.restore();
          resolve();
        };
      });
    }

    const imgData = exportCanvas.toDataURL("image/png");

   
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);

    const cols = [widths.szene, widths.bild, widths.info, widths.liste];
    let colX = margin;
    for (const colWidth of cols) {
      pdf.rect(colX, y, colWidth, rowHeight);
      colX += colWidth;
    }

    
    pdf.setFontSize(10);
    pdf.text(`${i + 1}`, margin + 2, y + 6);

    pdf.addImage(imgData, "PNG", margin + widths.szene + 2, y + 2, widths.bild - 4, rowHeight - 4);

    const infoText = pdf.splitTextToSize(scene.szenenInfo || "-", widths.info - 4);
    pdf.setFontSize(8);
    pdf.text(infoText, margin + widths.szene + widths.bild + 2, y + 6);

    const elemente = scene.Objekte.map(o => `- ${o.objektName}`);
    const listeText = pdf.splitTextToSize(elemente.join("\n"), widths.liste - 4);
    pdf.text(listeText, margin + widths.szene + widths.bild + widths.info + 2, y + 6);

    y += rowHeight;

    if (y + rowHeight > pageHeight - margin) {
      pdf.addPage();
      y = margin;

      pdf.setFont(undefined, "bold");
      pdf.text("Szene", margin + 2, y + 5);
      pdf.text("Bild", margin + widths.szene + 2, y + 5);
      pdf.text("Info", margin + widths.szene + widths.bild + 2, y + 5);
      pdf.text("Elemente", margin + widths.szene + widths.bild + widths.info + 2, y + 5);
      pdf.setFont(undefined, "normal");
      y += 8;
    }
  }

  pdf.save("szenen-export.pdf");
}
// Export to PDF Ende K

// Fetch API in KLausur!!!!


async function saveToServer(scene) {
  const response = await fetch('http://localhost/szenenprojekt/save.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(scene)
  });

  const result = await response.json();
  console.log("Serverantwort:", result);
}



async function loadScenesFromServer() {
  const response = await fetch('http://localhost/szenenprojekt/load.php');
  const scenes = await response.json();

  dropdownMenu.innerHTML = "";
  sceneData = scenes.map(scene => ({
    szenenName: scene.name,
    szenenInfo: scene.info,
    Objekte: JSON.parse(scene.objekte)
  }));

  sceneData.forEach(scene => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#";
    link.className = "scene-link";
    link.textContent = scene.szenenName;
    li.appendChild(link);
    dropdownMenu.appendChild(li);
  });

  addSceneLinkFunctionality();
}

loadScenesFromServer();

async function deleteSceneFromServer(name) {
  const response = await fetch('http://localhost/szenenprojekt/delete.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ szenenName: name })
  });
  const result = await response.json();
  console.log("Löschantwort:", result);
}

console.log("Hallo XAMPP!");