const startBtn = document.getElementById("startBtn");
const gameArea = document.getElementById("gameArea");
const sketchGrid = document.getElementById("sketchGrid");
const patternPalette = document.getElementById("patternPalette");
const probeCounterElm = document.getElementById("probeCounter");
const probeResultElm = document.getElementById("probeResultText");
const showRulesBtn = document.getElementById("showRulesBtn");
const closeRulesBtn = document.getElementById("closeRulesBtn");
const rulesModal = document.getElementById("rulesModal");

let selectedPattern = 0;
let probeCount = 0;
const usedProbes = new Set();
let computerMap = []; // 4x5 grid
let patternCounts = [0, 0, 0, 0, 0]; // index 1–4 used

startBtn.addEventListener("click", () => {
  startBtn.classList.add("hidden");
  gameArea.classList.remove("hidden");

  probeCount = 0;
  usedProbes.clear();
  updateProbeCounter();

  generateComputerMap();
  drawSketchBoard();
});

showRulesBtn.addEventListener("click", () => {
  rulesModal.classList.remove("hidden");
});

closeRulesBtn.addEventListener("click", () => {
  rulesModal.classList.add("hidden");
});

patternPalette.querySelectorAll(".pattern").forEach(pat => {
  pat.addEventListener("click", () => {
    selectedPattern = parseInt(pat.dataset.pattern);
    patternPalette.querySelectorAll(".pattern").forEach(p => p.classList.remove("selected"));
    pat.classList.add("selected");
  });
});
document.querySelectorAll('.pattern-box').forEach(box => {
  box.addEventListener('click', () => {
    selectedPattern = parseInt(box.dataset.pattern);

    document.querySelectorAll('.pattern-box').forEach(b => b.classList.remove('active-pattern'));
    box.classList.add('active-pattern');
  });
});

function drawSketchBoard() {
  sketchGrid.innerHTML = '';
  const rows = 4, cols = 5;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.className = "sketch-cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.dataset.pattern = 0;

      cell.addEventListener("click", () => {
        // Remove old pattern class
        for (let i = 1; i <= 4; i++) cell.classList.remove(`cell-pattern-${i}`);
        // Set new pattern
        if (selectedPattern > 0) {
          cell.dataset.pattern = selectedPattern;
          cell.classList.add(`cell-pattern-${selectedPattern}`);
        }
      });

      sketchGrid.appendChild(cell);
    }
  }

  // Draw probe dots
  // Draw probe dots only at internal intersections (excluding outer corners)
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 4; c++) {
    const dot = document.createElement("div");
    dot.className = "probe-dot";

    const cellSize = 60, gap = 6;
    const step = cellSize + gap;
    dot.style.left = `${(c + 1) * step}px`;
    dot.style.top = `${(r + 1) * step}px`;

    dot.dataset.key = `${r},${c}`;
    dot.title = `Probe (${r + 1},${c + 1})`;

    dot.addEventListener("click", () => probe(r, c));
    sketchGrid.appendChild(dot);
  }
}

}

function updateProbeCounter() {
  probeCounterElm.textContent = `Probes Used: ${probeCount} / 12`;
}

function probe(row, col) {
  const key = `${row},${col}`;
  if (!usedProbes.has(key)) {
    usedProbes.add(key);
    probeCount++;
    updateProbeCounter();
  }

  let resultHTML = `Probe (${row + 1},${col + 1}): Found pattern(s): `;

  for (let r = row; r < row + 2; r++) {
    for (let c = col; c < col + 2; c++) {
      const regionId = computerMap[r][c];
      resultHTML += `<span class="found-pattern pattern-${regionId}"></span> `;
    }
  }

  probeResultElm.innerHTML = resultHTML.trim();
}


function generateComputerMap() {
  const rows = 4, cols = 5;
  computerMap = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let id = 1; id <= 4; id++) placeRegion(id);
}

function placeRegion(regionId) {
    const rows = 4, cols = 5;
    let attempts = 0;
    while (attempts++ < 500) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (computerMap[r][c] !== 0) continue;
      const region = bfsFill(r, c, 5);
      if (region.length === 5) {
        region.forEach(([rr, cc]) => computerMap[rr][cc] = regionId);
        return;
      }
    }
    console.error("Failed to place region", regionId);
  }


function bfsFill(sr, sc, need) {
  const rows = 4, cols = 5;
  const q = [[sr, sc]];
  const region = [];
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
  seen[sr][sc] = true;

  while (q.length && region.length < need) {
    const [r, c] = q.shift();
    if (computerMap[r][c] === 0) region.push([r, c]);

    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
          !seen[nr][nc] && computerMap[nr][nc] === 0) {
        seen[nr][nc] = true;
        q.push([nr, nc]);
      }
    });
  }

  return region;
}
