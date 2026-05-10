<script>
    console.log("GPU Stress Test Initialized. Author: Enric-Xx & CoreDev-HUB");

    var canvas, gl, shaderProgram;
    var ang1 = 2.8, ang2 = 0.4, len = 1.6;
    var cenx = 0, ceny = 0, cenz = 0;
    var cx, cy;

    var KERNEL_CODE = "float kernel(vec3 ver){\n" +
        "   vec3 a = ver;\n" +
        "   float b, c, d;\n" +
        "   for(int i=0; i<8; i++){\n" +
        "       b = length(a);\n" +
        "       c = atan(a.y, a.x) * 8.0;\n" +
        "       d = acos(a.z / b) * 8.0;\n" +
        "       b = pow(b, 8.0);\n" +
        "       a = vec3(b * sin(d) * cos(c), b * sin(d) * sin(c), b * cos(d)) + ver;\n" +
        "       if(b > 6.0) break;\n" +
        "   }\n" +
        "   return 4.0 - dot(a, a);\n" +
        "}";

    var V_SOURCE = "attribute vec4 position; varying vec3 dir; uniform vec3 right, forward, up; uniform float x, y; void main() { gl_Position = position; dir = forward + right * position.x * x + up * position.y * y; }";

    var F_SOURCE_BASE = "precision highp float; float kernel(vec3 ver); uniform vec3 origin, right, up, forward; uniform float len; varying vec3 dir; void main() { vec3 color = vec3(0.0); float step = 0.002 * len; for (int k = 0; k < 400; k++) { vec3 ver = origin + dir * (step * float(k)); if (kernel(ver) > 0.0) { float dist = length(ver - origin); color = vec3(1.0, 0.2, 0.2) * (1.5 / dist); break; } } gl_FragColor = vec4(color, 1.0); }";

    function initGL() {
        if (!canvas) canvas = document.getElementById('c1');
        if (!gl) gl = canvas.getContext('webgl');
        resize();

        var vert = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vert, V_SOURCE);
        gl.compileShader(vert);
        
        var frag = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(frag, F_SOURCE_BASE + KERNEL_CODE);
        gl.compileShader(frag);

        var newProgram = gl.createProgram();
        gl.attachShader(newProgram, vert);
        gl.attachShader(newProgram, frag);
        gl.linkProgram(newProgram);

        if (!gl.getProgramParameter(newProgram, gl.LINK_STATUS)) {
            var info = gl.getProgramInfoLog(newProgram);
            alert("Error en el código del Kernel: " + info);
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

    function draw() {
        if (!shaderProgram) return;
        ang1 += 0.005;
        
        var eye = [len * Math.cos(ang1) * Math.cos(ang2) + cenx, len * Math.sin(ang2) + ceny, len * Math.sin(ang1) * Math.cos(ang2) + cenz];
        
        gl.uniform1f(gl.getUniformLocation(shaderProgram, 'x'), cx/cy);
        gl.uniform1f(gl.getUniformLocation(shaderProgram, 'y'), 1.0);
        gl.uniform1f(gl.getUniformLocation(shaderProgram, 'len'), len);
        gl.uniform3f(gl.getUniformLocation(shaderProgram, 'origin'), eye[0], eye[1], eye[2]);
        gl.uniform3f(gl.getUniformLocation(shaderProgram, 'right'), Math.sin(ang1), 0, -Math.cos(ang1));
        gl.uniform3f(gl.getUniformLocation(shaderProgram, 'up'), -Math.sin(ang2)*Math.cos(ang1), Math.cos(ang2), -Math.sin(ang2)*Math.sin(ang1));
        gl.uniform3f(gl.getUniformLocation(shaderProgram, 'forward'), -Math.cos(ang1)*Math.cos(ang2), -Math.sin(ang2), -Math.sin(ang1)*Math.cos(ang2));

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(draw);
    }

    function resize() {
        cx = window.innerWidth;
        cy = window.innerHeight;
        canvas.width = cx;
        canvas.height = cy;
        if(gl) gl.viewport(0, 0, cx, cy);
    }

    window.onresize = resize;
    window.onload = function() {
        initGL();
        draw();
        document.getElementById("kernel").value = KERNEL_CODE;
    };

    document.getElementById("btn").addEventListener("click", function() {
        var cfg = document.getElementById("config");
        cfg.style.display = (cfg.style.display === "block") ? "none" : "block";
        this.innerText = (cfg.style.display === "block") ? "HIDE KERNEL" : "SHOW KERNEL";
    });

    document.getElementById("apply").addEventListener("click", function() {
        KERNEL_CODE = document.getElementById("kernel").value;
        initGL(); // Ahora esto refresca el programa correctamente
        console.log("Kernel actualizado por Enric-Xx");
    });
</script>
