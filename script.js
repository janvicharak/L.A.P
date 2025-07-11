document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById('startBtn');
  const gameArea = document.getElementById('gameArea');
  const sketchGrid = document.getElementById('sketchGrid');
  const probeCounterElm = document.getElementById('probeCounter');
  const probeResultElm = document.getElementById('probeResultText');
  const sketchBoardContainer = document.getElementById('sketchBoardContainer');
  const patternSelector = document.getElementById('patternSelector');

  let computerMap = [];
  let probeCount = 0;
  const usedProbes = new Set();
  let selectedPattern = 1;

  // Start game
  startBtn.addEventListener('click', () => {
    startBtn.classList.add('hidden');
    gameArea.classList.remove('hidden');
    patternSelector.classList.remove('hidden');

    probeCount = 0;
    usedProbes.clear();
    updateProbeCounter();

    generateComputerMap();
    drawSketchBoard();
    drawProbes();
  });

  // Pattern selector buttons
  document.querySelectorAll('.pattern-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedPattern = parseInt(btn.dataset.pattern);
    });
  });

  function updateProbeCounter() {
    probeCounterElm.textContent = `Probes Used: ${probeCount} / 12`;
  }

  function drawSketchBoard() {
    sketchGrid.innerHTML = '';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        const cell = document.createElement('div');
        cell.className = 'sketch-cell';
        cell.dataset.region = 0;
        cell.addEventListener('click', () => {
          cell.dataset.region = selectedPattern;
          cell.className = 'sketch-cell region-' + selectedPattern;
        });
        sketchGrid.appendChild(cell);
      }
    }
  }

  function drawProbes() {
    document.querySelectorAll('.probe-circle').forEach(e => e.remove());

    let probeNum = 1;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const circle = document.createElement('div');
        circle.className = 'probe-circle';
        const left = col * 64 + 46;
        const top = row * 64 + 46;
        circle.style.left = `${left}px`;
        circle.style.top = `${top}px`;
        circle.title = `Probe ${probeNum}`;
        circle.addEventListener('click', () => probe(row, col, probeNum));
        sketchBoardContainer.appendChild(circle);
        probeNum++;
      }
    }
  }

  function probe(row, col, probeId) {
    const key = `${row},${col}`;
    if (!usedProbes.has(key)) {
      usedProbes.add(key);
      probeCount++;
      updateProbeCounter();
    }

    const regions = new Set();
    for (let r = row; r < row + 2; r++) {
      for (let c = col; c < col + 2; c++) {
        regions.add(computerMap[r][c]);
      }
    }

    probeResultElm.textContent = `Probe ${probeId}: ${regions.size} region(s)`;
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
    const q = [[sr, sc]], region = [];
    const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
    seen[sr][sc] = true;
    while (q.length && region.length < need) {
      const [r, c] = q.shift();
      if (computerMap[r][c] === 0) region.push([r, c]);
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        if (
          nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
          !seen[nr][nc] && computerMap[nr][nc] === 0
        ) {
          seen[nr][nc] = true;
          q.push([nr, nc]);
        }
      });
    }
    return region;
  }
});
