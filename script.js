const startBtn = document.getElementById("startBtn");
const gameArea = document.getElementById("gameArea");
const sketchGrid = document.getElementById("sketchGrid");
const showRulesBtn = document.getElementById("showRulesBtn");
const closeRulesBtn = document.getElementById("closeRulesBtn");
const rulesModal = document.getElementById("rulesModal");
const probeCounterElm = document.getElementById("probeCounter");
const probeResultElm = document.getElementById("probeResultText");
const submitBtn = document.getElementById("submitBtn");
const resultMessage = document.getElementById("resultMessage");
const restartBtn = document.getElementById("restartBtn");

let selectedPattern = 0;
let probeCount = 0;
const usedProbes = new Set();
let computerMap = [];

restartBtn.addEventListener("click", () => {
  gameArea.classList.add("hidden");
  startBtn.classList.remove("hidden");
  submitBtn.classList.add("hidden");
  restartBtn.classList.add("hidden");
  resultMessage.textContent = "";
  probeResultElm.innerHTML = "";
});

startBtn.addEventListener("click", () => {
  startBtn.classList.add("hidden");
  gameArea.classList.remove("hidden");
  submitBtn.classList.remove("hidden");
  restartBtn.classList.remove("hidden");
  resultMessage.textContent = "";
  probeResultElm.innerHTML = "";

  probeCount = 0;
  usedProbes.clear();
  updateProbeCounter();
  generateComputerMap();
  drawSketchBoard();
});


showRulesBtn.addEventListener("click", () => rulesModal.classList.remove("hidden"));
closeRulesBtn.addEventListener("click", () => rulesModal.classList.add("hidden"));

document.querySelectorAll('.pattern-box').forEach(box => {
  box.addEventListener('click', () => {
    selectedPattern = parseInt(box.dataset.pattern);
    document.querySelectorAll('.pattern-box').forEach(b => b.classList.remove('active-pattern'));
    box.classList.add('active-pattern');
  });
});

function updateProbeCounter() {
  probeCounterElm.textContent = `Probes Used: ${probeCount} / 12`;
}

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
        if (selectedPattern > 0) {
          for (let i = 1; i <= 4; i++) cell.classList.remove(`cell-pattern-${i}`);
          cell.classList.add(`cell-pattern-${selectedPattern}`);
          cell.dataset.pattern = selectedPattern;
        }
      });

      sketchGrid.appendChild(cell);
    }
  }

  // Draw probe dots
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const dot = document.createElement("div");
      dot.className = "probe-dot";
      const cellSize = 60, gap = 6, step = cellSize + gap;
      dot.style.left = `${(c + 1) * step}px`;
      dot.style.top = `${(r + 1) * step}px`;
      dot.addEventListener("click", () => probe(r, c));
      sketchGrid.appendChild(dot);
    }
  }
}

function probe(row, col) {
  const key = `${row},${col}`;
  if (!usedProbes.has(key)) {
    usedProbes.add(key);
    probeCount++;
    updateProbeCounter();
  }

  const patternCounts = [];
  for (let r = row; r < row + 2; r++) {
    for (let c = col; c < col + 2; c++) {
      const id = computerMap[r][c];
      patternCounts.push(id >= 1 && id <= 4 ? id : 0);
    }
  }

  for (let i = patternCounts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [patternCounts[i], patternCounts[j]] = [patternCounts[j], patternCounts[i]];
  }

  let resultHTML = `Probe (${row + 1},${col + 1}):<div style="display:flex; justify-content:center; gap:10px; margin-top:10px;">`;
  patternCounts.forEach(id => {
    if (id >= 1 && id <= 4) {
      resultHTML += `<span class="found-pattern cell-pattern-${id}"></span>`;
    } else {
      resultHTML += `<span class="found-pattern" style="background:#ccc;"></span>`;
    }
  });
  resultHTML += `</div>`;
  probeResultElm.innerHTML = resultHTML;
}

function generateComputerMap() {
  const rows = 4, cols = 5;
  computerMap = Array.from({ length: rows }, () => Array(cols).fill(0));
  let maxAttempts = 1000;

  while (maxAttempts-- > 0) {
    computerMap.forEach(row => row.fill(0));
    let ok = true;
    for (let id = 1; id <= 4; id++) {
      if (!placeRegion(id)) {
        ok = false;
        break;
      }
    }
    if (ok) return;
  }

  console.error("Failed to generate full board.");
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
      return true;
    }
  }
  return false;
}

function bfsFill(sr, sc, need) {
  const rows = 4, cols = 5;
  const q = [[sr, sc]], region = [];
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
  seen[sr][sc] = true;

  while (q.length && region.length < need) {
    const [r, c] = q.shift();
    if (computerMap[r][c] === 0) region.push([r, c]);
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen[nr][nc] && computerMap[nr][nc] === 0) {
        seen[nr][nc] = true;
        q.push([nr, nc]);
      }
    });
  }
  return region;
}

submitBtn.addEventListener("click", () => {
  const cells = document.querySelectorAll(".sketch-cell");
  let correct = true;

  for (let cell of cells) {
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    const guess = parseInt(cell.dataset.pattern);
    const actual = computerMap[r][c];
    if (guess !== actual) {
      correct = false;
      break;
    }
  }

  resultMessage.textContent = correct
    ? "🎉 Congratulations! You deduced the correct layout!"
    : "❌ Incorrect. Try again or probe more.";
  resultMessage.style.color = correct ? "green" : "red";
});
