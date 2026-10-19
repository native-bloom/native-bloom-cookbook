/**
 * Builds assets/models/globe.glb: a chunky, glossy cartoon Earth.
 *
 * Land outlines come from Natural Earth (public domain). They are rasterised
 * to an equirectangular mask, blurred so the coasts get soft rounded
 * shoulders, and used to raise the continents off a smooth sphere. Colour is
 * per vertex, so the model needs no textures.
 *
 * Run: npm run build:globe
 */
import { writeFileSync } from "node:fs";

const LAND_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson";
const OUT = new URL("../assets/models/globe.glb", import.meta.url);

// Mask resolution and blur, in pixels (1024 px = 360°)
const MASK_W = 1024;
const MASK_H = 512;
const BLUR_RADIUS = 6;
const BLUR_PASSES = 3;

// Sphere resolution, enough for the coasts to get a rounded shoulder
const LON_SEGMENTS = 512;
const LAT_SEGMENTS = 256;

// How far the continents stand off the ocean, as a fraction of the radius
const LAND_HEIGHT = 0.05;

// Pastel palette, sRGB
const OCEAN = "#4AA8F2";
const LAND = "#9DDA45";

const geojson = await (await fetch(LAND_URL)).json();
const mask = blur(rasterise(geojson));

const positions = [];
const normals = [];
const colors = [];
const ocean = hexToLinear(OCEAN);
const land = hexToLinear(LAND);

for (let row = 0; row <= LAT_SEGMENTS; row++) {
  const lat = 90 - (row / LAT_SEGMENTS) * 180;
  for (let col = 0; col <= LON_SEGMENTS; col++) {
    const lon = -180 + (col / LON_SEGMENTS) * 360;
    const height = smoothstep(0.22, 0.78, sample(mask, lat, lon));
    const radius = 1 + height * LAND_HEIGHT;
    const [x, y, z] = direction(lat, lon);
    positions.push(x * radius, y * radius, z * radius);
    // Land turns green as soon as it rises, so the rounded shoulder reads as land
    colors.push(...mix(ocean, land, smoothstep(0.02, 0.3, height)), 1);
  }
}

const indices = [];
const stride = LON_SEGMENTS + 1;
for (let row = 0; row < LAT_SEGMENTS; row++) {
  for (let col = 0; col < LON_SEGMENTS; col++) {
    const a = row * stride + col;
    const b = a + stride;
    indices.push(a, b, a + 1, a + 1, b, b + 1);
  }
}

computeNormals();
writeFileSync(OUT, glb());
console.log(`globe.glb: ${positions.length / 3} vertices, ${indices.length / 3} triangles`);

/** +Y is north, longitude 0 faces +Z, east is +X (glTF's axes). */
function direction(lat, lon) {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

function rasterise({ features }) {
  const out = new Float32Array(MASK_W * MASK_H);
  const toX = (lon) => ((lon + 180) / 360) * MASK_W;
  const toY = (lat) => ((90 - lat) / 180) * MASK_H;
  for (const { geometry } of features) {
    const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
    for (const rings of polygons) {
      // Even-odd scanline fill over every ring, so holes stay open
      for (let py = 0; py < MASK_H; py++) {
        const y = py + 0.5;
        const xs = [];
        for (const ring of rings) {
          for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            const [x1, y1] = [toX(ring[i][0]), toY(ring[i][1])];
            const [x2, y2] = [toX(ring[j][0]), toY(ring[j][1])];
            if (y1 > y !== y2 > y) xs.push(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1));
          }
        }
        xs.sort((a, b) => a - b);
        for (let k = 0; k + 1 < xs.length; k += 2) {
          const from = Math.max(0, Math.ceil(xs[k] - 0.5));
          const to = Math.min(MASK_W - 1, Math.floor(xs[k + 1] - 0.5));
          for (let px = from; px <= to; px++) out[py * MASK_W + px] = 1;
        }
      }
    }
  }
  return out;
}

/** Repeated box blur ≈ gaussian. Wraps around in longitude, clamps at the poles. */
function blur(src) {
  let a = src;
  let b = new Float32Array(a.length);
  const width = BLUR_RADIUS * 2 + 1;
  for (let pass = 0; pass < BLUR_PASSES; pass++) {
    for (let y = 0; y < MASK_H; y++) {
      for (let x = 0; x < MASK_W; x++) {
        let sum = 0;
        for (let k = -BLUR_RADIUS; k <= BLUR_RADIUS; k++) {
          sum += a[y * MASK_W + ((x + k + MASK_W) % MASK_W)];
        }
        b[y * MASK_W + x] = sum / width;
      }
    }
    [a, b] = [b, a];
    for (let y = 0; y < MASK_H; y++) {
      for (let x = 0; x < MASK_W; x++) {
        let sum = 0;
        for (let k = -BLUR_RADIUS; k <= BLUR_RADIUS; k++) {
          sum += a[Math.min(MASK_H - 1, Math.max(0, y + k)) * MASK_W + x];
        }
        b[y * MASK_W + x] = sum / width;
      }
    }
    [a, b] = [b, a];
  }
  return a;
}

/** Bilinear lookup in the mask. */
function sample(mask, lat, lon) {
  const fx = ((lon + 180) / 360) * MASK_W - 0.5;
  const fy = Math.min(MASK_H - 1, Math.max(0, ((90 - lat) / 180) * MASK_H - 0.5));
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const tx = fx - x0;
  const ty = fy - y0;
  const at = (x, y) =>
    mask[Math.min(MASK_H - 1, y) * MASK_W + ((x % MASK_W) + MASK_W) % MASK_W];
  const top = at(x0, y0) * (1 - tx) + at(x0 + 1, y0) * tx;
  const bottom = at(x0, y0 + 1) * (1 - tx) + at(x0 + 1, y0 + 1) * tx;
  return top * (1 - ty) + bottom * ty;
}

function computeNormals() {
  const n = new Float32Array(positions.length);
  for (let i = 0; i < indices.length; i += 3) {
    const [a, b, c] = [indices[i] * 3, indices[i + 1] * 3, indices[i + 2] * 3];
    const ux = positions[b] - positions[a];
    const uy = positions[b + 1] - positions[a + 1];
    const uz = positions[b + 2] - positions[a + 2];
    const vx = positions[c] - positions[a];
    const vy = positions[c + 1] - positions[a + 1];
    const vz = positions[c + 2] - positions[a + 2];
    const face = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
    for (const v of [a, b, c]) for (let k = 0; k < 3; k++) n[v + k] += face[k];
  }
  // The first and last column are the same meridian: share their normals
  for (let row = 0; row <= LAT_SEGMENTS; row++) {
    const first = row * stride * 3;
    const last = (row * stride + LON_SEGMENTS) * 3;
    for (let k = 0; k < 3; k++) n[first + k] = n[last + k] = n[first + k] + n[last + k];
  }
  for (let v = 0; v < n.length; v += 3) {
    const row = Math.floor(v / 3 / stride);
    // Poles collapse to a point; point their normals straight out
    const pole = row === 0 || row === LAT_SEGMENTS;
    const [x, y, z] = pole ? [0, row === 0 ? 1 : -1, 0] : [n[v], n[v + 1], n[v + 2]];
    const length = Math.hypot(x, y, z) || 1;
    normals.push(x / length, y / length, z / length);
  }
}

function glb() {
  const pos = new Float32Array(positions);
  const nor = new Float32Array(normals);
  const col = new Uint8Array(colors.map((c) => Math.round(c * 255)));
  const idx = new Uint32Array(indices);
  const views = [pos, nor, col, idx];
  const bin = Buffer.concat(views.map((view) => pad(Buffer.from(view.buffer))));

  let offset = 0;
  const bufferViews = views.map((view, i) => {
    const entry = {
      buffer: 0,
      byteOffset: offset,
      byteLength: view.byteLength,
      target: i === 3 ? 34963 : 34962,
    };
    offset += pad(Buffer.from(view.buffer)).length;
    return entry;
  });
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  pos.forEach((value, i) => {
    min[i % 3] = Math.min(min[i % 3], value);
    max[i % 3] = Math.max(max[i % 3], value);
  });

  const json = {
    asset: { version: "2.0", generator: "build-globe.mjs" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ name: "Globe", mesh: 0 }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 1, COLOR_0: 2 },
            indices: 3,
            material: 0,
          },
        ],
      },
    ],
    materials: [
      {
        name: "Plastic",
        pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 0.3 },
      },
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: pos.length / 3, type: "VEC3", min, max },
      { bufferView: 1, componentType: 5126, count: nor.length / 3, type: "VEC3" },
      { bufferView: 2, componentType: 5121, normalized: true, count: col.length / 4, type: "VEC4" },
      { bufferView: 3, componentType: 5125, count: idx.length, type: "SCALAR" },
    ],
    bufferViews,
    buffers: [{ byteLength: bin.length }],
  };

  const jsonChunk = pad(Buffer.from(JSON.stringify(json)), 0x20);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonChunk.length + 8 + bin.length, 8);
  return Buffer.concat([header, chunk(jsonChunk, 0x4e4f534a), chunk(bin, 0x004e4942)]);
}

function chunk(data, type) {
  const head = Buffer.alloc(8);
  head.writeUInt32LE(data.length, 0);
  head.writeUInt32LE(type, 4);
  return Buffer.concat([head, data]);
}

function pad(buffer, fill = 0) {
  const extra = (4 - (buffer.length % 4)) % 4;
  return extra ? Buffer.concat([buffer, Buffer.alloc(extra, fill)]) : buffer;
}

function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function mix(a, b, t) {
  return a.map((v, i) => v + (b[i] - v) * t);
}

function hexToLinear(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [16, 8, 0].map((shift) => {
    const c = ((value >> shift) & 255) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
}
