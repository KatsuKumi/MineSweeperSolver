// ===== GLOBAL VARIABLES =====
let uploadedImage = null;
let detectedBoard = null;

// Board state
let board = [];
let ROWS = 12;
let COLS = 12;

// Default color settings
let colorSettings = {
    color1: '#c29af0',
    color2: '#15f41c', 
    color3: '#fc5342',
    color4: '#3300ea',
    colorMine: '#fd0a0c',
    colorUnrevealed: '#163a61',
    colorEmpty: '#0a1e31'
};

// ===== UTILITY FUNCTIONS =====
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [0, 0, 0];
}

function initializeBoard() {
    board = [];
    for (let i = 0; i < ROWS; i++) {
        board.push(new Array(COLS).fill(''));
    }
}

function getNeighbors(r, c) {
    const neighbors = [];
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                neighbors.push([nr, nc]);
            }
        }
    }
    return neighbors;
}

// ===== BOARD MANAGEMENT =====
function createGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.onclick = () => toggleCell(r, c);
            updateCellDisplay(cell, r, c);
            grid.appendChild(cell);
        }
    }
}

function updateCellDisplay(cell, r, c) {
    const value = board[r][c];
    cell.className = 'cell';
    
    if (value === '') {
        cell.className += ' unrevealed';
        cell.textContent = '';
    } else if (value === '0') {
        cell.className += ' empty-revealed';
        cell.textContent = '';
    } else if (value === 'M') {
        cell.className += ' mine';
        cell.textContent = '💣';
    } else if (value === 'F') {
        cell.className += ' unrevealed';
        cell.textContent = '🚩';
    } else if (value === '3') {
        cell.className += ' number red';
        cell.textContent = value;
    } else if (value === '2') {
        cell.className += ' number green';
        cell.textContent = value;
    } else if (!isNaN(value) && value !== '') {
        cell.className += ' number';
        cell.textContent = value;
    }
}

function toggleCell(r, c) {
    const current = board[r][c];
    if (current === '') {
        board[r][c] = '0'; // Empty revealed cell (no adjacent mines)
    } else if (current === '0') {
        board[r][c] = '1';
    } else if (!isNaN(current) && current !== '') {
        const num = parseInt(current);
        if (num < 8) {
            board[r][c] = (num + 1).toString();
        } else {
            board[r][c] = 'M'; // After 8, goes to mine
        }
    } else if (current === 'M') {
        board[r][c] = 'F'; // Mine to Flag
    } else if (current === 'F') {
        board[r][c] = ''; // Flag back to unopened
    }
    
    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    updateCellDisplay(cell, r, c);
    clearHighlights();
}

function setBoardSize(rows, cols) {
    ROWS = rows;
    COLS = cols;
    initializeBoard();
    
    // Update grid CSS
    const grid = document.getElementById('grid');
    grid.style.gridTemplateColumns = `repeat(${COLS}, 40px)`;
    
    createGrid();
    clearHighlights();
}

function resetBoard() {
    initializeBoard();
    createGrid();
    clearHighlights();
}

// ===== GRID SIZE CONTROLS =====
function applyCustomSize() {
    const rows = parseInt(document.getElementById('rows-input').value);
    const cols = parseInt(document.getElementById('cols-input').value);
    const mines = parseInt(document.getElementById('mines-input').value);
    
    if (rows >= 5 && rows <= 50 && cols >= 5 && cols <= 50 && mines >= 1) {
        setBoardSize(rows, cols);
        document.getElementById('moves-info').innerHTML = `Board: ${rows}×${cols}, Target mines: ${mines}`;
    } else {
        alert('Please enter valid dimensions (5-50) and mine count (≥1)');
    }
}

function setPreset(rows, cols, mines) {
    document.getElementById('rows-input').value = rows;
    document.getElementById('cols-input').value = cols;
    document.getElementById('mines-input').value = mines;
    setBoardSize(rows, cols);
    document.getElementById('moves-info').innerHTML = `Preset: ${rows}×${cols} with ${mines} mines`;
}

// ===== COLOR SETTINGS =====
function toggleColorSettings() {
    const panel = document.getElementById('color-settings');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        loadColorInputs();
    } else {
        panel.style.display = 'none';
    }
}

function loadColorInputs() {
    document.getElementById('color1').value = colorSettings.color1;
    document.getElementById('color2').value = colorSettings.color2;
    document.getElementById('color3').value = colorSettings.color3;
    document.getElementById('color4').value = colorSettings.color4;
    document.getElementById('colorMine').value = colorSettings.colorMine;
    document.getElementById('colorUnrevealed').value = colorSettings.colorUnrevealed;
    document.getElementById('colorEmpty').value = colorSettings.colorEmpty;
}

function updateColorSettings() {
    colorSettings.color1 = document.getElementById('color1').value;
    colorSettings.color2 = document.getElementById('color2').value;
    colorSettings.color3 = document.getElementById('color3').value;
    colorSettings.color4 = document.getElementById('color4').value;
    colorSettings.colorMine = document.getElementById('colorMine').value;
    colorSettings.colorUnrevealed = document.getElementById('colorUnrevealed').value;
    colorSettings.colorEmpty = document.getElementById('colorEmpty').value;
    
    document.getElementById('color-status').innerHTML = '<span style="color: #4caf50;">✓ Colors updated</span>';
    setTimeout(() => document.getElementById('color-status').innerHTML = '', 2000);
}

function resetColors() {
    colorSettings = {
        color1: '#c29af0',
        color2: '#15f41c', 
        color3: '#fc5342',
        color4: '#3300ea',
        colorMine: '#fd0a0c',
        colorUnrevealed: '#163a61',
        colorEmpty: '#0a1e31'
    };
    loadColorInputs();
    document.getElementById('color-status').innerHTML = '<span style="color: #4caf50;">✓ Reset to defaults</span>';
    setTimeout(() => document.getElementById('color-status').innerHTML = '', 2000);
}

function saveColors() {
    const colorData = JSON.stringify(colorSettings);
    const blob = new Blob([colorData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minesweeper-colors.json';
    a.click();
    URL.revokeObjectURL(url);
    
    document.getElementById('color-status').innerHTML = '<span style="color: #4caf50;">✓ Colors saved to file</span>';
    setTimeout(() => document.getElementById('color-status').innerHTML = '', 2000);
}

function loadColors() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const loadedColors = JSON.parse(e.target.result);
                    colorSettings = { ...colorSettings, ...loadedColors };
                    loadColorInputs();
                    document.getElementById('color-status').innerHTML = '<span style="color: #4caf50;">✓ Colors loaded from file</span>';
                    setTimeout(() => document.getElementById('color-status').innerHTML = '', 2000);
                } catch (error) {
                    document.getElementById('color-status').innerHTML = '<span style="color: #f44336;">✗ Invalid color file</span>';
                    setTimeout(() => document.getElementById('color-status').innerHTML = '', 2000);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// ===== IMAGE ANALYSIS =====
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            uploadedImage = img;
            showImagePreview(img);
            analyzeImage(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function showImagePreview(img) {
    const preview = document.getElementById('image-preview');
    preview.innerHTML = '';
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Scale down for preview
    const maxSize = 400;
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    preview.appendChild(canvas);
    
    const info = document.createElement('div');
    info.innerHTML = `<small>Uploaded: ${img.width}×${img.height}px - Click "Analyze Image" to detect the board</small>`;
    preview.appendChild(info);
}

function analyzeImage(img) {
    const canvas = document.getElementById('analysis-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Use the current grid size from inputs
    const targetRows = parseInt(document.getElementById('rows-input').value);
    const targetCols = parseInt(document.getElementById('cols-input').value);
    
    detectedBoard = analyzeImageWithGrid(data, canvas.width, canvas.height, targetRows, targetCols);
    
    if (detectedBoard) {
        document.getElementById('moves-info').innerHTML = 
            `<strong>Image Analysis Complete!</strong><br>
            Analyzed ${detectedBoard.rows}×${detectedBoard.cols} grid<br>
            Found: ${detectedBoard.mines} mines, ${detectedBoard.numbers} numbers, ${detectedBoard.unrevealed} unrevealed<br>
            <button onclick="applyDetectedBoard()" style="background: #4caf50; color: #000; margin-top: 10px;">📋 Apply to Board</button>
            <button onclick="showColorDebug()" style="background: #ff9800; color: #000; margin-top: 10px;">🎨 Show Colors</button>`;
    } else {
        document.getElementById('moves-info').innerHTML = 
            `<strong>Analysis failed.</strong><br>
            Make sure your image shows the complete minesweeper grid.`;
    }
}

function analyzeImageWithGrid(data, width, height, gridRows, gridCols) {
    const result = {
        rows: gridRows,
        cols: gridCols,
        cells: [],
        mines: 0,
        numbers: 0,
        unrevealed: 0,
        colorDebug: []
    };
    
    const cellWidth = width / gridCols;
    const cellHeight = height / gridRows;
    
    for (let row = 0; row < gridRows; row++) {
        result.cells[row] = [];
        result.colorDebug[row] = [];
        for (let col = 0; col < gridCols; col++) {
            // Calculate cell boundaries
            const cellLeft = Math.floor(col * cellWidth);
            const cellTop = Math.floor(row * cellHeight);
            const cellRight = Math.floor((col + 1) * cellWidth);
            const cellBottom = Math.floor((row + 1) * cellHeight);
            
            const { cellType, avgColor } = analyzeCellAreaWithDebug(data, width, cellLeft, cellTop, cellRight, cellBottom);
            result.cells[row][col] = cellType;
            result.colorDebug[row][col] = avgColor;
            
            if (cellType === 'M') result.mines++;
            else if (!isNaN(cellType) && cellType !== '' && cellType !== '0') result.numbers++;
            else if (cellType === '') result.unrevealed++;
        }
    }
    
    return result;
}

function analyzeCellAreaWithDebug(data, width, left, top, right, bottom) {
    // Sample many points across the cell area to find any matching colors
    const marginX = Math.floor((right - left) * 0.1);
    const marginY = Math.floor((bottom - top) * 0.1);
    
    const targetColors = [
        { name: '1', rgb: hexToRgb(colorSettings.color1), tolerance: 50 },
        { name: '2', rgb: hexToRgb(colorSettings.color2), tolerance: 50 },
        { name: '3', rgb: hexToRgb(colorSettings.color3), tolerance: 50 },
        { name: '4', rgb: hexToRgb(colorSettings.color4), tolerance: 50 },
        { name: 'M', rgb: hexToRgb(colorSettings.colorMine), tolerance: 50 }
    ];
    
    // Check for number colors first (any pixel that matches)
    for (let y = top + marginY; y < bottom - marginY; y += 1) {
        for (let x = left + marginX; x < right - marginX; x += 1) {
            if (x >= 0 && x < width && y >= 0) {
                const i = (y * width + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Check if this pixel matches any number/mine color
                for (const color of targetColors) {
                    const [targetR, targetG, targetB] = color.rgb;
                    const distance = Math.sqrt(
                        Math.pow(r - targetR, 2) + 
                        Math.pow(g - targetG, 2) + 
                        Math.pow(b - targetB, 2)
                    );
                    
                    if (distance <= color.tolerance) {
                        return { 
                            cellType: color.name, 
                            avgColor: `rgb(${r},${g},${b}) [found ${color.name}]` 
                        };
                    }
                }
            }
        }
    }
    
    // If no number found, get average and check for specific cell types
    let r = 0, g = 0, b = 0, samples = 0;
    
    for (let y = top + marginY; y < bottom - marginY; y += 2) {
        for (let x = left + marginX; x < right - marginX; x += 2) {
            if (x >= 0 && x < width && y >= 0) {
                const i = (y * width + x) * 4;
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                samples++;
            }
        }
    }
    
    if (samples === 0) return { cellType: '', avgColor: 'rgb(0,0,0)' };
    
    r = Math.round(r / samples);
    g = Math.round(g / samples);
    b = Math.round(b / samples);
    
    // Check for unrevealed cell color first
    const [unrevR, unrevG, unrevB] = hexToRgb(colorSettings.colorUnrevealed);
    const unrevealedDistance = Math.sqrt(
        Math.pow(r - unrevR, 2) + 
        Math.pow(g - unrevG, 2) + 
        Math.pow(b - unrevB, 2)
    );
    
    if (unrevealedDistance <= 40) {
        return { cellType: '', avgColor: `rgb(${r},${g},${b}) [unrevealed]` };
    }
    
    // Check if average matches revealed empty
    const [emptyR, emptyG, emptyB] = hexToRgb(colorSettings.colorEmpty);
    const emptyDistance = Math.sqrt(
        Math.pow(r - emptyR, 2) + 
        Math.pow(g - emptyG, 2) + 
        Math.pow(b - emptyB, 2)
    );
    
    if (emptyDistance <= 40) {
        return { cellType: '0', avgColor: `rgb(${r},${g},${b}) [empty]` };
    }
    
    // Default to unrevealed if nothing else matches
    return { cellType: '', avgColor: `rgb(${r},${g},${b}) [unknown]` };
}

function applyDetectedBoard() {
    if (!detectedBoard) return;
    
    setBoardSize(detectedBoard.rows, detectedBoard.cols);
    
    // Copy detected cells to board
    for (let r = 0; r < detectedBoard.rows && r < ROWS; r++) {
        for (let c = 0; c < detectedBoard.cols && c < COLS; c++) {
            if (detectedBoard.cells[r] && detectedBoard.cells[r][c] !== undefined) {
                board[r][c] = detectedBoard.cells[r][c];
            }
        }
    }
    
    // Update display
    createGrid();
    document.getElementById('moves-info').innerHTML = 
        `<strong>Board applied from image!</strong><br>
        You may need to manually adjust some cells for accuracy.<br>
        <em>Tip: Click cells to cycle through types if needed.</em>`;
}

function showImageAnalysis() {
    if (!uploadedImage) {
        document.getElementById('moves-info').innerHTML = 
            '<strong>Please upload an image first!</strong>';
        return;
    }
    analyzeImage(uploadedImage);
}

function showColorDebug() {
    if (!detectedBoard || !detectedBoard.colorDebug) {
        document.getElementById('moves-info').innerHTML = 
            '<strong>No color debug data available. Analyze an image first!</strong>';
        return;
    }
    
    let debugHtml = '<strong>Color Debug - First 20 cells:</strong><br><div style="font-family: monospace; font-size: 12px; max-height: 300px; overflow-y: auto;">';
    
    let cellCount = 0;
    for (let r = 0; r < detectedBoard.rows && cellCount < 20; r++) {
        for (let c = 0; c < detectedBoard.cols && cellCount < 20; c++) {
            const cell = detectedBoard.cells[r][c];
            const color = detectedBoard.colorDebug[r][c];
            const cellDisplay = cell === '' ? 'UNREVEALED' : cell;
            
            // Calculate distances to target colors
            const rgbMatch = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
            if (rgbMatch) {
                const [, r_val, g_val, b_val] = rgbMatch.map(Number);
                const [rgb1R, rgb1G, rgb1B] = hexToRgb(colorSettings.color1);
                const [rgb2R, rgb2G, rgb2B] = hexToRgb(colorSettings.color2);
                const [rgb3R, rgb3G, rgb3B] = hexToRgb(colorSettings.color3);
                const [rgb4R, rgb4G, rgb4B] = hexToRgb(colorSettings.color4);
                const [rgbMR, rgbMG, rgbMB] = hexToRgb(colorSettings.colorMine);
                const [rgbUR, rgbUG, rgbUB] = hexToRgb(colorSettings.colorUnrevealed);
                const [rgb0R, rgb0G, rgb0B] = hexToRgb(colorSettings.colorEmpty);
                
                const distances = [
                    { name: '1', dist: Math.sqrt(Math.pow(r_val-rgb1R,2) + Math.pow(g_val-rgb1G,2) + Math.pow(b_val-rgb1B,2)) },
                    { name: '2', dist: Math.sqrt(Math.pow(r_val-rgb2R,2) + Math.pow(g_val-rgb2G,2) + Math.pow(b_val-rgb2B,2)) },
                    { name: '3', dist: Math.sqrt(Math.pow(r_val-rgb3R,2) + Math.pow(g_val-rgb3G,2) + Math.pow(b_val-rgb3B,2)) },
                    { name: '4', dist: Math.sqrt(Math.pow(r_val-rgb4R,2) + Math.pow(g_val-rgb4G,2) + Math.pow(b_val-rgb4B,2)) },
                    { name: 'M', dist: Math.sqrt(Math.pow(r_val-rgbMR,2) + Math.pow(g_val-rgbMG,2) + Math.pow(b_val-rgbMB,2)) },
                    { name: 'unrev', dist: Math.sqrt(Math.pow(r_val-rgbUR,2) + Math.pow(g_val-rgbUG,2) + Math.pow(b_val-rgbUB,2)) },
                    { name: '0', dist: Math.sqrt(Math.pow(r_val-rgb0R,2) + Math.pow(g_val-rgb0G,2) + Math.pow(b_val-rgb0B,2)) }
                ];
                const closest = distances.sort((a,b) => a.dist - b.dist)[0];
                
                debugHtml += `(${r},${c}): Detected=${cellDisplay} | ${color} | Closest=${closest.name}(${Math.round(closest.dist)})<br>`;
            }
            cellCount++;
        }
    }
    
    debugHtml += '</div><br><strong>Current Color Settings:</strong><br>';
    debugHtml += `1: ${colorSettings.color1} → rgb(${hexToRgb(colorSettings.color1).join(',')})<br>`;
    debugHtml += `2: ${colorSettings.color2} → rgb(${hexToRgb(colorSettings.color2).join(',')})<br>`;
    debugHtml += `3: ${colorSettings.color3} → rgb(${hexToRgb(colorSettings.color3).join(',')})<br>`;
    debugHtml += `4: ${colorSettings.color4} → rgb(${hexToRgb(colorSettings.color4).join(',')})<br>`;
    debugHtml += `Mine: ${colorSettings.colorMine} → rgb(${hexToRgb(colorSettings.colorMine).join(',')})<br>`;
    debugHtml += `Unrevealed: ${colorSettings.colorUnrevealed} → rgb(${hexToRgb(colorSettings.colorUnrevealed).join(',')})<br>`;
    debugHtml += `Empty: ${colorSettings.colorEmpty} → rgb(${hexToRgb(colorSettings.colorEmpty).join(',')})<br>`;
    debugHtml += '<br><em>Numbers checked pixel-by-pixel, others by average</em>';
    
    document.getElementById('moves-info').innerHTML = debugHtml;
}

// ===== SOLVER LOGIC =====
function solveMoves() {
    clearHighlights();
    
    // First: Find required mine positions
    const requiredMines = findRequiredMines();
    
    // Highlight required mines in red
    for (const [r, c] of requiredMines) {
        const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        if (cell) cell.classList.add('mine-move');
    }
    
    // Second: Find safe moves considering red highlights as mines
    const safeMoves = findSafeMovesWithHighlights(requiredMines);
    
    // Highlight safe moves in green
    for (const [r, c] of safeMoves) {
        const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        if (cell) cell.classList.add('safe-move');
    }
    
    // Show results
    let resultText = `Found: <strong>${safeMoves.length}</strong> safe moves (green), <strong>${requiredMines.length}</strong> mine locations (red)`;
    
    if (safeMoves.length === 0 && requiredMines.length === 0) {
        resultText += '<br><br><strong>No definitive moves found.</strong><br>';
        resultText += 'Try revealing more cells or check if you have all numbers/mines marked correctly.';
    }
    
    document.getElementById('moves-info').innerHTML = resultText;
}

function findRequiredMines() {
    const mineMoves = [];
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const value = board[r][c];
            if (!isNaN(value) && value !== '' && value !== '0') {
                const targetCount = parseInt(value);
                const neighbors = getNeighbors(r, c);
                
                let mineCount = 0;
                let unrevealedCells = [];
                
                for (const [nr, nc] of neighbors) {
                    if (board[nr][nc] === 'M' || board[nr][nc] === 'F') {
                        mineCount++;
                    } else if (board[nr][nc] === '') {
                        unrevealedCells.push([nr, nc]);
                    }
                }
                
                // If we need exactly as many mines as unrevealed cells
                if (mineCount + unrevealedCells.length === targetCount && unrevealedCells.length > 0) {
                    for (const [nr, nc] of unrevealedCells) {
                        mineMoves.push([nr, nc]);
                    }
                }
            }
        }
    }
    
    // Remove duplicates
    return [...new Set(mineMoves.map(m => m.join(',')))].map(m => m.split(',').map(Number));
}

function findSafeMovesWithHighlights(highlightedMines) {
    const safeMoves = [];
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const value = board[r][c];
            if (!isNaN(value) && value !== '' && value !== '0') {
                const targetCount = parseInt(value);
                const neighbors = getNeighbors(r, c);
                
                let mineCount = 0;
                let unrevealedCells = [];
                
                for (const [nr, nc] of neighbors) {
                    // Count actual mines/flags AND highlighted mines
                    if (board[nr][nc] === 'M' || board[nr][nc] === 'F') {
                        mineCount++;
                    } else if (isHighlightedMine(nr, nc, highlightedMines)) {
                        mineCount++; // Count red highlights as mines
                    } else if (board[nr][nc] === '') {
                        unrevealedCells.push([nr, nc]);
                    }
                }
                
                // If we have enough mines (including highlights), remaining cells are safe
                if (mineCount === targetCount && unrevealedCells.length > 0) {
                    for (const [nr, nc] of unrevealedCells) {
                        // Don't mark highlighted mines as safe
                        if (!isHighlightedMine(nr, nc, highlightedMines)) {
                            safeMoves.push([nr, nc]);
                        }
                    }
                }
            }
        }
    }
    
    // Remove duplicates
    return [...new Set(safeMoves.map(m => m.join(',')))].map(m => m.split(',').map(Number));
}

function isHighlightedMine(r, c, highlightedMines) {
    return highlightedMines.some(([mr, mc]) => mr === r && mc === c);
}

function clearHighlights() {
    document.querySelectorAll('.safe-move, .mine-move').forEach(cell => {
        cell.classList.remove('safe-move', 'mine-move');
    });
    document.getElementById('moves-info').innerHTML = '';
}

// ===== DEBUG FUNCTIONS =====
function showBoardState() {
    let mineCount = 0;
    let flagCount = 0;
    let numberCount = 0;
    let unrevealedCount = 0;
    let emptyCount = 0;
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const value = board[r][c];
            if (value === 'M') mineCount++;
            else if (value === 'F') flagCount++;
            else if (value === '0') emptyCount++;
            else if (!isNaN(value) && value !== '' && value !== '0') numberCount++;
            else if (value === '') unrevealedCount++;
        }
    }
    
    document.getElementById('moves-info').innerHTML = 
        `<strong>Board State:</strong><br>` +
        `Mines (💣): ${mineCount} | Flags (🚩): ${flagCount} | Numbers: ${numberCount} | Empty (0): ${emptyCount} | Unrevealed: ${unrevealedCount}<br>` +
        `<strong>Total mines marked:</strong> ${mineCount + flagCount}<br>` +
        `<em>Tip: Red squares in your image should be set as Mines (💣) or Flags (🚩) here!</em>`;
}

// ===== INITIALIZATION =====
function initialize() {
    initializeBoard();
    document.getElementById('grid').style.gridTemplateColumns = `repeat(${COLS}, 40px)`;
    loadColorInputs(); // Load default colors into inputs
    createGrid();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initialize);