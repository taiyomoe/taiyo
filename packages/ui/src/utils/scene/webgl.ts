// The few pieces of three.js the sun scene used, on raw WebGL2: three alone weighed 500 kB.

type Quaternion = [x: number, y: number, z: number, w: number]
type Matrix3 = [number, number, number, number, number, number, number, number, number]

// The prefixes three.js gives a ShaderMaterial on WebGL2, so the shaders compile unchanged.
const VERTEX_PREFIX = `#version 300 es
#define attribute in
#define varying out
precision highp float;
precision highp int;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
`
const FRAGMENT_PREFIX = `#version 300 es
#define varying in
layout(location = 0) out highp vec4 pc_fragColor;
#define gl_FragColor pc_fragColor
precision highp float;
precision highp int;
`
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type)

  if (shader === null) {
    throw new Error("Could not create a shader")
  }

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) !== true) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "Could not compile a shader")
  }

  return shader
}

export const createProgram = (
  gl: WebGL2RenderingContext,
  vertexShader: string,
  fragmentShader: string,
) => {
  const program = gl.createProgram()
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_PREFIX + vertexShader)
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_PREFIX + fragmentShader)

  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)

  if (gl.getProgramParameter(program, gl.LINK_STATUS) !== true) {
    throw new Error(gl.getProgramInfoLog(program) ?? "Could not link a program")
  }

  return program
}

/** Uploads a geometry for `program` and returns how to draw and free it. */
export const createMesh = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  geometry: {
    attributes: Record<string, { data: Float32Array; size: number }>
    index: Uint16Array
  },
) => {
  const vao = gl.createVertexArray()
  const buffers: WebGLBuffer[] = []

  gl.bindVertexArray(vao)

  for (const [name, { data, size }] of Object.entries(geometry.attributes)) {
    const location = gl.getAttribLocation(program, name)

    if (location === -1) {
      continue
    }

    const buffer = gl.createBuffer()

    buffers.push(buffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(location)
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0)
  }

  const indexBuffer = gl.createBuffer()

  buffers.push(indexBuffer)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.index, gl.STATIC_DRAW)
  gl.bindVertexArray(null)

  return {
    draw: () => {
      gl.bindVertexArray(vao)
      gl.drawElements(gl.TRIANGLES, geometry.index.length, gl.UNSIGNED_SHORT, 0)
      gl.bindVertexArray(null)
    },
    dispose: () => {
      gl.deleteVertexArray(vao)

      for (const buffer of buffers) {
        gl.deleteBuffer(buffer)
      }
    },
  }
}

/** three.js's SphereGeometry without uvs: same vertices, normals and winding. */
export const sphereGeometry = (widthSegments: number, heightSegments: number) => {
  const position: number[] = []
  const normal: number[] = []
  const grid: number[][] = []
  const index: number[] = []
  let vertex = 0

  for (let iy = 0; iy <= heightSegments; iy++) {
    const row: number[] = []
    const v = iy / heightSegments

    for (let ix = 0; ix <= widthSegments; ix++) {
      const u = ix / widthSegments
      const x = -Math.cos(u * Math.PI * 2) * Math.sin(v * Math.PI)
      const y = Math.cos(v * Math.PI)
      const z = Math.sin(u * Math.PI * 2) * Math.sin(v * Math.PI)
      const length = Math.hypot(x, y, z) || 1

      position.push(x, y, z)
      normal.push(x / length, y / length, z / length)
      row.push(vertex++)
    }

    grid.push(row)
  }

  for (let iy = 0; iy < heightSegments; iy++) {
    for (let ix = 0; ix < widthSegments; ix++) {
      const a = grid[iy]?.[ix + 1] ?? 0
      const b = grid[iy]?.[ix] ?? 0
      const c = grid[iy + 1]?.[ix] ?? 0
      const d = grid[iy + 1]?.[ix + 1] ?? 0

      if (iy !== 0) {
        index.push(a, b, d)
      }

      if (iy !== heightSegments - 1) {
        index.push(b, c, d)
      }
    }
  }

  return {
    attributes: {
      position: { data: new Float32Array(position), size: 3 },
      normal: { data: new Float32Array(normal), size: 3 },
    },
    index: new Uint16Array(index),
  }
}

/** three.js's PlaneGeometry(1, 1), facing +z. */
export const planeGeometry = () => ({
  attributes: {
    position: {
      data: new Float32Array([-0.5, 0.5, 0, 0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0]),
      size: 3,
    },
    normal: { data: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]), size: 3 },
    uv: { data: new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), size: 2 },
  },
  index: new Uint16Array([0, 2, 1, 2, 3, 1]),
})

/** Column-major projection matrix, as three.js's PerspectiveCamera builds it. */
export const perspective = (fovDegrees: number, aspect: number, near: number, far: number) => {
  const top = near * Math.tan(((fovDegrees / 2) * Math.PI) / 180)
  const right = top * aspect

  return new Float32Array([
    near / right,
    0,
    0,
    0,
    0,
    near / top,
    0,
    0,
    0,
    0,
    -(far + near) / (far - near),
    -1,
    0,
    0,
    (-2 * far * near) / (far - near),
    0,
  ])
}

export const axisAngle = (x: number, y: number, z: number, angle: number): Quaternion => {
  const length = Math.hypot(x, y, z) || 1
  const sin = Math.sin(angle / 2)

  return [(x / length) * sin, (y / length) * sin, (z / length) * sin, Math.cos(angle / 2)]
}

/** `a * b`: rotates by `b`, then by `a`. */
export const multiply = (a: Quaternion, b: Quaternion): Quaternion => [
  a[0] * b[3] + a[3] * b[0] + a[1] * b[2] - a[2] * b[1],
  a[1] * b[3] + a[3] * b[1] + a[2] * b[0] - a[0] * b[2],
  a[2] * b[3] + a[3] * b[2] + a[0] * b[1] - a[1] * b[0],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
]

/** The column-major 3x3 rotation of `q`. */
export const rotation = ([x, y, z, w]: Quaternion): Matrix3 => [
  1 - 2 * (y * y + z * z),
  2 * (x * y + w * z),
  2 * (x * z - w * y),
  2 * (x * y - w * z),
  1 - 2 * (x * x + z * z),
  2 * (y * z + w * x),
  2 * (x * z + w * y),
  2 * (y * z - w * x),
  1 - 2 * (x * x + y * y),
]

/** A column-major model-view matrix: `linear` (3x3) scaled by `scale`, then moved by `t`. */
export const modelView = (
  [a, b, c, d, e, f, g, h, i]: Matrix3,
  scale: number,
  [x, y, z]: [number, number, number],
) =>
  new Float32Array([
    a * scale,
    b * scale,
    c * scale,
    0,
    d * scale,
    e * scale,
    f * scale,
    0,
    g * scale,
    h * scale,
    i * scale,
    0,
    x,
    y,
    z,
    1,
  ])

export const IDENTITY: Matrix3 = [1, 0, 0, 0, 1, 0, 0, 0, 1]
