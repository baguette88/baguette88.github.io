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
document.querySelector('.shader-display p').textContent = 'Select a shader to see its effects.';
