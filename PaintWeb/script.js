const mainCanvas = document.getElementById('mainCanvas');
const mainCtx = mainCanvas.getContext('2d');
let isDrawing = false;
let currentTool = 'pen';
let currentColor = 'black';
let currentSize = 5;
let layers = [];
let currentLayerIndex = 0;
let startX, startY;

const history = [];
let historyIndex = -1;

const consoleOutput = document.getElementById('consoleOutput');

function log(message, type = 'info') {
    const p = document.createElement('p');
    p.textContent = message;
    p.classList.add(type);
    consoleOutput.appendChild(p);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = function(...args) {
    log(args.join(' '));
    originalConsoleLog.apply(console, args);
};

console.error = function(...args) {
    log(args.join(' '), 'error');
    originalConsoleError.apply(console, args);
};

function resizeCanvas() {
    const container = document.querySelector('.canvas-container');
    mainCanvas.width = container.offsetWidth;
    mainCanvas.height = container.offsetHeight;
    layers.forEach(layer => {
        layer.canvas.width = mainCanvas.width;
        layer.canvas.height = mainCanvas.height;
    });
    redrawCanvas();
    console.log(`Canvas resized to ${mainCanvas.width}x${mainCanvas.height}`);
}

window.addEventListener('resize', resizeCanvas);

function initializeLayers() {
    const initialLayer = createLayer();
    layers.push(initialLayer);
    currentLayerIndex = 0;
    updateLayersList();
    resizeCanvas();
    console.log('Layers initialized');
}

function createLayer() {
    const canvas = document.createElement('canvas');
    canvas.width = mainCanvas.width;
    canvas.height = mainCanvas.height;
    return {
        canvas: canvas,
        ctx: canvas.getContext('2d'),
        visible: true
    };
}

function updateLayersList() {
    const layersList = document.getElementById('layersList');
    layersList.innerHTML = '';
    layers.forEach((layer, index) => {
        const layerItem = document.createElement('li');
        layerItem.className = `layer${index === currentLayerIndex ? ' active' : ''}`;
        layerItem.innerHTML = `
            <span>Layer ${index + 1}</span>
            <input type="checkbox" ${layer.visible ? 'checked' : ''}>
        `;
        layerItem.addEventListener('click', () => switchLayer(index));
        layerItem.querySelector('input').addEventListener('change', (e) => {
            layer.visible = e.target.checked;
            redrawCanvas();
        });
        layersList.appendChild(layerItem);
    });
}

function switchLayer(index) {
    currentLayerIndex = index;
    updateLayersList();
    console.log(`Switched to Layer ${index + 1}`);
}

function addLayer() {
    const newLayer = createLayer();
    layers.push(newLayer);
    currentLayerIndex = layers.length - 1;
    updateLayersList();
    saveState();
    console.log(`New layer added. Total layers: ${layers.length}`);
}

mainCanvas.addEventListener('mousedown', startDrawing);
mainCanvas.addEventListener('mousemove', draw);
mainCanvas.addEventListener('mouseup', stopDrawing);
mainCanvas.addEventListener('mouseout', stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    [startX, startY] = [e.clientX - mainCanvas.offsetLeft, e.clientY - mainCanvas.offsetTop];
    draw(e);  // Call draw immediately to ensure single-click drawing works
}

function draw(e) {
    if (!isDrawing) return;
    const x = e.clientX - mainCanvas.offsetLeft;
    const y = e.clientY - mainCanvas.offsetTop;

    const ctx = layers[currentLayerIndex].ctx;
    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentTool === 'eraser' ? 'white' : currentColor;

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    switch (currentTool) {
        case 'pen':
        case 'brush':
        case 'eraser':
            ctx.lineTo(x, y);
            ctx.stroke();
            break;
        case 'rectangle':
            ctx.rect(startX, startY, x - startX, y - startY);
            ctx.stroke();
            break;
        case 'circle':
            const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            break;
        case 'fill':
            floodFill(x, y, currentColor);
            break;
    }

    [startX, startY] = [x, y];
    redrawCanvas();
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        saveState();
    }
}

function floodFill(x, y, fillColor) {
    const ctx = layers[currentLayerIndex].ctx;
    const imageData = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
    const targetColor = getPixel(imageData, x, y);
    const fillColorRgb = hexToRgb(fillColor);

    if (colorsMatch(targetColor, fillColorRgb)) return;

    const pixelsToCheck = [x, y];
    while (pixelsToCheck.length > 0) {
        const y = pixelsToCheck.pop();
        const x = pixelsToCheck.pop();

        const currentColor = getPixel(imageData, x, y);
        if (colorsMatch(currentColor, targetColor)) {
            setPixel(imageData, x, y, fillColorRgb);
            pixelsToCheck.push(x + 1, y);
            pixelsToCheck.push(x - 1, y);
            pixelsToCheck.push(x, y + 1);
            pixelsToCheck.push(x, y - 1);
        }
    }

    ctx.putImageData(imageData, 0, 0);
    redrawCanvas();
    saveState();
}

function getPixel(imageData, x, y) {
    const index = (y * imageData.width + x) * 4;
    return [
        imageData.data[index],
        imageData.data[index + 1],
        imageData.data[index + 2],
        imageData.data[index + 3]
    ];
}

function setPixel(imageData, x, y, color) {
    const index = (y * imageData.width + x) * 4;
    imageData.data[index] = color[0];
    imageData.data[index + 1] = color[1];
    imageData.data[index + 2] = color[2];
    imageData.data[index + 3] = 255; // Alpha
}

function colorsMatch(color1, color2) {
    return color1[0] === color2[0] && color1[1] === color2[1] && color1[2] === color2[2];
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

function redrawCanvas() {
    mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    layers.forEach(layer => {
        if (layer.visible) {
            mainCtx.drawImage(layer.canvas, 0, 0);
        }
    });
}

function saveState() {
    const layerStates = layers.map(layer => layer.canvas.toDataURL());
    history.splice(historyIndex + 1);
    history.push(layerStates);
    historyIndex++;
    updateUndoRedoButtons();
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        loadState(history[historyIndex]);
        updateUndoRedoButtons();
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        loadState(history[historyIndex]);
        updateUndoRedoButtons();
    }
}

function loadState(layerStates) {
    layers = layerStates.map(dataUrl => {
        const img = new Image();
        img.src = dataUrl;
        const layer = createLayer();
        layer.ctx.drawImage(img, 0, 0);
        return layer;
    });
    updateLayersList();
    redrawCanvas();
}

function updateUndoRedoButtons() {
    document.getElementById('undoBtn').disabled = historyIndex <= 0;
    document.getElementById('redoBtn').disabled = historyIndex >= history.length - 1;
}

// Event listeners for tools
document.querySelectorAll('.tool').forEach(tool => {
    tool.addEventListener('click', (e) => {
        document.querySelector('.tool.active').classList.remove('active');
        e.target.classList.add('active');
        currentTool = e.target.dataset.tool;
    });
});

// Event listener for color picker
document.getElementById('colorPicker').addEventListener('input', (e) => {
    currentColor = e.target.value;
});

// Event listener for size slider
document.getElementById('sizeSlider').addEventListener('input', (e) => {
    currentSize = e.target.value;
});

// Event listeners for buttons
document.getElementById('clearCanvas').addEventListener('click', () => {
    layers[currentLayerIndex].ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    redrawCanvas();
    saveState();
});

document.getElementById('addLayerBtn').addEventListener('click', addLayer);
document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('redoBtn').addEventListener('click', redo);

// Initialize the application
initializeLayers();
updateUndoRedoButtons();