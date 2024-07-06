const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const colorPicker = document.getElementById('colorPicker');
const lineWidth = document.getElementById('lineWidth');
const lineWidthValue = document.getElementById('lineWidthValue');
const canvasContainer = document.getElementById('canvasContainer');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentImage = null;

function resizeCanvas() {
    const container = document.querySelector('.canvas-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientWidth * 1.414; // A4 aspect ratio
    if (currentImage) {
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    }
}

window.addEventListener('resize', resizeCanvas);

function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return [
        (evt.clientX - rect.left) * scaleX,
        (evt.clientY - rect.top) * scaleY
    ];
}

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getMousePos(e);
}

function draw(e) {
    if (!isDrawing) return;
    const [x, y] = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = lineWidth.value;
    ctx.lineCap = 'round';
    ctx.stroke();
    [lastX, lastY] = [x, y];
}

function stopDrawing() {
    isDrawing = false;
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        loadImage(event.target.result);
    }

    reader.readAsArrayBuffer(file);
});

function loadImage(arrayBuffer) {
    const blob = new Blob([arrayBuffer]);
    currentImage = new Image();
    currentImage.onload = function() {
        resizeCanvas();
    }
    currentImage.src = URL.createObjectURL(blob);
}

clearBtn.addEventListener('click', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (currentImage) {
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    }
});

saveBtn.addEventListener('click', function() {
    const link = document.createElement('a');
    link.download = 'signed_document.png';
    link.href = canvas.toDataURL();
    link.click();
});

lineWidth.addEventListener('input', function() {
    lineWidthValue.textContent = this.value;
});

resizeCanvas();