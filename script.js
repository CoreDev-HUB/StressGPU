// El motor de colores ahora es dinámico (RGB basado en posición)
    var F_SOURCE_BASE = "precision highp float; float kernel(vec3 ver); uniform vec3 origin, right, up, forward; uniform float len; varying vec3 dir; void main() { " +
        "vec3 color = vec3(0.0); " +
        "float step = 0.002 * len; " +
        "for (int k = 0; k < 400; k++) { " +
        "    vec3 ver = origin + dir * (step * float(k)); " +
        "    if (kernel(ver) > 0.0) { " +
        "        float dist = length(ver - origin); " +
        "        // AQUÍ ESTÁ LA MAGIA DEL COLOR: " +
        "        color.r = abs(sin(ver.x * 2.0)); " +
        "        color.g = abs(cos(ver.y * 2.0)); " +
        "        color.b = abs(sin(ver.z * 5.0)); " +
        "        color *= (1.5 / dist); // Brillo basado en distancia " +
        "        break; " +
        "    } " +
        "} " +
        "gl_FragColor = vec4(color, 1.0); }";
