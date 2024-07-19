function loadShader(shaderName) {
    // This function would handle loading and displaying the shader
    // You would replace the content below with actual shader loading logic
    const canvas = document.getElementById('shaderCanvas');
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.font = '20px Arial';
    context.fillText(`Loaded ${shaderName}`, 10, 50);
}

// Example of dynamically setting shader description
const shaderDescription = document.querySelector('.shader-display p');
if (shaderDescription) {
    shaderDescription.textContent = 'Select a shader to see its effects.';
} else {
    // Updated error handling for shader description element
    const errorMessage = document.createElement('p');
    errorMessage.textContent = 'Shader description element not found.';
    errorMessage.style.color = 'red';
    document.body.appendChild(errorMessage);
}

const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const colorWheel = document.getElementById('colorWheel');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    sidebar.classList.toggle('collapsed');
    document.querySelector('.content').style.marginLeft = sidebar.classList.contains('active') ? 'var(--sidebar-width)' : '0';
});

function updateColorWheel() {
    document.body.style.backgroundColor = colorWheel.value;
}

colorWheel.addEventListener('input', updateColorWheel);