export type SeaFrame = {
  x: number;
  y: number;
  zoom: number;
  pulse: number;
  time: number;
};

const vertexSource = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const fragmentSource = `
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_pan;
uniform float u_zoom;
uniform float u_time;
uniform float u_pulse;

// A 64-step Bayer ramp changes density more gradually than the former 16-step
// tile. Its 2px cells are still locked to screen pixels, not sea coordinates.
float bayer2(vec2 cell) {
  return cell.y < 0.5
    ? (cell.x < 0.5 ? 0.0 : 2.0)
    : (cell.x < 0.5 ? 3.0 : 1.0);
}

float thresholdAt(vec2 pixel) {
  vec2 cell = mod(floor(pixel / 2.0), 8.0);
  float value = 16.0 * bayer2(mod(cell, 2.0))
              + 4.0 * bayer2(mod(floor(cell / 2.0), 2.0))
              + bayer2(floor(cell / 4.0));
  return (value + 0.5) / 64.0;
}

float hash12(vec2 point) {
  vec3 value = fract(vec3(point.xyx) * 0.1031);
  value += dot(value, value.yzx + 33.33);
  return fract((value.x + value.y) * value.z);
}

// Keep the sky's 2px dots fixed to the screen. Offset each Bayer tile and
// blend in cell noise to break up the otherwise obvious grid in middle tones.
float skyThresholdAt(vec2 pixel) {
  vec2 cell = floor(pixel / 2.0);
  vec2 tile = floor(cell / 8.0);
  vec2 phase = floor(vec2(
    hash12(tile + vec2(13.0, 73.0)),
    hash12(tile + vec2(59.0, 7.0))
  ) * 8.0);
  float ordered = thresholdAt(mod(cell + phase, 8.0) * 2.0);
  return mix(ordered, hash12(cell + vec2(91.0, 31.0)), 0.20);
}

float starLayer(vec2 direction, float chance, float radius,
    float haloReach, float haloStrength, float time) {
  vec2 cell = floor(direction);
  float seed = hash12(cell + vec2(17.0, 43.0));
  vec2 center = 0.2 + 0.6 * vec2(
    hash12(cell + vec2(11.0, 5.0)),
    hash12(cell + vec2(37.0, 29.0))
  );
  float distanceToStar = length(fract(direction) - center);
  float core = 1.0 - smoothstep(radius * 0.55, radius + 0.07, distanceToStar);
  float halo = 1.0 - smoothstep(radius, radius + haloReach, distanceToStar);
  // Each star keeps its position and center; only its fringe gains or loses
  // screen-locked dither cells. Reuse the position hashes for staggered pulses.
  float twinkle = 0.5 + 0.5 * sin(time * (0.65 + center.x * 1.2)
    + 6.2831853 * center.y);
  return step(chance, seed) * min(1.0,
    core * (0.88 + 0.12 * twinkle)
    + max(0.0, halo - core) * haloStrength * (0.25 + 0.75 * twinkle));
}

float longPhase(vec2 point, float time) {
  return point.y * 0.010
       + sin(point.x * 0.004 + time * 0.12) * 0.90
       + sin(point.x * 0.012 - point.y * 0.002 - time * 0.30) * 0.21
       - time * 0.68;
}

float crossPhase(vec2 point, float time) {
  return point.x * 0.008 + point.y * 0.016 - time * 0.92;
}

float chopPhase(vec2 point, float time) {
  return point.x * 0.046 - point.y * 0.019 + time * 1.28;
}

float surfaceHeight(vec2 point, float time, float smallWave) {
  return 35.0 * sin(longPhase(point, time))
       + 9.0 * sin(crossPhase(point, time))
       + 2.5 * smallWave * sin(chopPhase(point, time));
}

// The same waves drive height and light, so a crest does not slide independently
// from its projected surface when the camera moves.
vec2 surfaceSlope(vec2 point, float time, float smallWave) {
  float longSlope = 35.0 * cos(longPhase(point, time));
  float crossSlope = 9.0 * cos(crossPhase(point, time));
  float chopSlope = 2.5 * smallWave * cos(chopPhase(point, time));
  float fold = cos(point.x * 0.012 - point.y * 0.002 - time * 0.30) * 0.21;
  return vec2(
    longSlope * (cos(point.x * 0.004 + time * 0.12) * 0.0036 + fold * 0.012)
      + crossSlope * 0.008 + chopSlope * 0.046,
    longSlope * (0.010 - fold * 0.002) + crossSlope * 0.016 - chopSlope * 0.019
  );
}

void main() {
  vec2 screen = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
  float focal = u_resolution.y * 0.86;
  float lift = 1.0 - smoothstep(0.58, 1.0, u_zoom);
  // Ease the upward tilt near the far view so the visible sky does not vanish
  // within a few percent of zoom. Both endpoints retain their old framing.
  float pitch = mix(1.48, 0.22, pow(lift, 0.40));
  float sine = sin(pitch);
  float cosine = cos(pitch);
  float cameraHeight = 640.0 / u_zoom + 440.0 * lift;
  float cameraZ = -cameraHeight * cosine / sine;
  float horizonY = u_resolution.y * 0.5 - focal * tan(pitch);
  vec2 film = (screen - u_resolution * 0.5) / focal;
  // Perspective ray into the displaced sea plane. The Bayer cells remain in
  // screen space; only the wave field uses the projected world coordinates.
  vec3 ray = vec3(film.x, -sine - film.y * cosine, cosine - film.y * sine);
  vec3 paper = vec3(0.973, 0.982, 0.968);
  vec3 blueInk = vec3(0.105, 0.165, 0.19);
  float threshold = thresholdAt(screen);

  // Raise the middle of the distant sky/sea transition just a little. A
  // screen-wide shallow arc reads more deliberately than several wandering
  // sine bends, while the dither still keeps it from becoming a drawn line.
  float horizontal = (screen.x - u_resolution.x * 0.5) / (u_resolution.x * 0.5);
  float horizonArc = lift * 14.0 * horizontal * horizontal;
  float horizonGap = screen.y - horizonY - lift * 36.0 - horizonArc;
  // Keep one compact tonal transition, rather than stacking a long dusk ramp,
  // a second fog ramp and moving veils across most of the visible sky.
  float seaBlend = smoothstep(-12.0, 58.0, horizonGap);
  float skyRise = smoothstep(-120.0, -15.0, horizonGap);
  float skyLight = mix(0.004, 0.76, skyRise);
  if (seaBlend < 0.001) {
    // Use angular sky coordinates, not the unnormalised camera ray's x/y.
    // Camera pitch can then move the constellation without squeezing its
    // vertical spacing as the sea view zooms. Dither stays screen-locked.
    vec2 skyDirection = vec2(atan(ray.x, ray.z),
      atan(ray.y, length(ray.xz))) * 92.0;
    float brightStars = starLayer(skyDirection, 0.89, 0.11, 0.16, 0.28, u_time);
    float smallStars = starLayer(skyDirection * 1.7, 0.945, 0.08,
      0.07, 0.12, u_time) * 0.60;
    float guideStars = starLayer(skyDirection * 0.68, 0.992, 0.15,
      0.25, 0.42, u_time);
    float starFade = 1.0 - smoothstep(-120.0, -50.0, horizonGap);
    skyLight = mix(skyLight, 0.996,
      max(max(brightStars, smallStars), guideStars) * starFade);
    // The gradient, veils and stars are all expressed only as ink/paper dots;
    // there is no smooth RGB sky layer behind the star shapes.
    float skyDot = step(skyThresholdAt(screen), clamp(skyLight, 0.0, 1.0));
    gl_FragColor = vec4(mix(blueInk, paper, skyDot), 1.0);
    return;
  }

  float travel = min(cameraHeight / max(-ray.y, 0.004), 30000.0);
  vec2 world = vec2(ray.x * travel, -(cameraZ + ray.z * travel)) - u_pan / u_zoom;
  float smallWave = 1.0 - smoothstep(1.5, 6.0, travel / focal);
  // One height correction adds parallax; the correction fades in the far haze.
  float height = surfaceHeight(world, u_time, smallWave)
    * (1.0 - smoothstep(6000.0, 18000.0, travel));
  travel = min((cameraHeight - height) / max(-ray.y, 0.004), 30000.0);
  world = vec2(ray.x * travel, -(cameraZ + ray.z * travel)) - u_pan / u_zoom;

  float footprint = travel / focal;
  float midDetail = 1.0 - smoothstep(12.0, 55.0, footprint);
  float fineDetail = 1.0 - smoothstep(2.0, 8.0, footprint);
  float longWave = sin(longPhase(world, u_time));
  float crossWave = sin(crossPhase(world, u_time));
  vec2 slope = surfaceSlope(world, u_time, fineDetail);
  float directionalLight = slope.y * 0.27 - slope.x * 0.11;
  float seaBase = mix(0.965, 0.985,
    smoothstep(0.0, u_resolution.y * 0.65, screen.y - horizonY));
  float light = seaBase + midDetail * (
    0.038 * longWave + 0.016 * crossWave + 0.32 * directionalLight
  );

  // Broken crest bands and branching white gaps echo the reference's broad
  // foam shapes. Their world-space phase advances toward the viewer; they are
  // not a screen-space texture sliding over the page.
  float fold = sin(world.x * 0.023 + sin(world.y * 0.008) * 1.2 - u_time * 0.42)
    + 0.45 * fineDetail * sin(world.x * 0.051 - world.y * 0.011 + u_time * 0.63);
  float broken = 0.30 + 0.70 * smoothstep(-0.42, 0.55, fold);
  float shadowLip = smoothstep(0.18, 0.62, longWave)
    - smoothstep(0.87, 0.99, longWave);
  float whiteLip = smoothstep(0.67, 0.95, longWave);
  float foamFocus = (0.12 + 0.88 * smoothstep(1.7, 5.0, footprint))
    * (1.0 - smoothstep(18.0, 44.0, footprint));
  foamFocus *= 1.0 - 0.42 * lift;
  light -= 0.38 * shadowLip * broken * foamFocus;

  // An irregular contour network cuts pale pools into the broad crest. It is
  // sparse enough to read as winding foam rather than another even dot field.
  float foamWeb = sin(world.x * 0.016 + sin(world.y * 0.008 - u_time * 0.33) * 0.55)
    + 0.85 * sin(world.y * 0.012 + sin(world.x * 0.006 + u_time * 0.27) * 0.70)
    + 0.22 * sin((world.x + world.y) * 0.021 - u_time * 0.50);
  float palePool = smoothstep(-0.20, 0.20, foamWeb);
  float poolEdge = 1.0 - smoothstep(0.07, 0.34, abs(foamWeb));
  light += 0.11 * whiteLip * palePool * foamFocus;
  light -= 0.34 * whiteLip * poolEdge * foamFocus;

  // A few flowing ridges and the core of the foam web are nearly solid ink.
  // Tonal Bayer shading remains around them, but the water no longer reads as
  // disconnected dots. Both contours are sampled in projected world space.
  float currentPhase = world.y * 0.008
    + sin(world.x * 0.005 + u_time * 0.19) * 0.66
    + sin(world.x * 0.014 - world.y * 0.001 - u_time * 0.23) * 0.17
    - u_time * 0.60;
  // At close range the projected footprint hits its minimum, so width must
  // also vary along the crest itself; otherwise zooming turns it into a
  // uniform contour line. Blend this in before 100% without a mode switch.
  float closeView = smoothstep(0.82, 1.16, u_zoom);
  // Widen over a long, gently disturbed swell rather than thresholding short
  // local peaks: a sudden dark wedge reads as a blob pasted onto the wave.
  float crestWidth = 0.5
    + 0.34 * sin(world.x * 0.008 + u_time * 0.12
      + sin(world.y * 0.003 - u_time * 0.17) * 0.45)
    + 0.08 * sin(world.x * 0.024 - world.y * 0.003 + u_time * 0.23);
  float widthFloor = mix(0.035, 0.025, closeView);
  float edgeWidth = clamp(footprint * 0.018, widthFloor, 0.12)
    * mix(1.0, mix(0.32, 2.0, crestWidth), closeView);
  float currentEdge = 1.0 - smoothstep(edgeWidth * 0.45, edgeWidth,
    abs(sin(currentPhase) - 0.25));
  float farStrokeFade = 1.0 - smoothstep(9.0, 21.0, footprint);
  float ridgeWeight = mix(0.78, 0.35 + 0.65 * foamFocus, lift)
    * farStrokeFade * mix(1.0, mix(0.55, 1.0, crestWidth), closeView);
  float foamTrace = (1.0 - smoothstep(0.045, 0.20, abs(foamWeb)))
    * whiteLip * foamFocus * farStrokeFade;
  light = mix(light, 0.08, clamp(currentEdge * ridgeWeight + foamTrace * 0.90, 0.0, 1.0));

  // Close ripples stay small; the projected footprint removes them at distance.
  float ripple = sin(world.x * 0.062 + sin(world.y * 0.019) * 1.4 + u_time * 1.0)
    * sin(world.y * 0.052 - u_time * 1.25);
  light += 0.014 * ripple * fineDetail;
  light += u_pulse * 0.014 * sin(world.y * 0.032 + world.x * 0.018 - u_time) * fineDetail;
  light = mix(light, 0.957, smoothstep(16.0, 72.0, footprint));
  // A lifted camera should see broad quiet water near the horizon, not every
  // foam contour compressed into a noisy strip beneath the sky transition.
  float farCalm = lift * smoothstep(6.0, 18.0, footprint);
  light = mix(light, seaBase, farCalm * 0.72);
  // When the camera rises, the foreground becomes an open reflective plane;
  // breaker detail stays concentrated in the middle distance.
  float nearCalm = lift * (1.0 - smoothstep(1.8, 5.0, footprint));
  light = mix(light, 0.992, nearCalm * 0.84);
  light = clamp(light, 0.32, 0.996);

  // Avoid whole 4x4 blocks flipping in one frame during a slow camera move.
  float ink = smoothstep(light - 0.016, light + 0.016, threshold);
  vec3 seaColor = mix(paper, blueInk, ink);
  vec3 skyColor = mix(blueInk, paper,
    step(skyThresholdAt(screen), clamp(skyLight, 0.0, 1.0)));
  gl_FragColor = vec4(mix(skyColor, seaColor, seaBlend), 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create sea shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const reason = gl.getShaderInfoLog(shader) || "unknown shader error";
    gl.deleteShader(shader);
    throw new Error(reason);
  }
  return shader;
}

export function createSeaRenderer(canvas: HTMLCanvasElement) {
  // The deliberately low-resolution drawing buffer gives 2 CSS-pixel Bayer cells
  // and avoids a high-DPR fullscreen post-process on every animation frame.
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;

  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create sea program");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const reason = gl.getProgramInfoLog(program) || "unknown program error";
    gl.deleteProgram(program);
    throw new Error(reason);
  }

  const buffer = gl.createBuffer();
  if (!buffer) throw new Error("Unable to create sea geometry");
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  gl.useProgram(program);
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, "u_resolution");
  const pan = gl.getUniformLocation(program, "u_pan");
  const zoom = gl.getUniformLocation(program, "u_zoom");
  const time = gl.getUniformLocation(program, "u_time");
  const pulse = gl.getUniformLocation(program, "u_pulse");

  return {
    resize(width: number, height: number) {
      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, canvas.width, canvas.height);
    },
    render(frame: SeaFrame) {
      gl.useProgram(program);
      gl.uniform2f(pan, frame.x, frame.y);
      gl.uniform1f(zoom, frame.zoom);
      gl.uniform1f(time, frame.time);
      gl.uniform1f(pulse, frame.pulse);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
