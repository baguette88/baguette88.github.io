// DOM Elements
const shaderTypeSelect = document.getElementById('shader-type');
const newShaderBtn = document.getElementById('new-shader-btn');
const presetShadersSelect = document.getElementById('preset-shaders');
const shaderCode = document.getElementById('shader-code');
const canvas = document.getElementById('gl-canvas');
const gl = canvas.getContext('webgl');

const redSlider = document.getElementById('red');
const greenSlider = document.getElementById('green');
const blueSlider = document.getElementById('blue');
const redValue = document.getElementById('red-value');
const greenValue = document.getElementById('green-value');
const blueValue = document.getElementById('blue-value');

// Check WebGL support
if (!gl) {
    alert('WebGL not supported');
}

// Shader Templates
const shaderTemplates = {
    glsl: {
        color: `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec3 u_color;

void main() {
    gl_FragColor = vec4(u_color, 1.0);
}`,
        gradient: `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec3 u_color;

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = mix(vec3(0.0), u_color, st.x);
    gl_FragColor = vec4(color, 1.0);
}`
    },
    hlsl: {
        color: `
float4 main(float4 position : SV_POSITION) : SV_TARGET
{
    float3 color = float3(0.5, 0.5, 0.5); // Replace with uniform
    return float4(color, 1.0);
}`,
        gradient: `
float4 main(float4 position : SV_POSITION) : SV_TARGET
{
    float3 color = float3(0.5, 0.5, 0.5); // Replace with uniform
    float2 uv = position.xy / float2(800, 600); // Replace with actual resolution
    float3 gradientColor = lerp(float3(0, 0, 0), color, uv.x);
    return float4(gradientColor, 1.0);
}`
    }
};

// Shader compilation and rendering (placeholder)
function compileShader() {
    const shaderType = shaderTypeSelect.value;
    const code = shaderCode.value;

    console.log(`Compiling ${shaderType} shader:`);
    console.log(code);

    // Clear the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use slider values to set color
    const r = parseFloat(redSlider.value);
    const g = parseFloat(greenSlider.value);
    const b = parseFloat(blueSlider.value);

    // Draw a colored rectangle
    gl.viewport(0, 0, canvas.width, canvas.height);
    const vertices = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
         1,  1
    ]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
        precision mediump float;
        uniform vec3 u_color;
        void main() {
            gl_FragColor = vec4(u_color, 1.0);
        }
    `);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const colorLocation = gl.getUniformLocation(program, 'u_color');
    gl.uniform3f(colorLocation, r, g, b);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// Update shader code
function updateShaderCode() {
    const shaderType = shaderTypeSelect.value;
    const preset = presetShadersSelect.value;
    shaderCode.value = shaderTemplates[shaderType][preset] || '';
    compileShader();
}

// Update slider value
function updateSliderValue(slider, valueSpan) {
    valueSpan.textContent = slider.value;
    compileShader();
}

// Resize canvas
function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    compileShader();
}

// Event Listeners
newShaderBtn.addEventListener('click', () => {
    shaderCode.value = '';
    presetShadersSelect.value = '';
    compileShader();
});
presetShadersSelect.addEventListener('change', updateShaderCode);
shaderTypeSelect.addEventListener('change', updateShaderCode);
shaderCode.addEventListener('input', compileShader);

redSlider.addEventListener('input', () => updateSliderValue(redSlider, redValue));
greenSlider.addEventListener('input', () => updateSliderValue(greenSlider, greenValue));
blueSlider.addEventListener('input', () => updateSliderValue(blueSlider, blueValue));

window.addEventListener('resize', resizeCanvas);

// Initial setup
updateShaderCode();
resizeCanvas();