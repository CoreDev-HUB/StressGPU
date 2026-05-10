// ============================================================
// ¡CORREGIDO! FÓRMULA MATEMÁTICA PARA CLONAR LA FORMA DE LA FOTO
// El resto del script.js (interfaz, botón Apply) no se toca.
// ============================================================

function initGL() {
    if (!canvas) canvas = document.getElementById('c1');
    if (!gl) gl = canvas.getContext('webgl');
    resize();

    var vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vert, V_SOURCE);
    gl.compileShader(vert);
    
    var frag = gl.createShader(gl.FRAGMENT_SHADER);

    // ============================================================================
    // ESTA ES LA NUEVA FÓRMULA QUE CLONA LA FORMA ORGÁNICA DE TU CAPTURA
    // ============================================================================
    var CORRECT_FORMULA_KERNEL = `
        float kernel(vec3 ver){
            vec3 z = ver;
            float dr = 1.0;
            float r = 0.0;
            
            // Parámetros mágicos para la forma orgánica de la foto
            float power = 8.0; 
            float bailOut = 4.0;
            
            for (int i = 0; i < 15; i++) { // Más iteraciones para el detalle de la foto
                r = length(z);
                if (r > bailOut) break;
                
                // Convertir a coordenadas polares
                float theta = acos(z.z / r);
                float phi = atan(z.y, z.x);
                dr = pow(r, power - 1.0) * power * dr + 1.0;
                
                // Escalar y rotar (esta es la clave de la forma orgánica)
                float zr = pow(r, power);
                theta = theta * power;
                phi = phi * power;
                
                // Convertir de vuelta a coordenadas cartesianas
                z = zr * vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta));
                z += ver;
            }
            // Estimación de distancia para un renderizado suave como en la foto
            return 0.5 * log(r) * r / dr; 
        }
    `;
    // ============================================================================

    // IMPORTANTE: Concatenamos la fórmula corregida con el resto del shader base
    gl.shaderSource(frag, F_SOURCE_BASE + CORRECT_FORMULA_KERNEL);
    gl.compileShader(frag);

    var newProgram = gl.createProgram();
    gl.attachShader(newProgram, vert);
    gl.attachShader(newProgram, frag);
    gl.linkProgram(newProgram);

    if (!gl.getProgramParameter(newProgram, gl.LINK_STATUS)) {
        var info = gl.getProgramInfoLog(newProgram);
        // Si hay error, lo sacamos por consola, pero no rompemos la web
        console.error("Error en la fórmula de la forma: " + info);
        return;
    }

    shaderProgram = newProgram;
    gl.useProgram(shaderProgram);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,0, 1,-1,0, 1,1,0, -1,-1,0, 1,1,0, -1,1,0]), gl.STATIC_DRAW);
    
    var pos = gl.getAttribLocation(shaderProgram, 'position');
    gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(pos);
}
