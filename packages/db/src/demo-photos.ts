import { crc32, deflateSync } from "node:zlib";

// Drawn placeholders, so the demo needs no real photos of real buildings. A
// matching file in fixtures/demo-photos replaces one (see scripts/seed-demo.ts).
export const DEMO_SCENES = [
  "ceiling_stain",
  "pipe_leak",
  "cracked_floor",
  "dark_blurry",
  "dead_light",
  "repaired_pipe",
  "repaired_ceiling",
  "wrong_object",
] as const;

export type DemoScene = (typeof DEMO_SCENES)[number];

type Rgb = readonly [number, number, number];

const WIDTH = 480;
const HEIGHT = 360;

function noise(x: number, y: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

// Smooth noise, so stains and puddles get irregular edges.
function blotch(x: number, y: number, scale: number) {
  const cellX = Math.floor(x / scale);
  const cellY = Math.floor(y / scale);
  const fractionX = x / scale - cellX;
  const fractionY = y / scale - cellY;
  const top =
    noise(cellX, cellY) * (1 - fractionX) + noise(cellX + 1, cellY) * fractionX;
  const bottom =
    noise(cellX, cellY + 1) * (1 - fractionX) +
    noise(cellX + 1, cellY + 1) * fractionX;
  return top * (1 - fractionY) + bottom * fractionY;
}

function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  const clamped = Math.max(0, Math.min(1, amount));
  return [
    from[0] + (to[0] - from[0]) * clamped,
    from[1] + (to[1] - from[1]) * clamped,
    from[2] + (to[2] - from[2]) * clamped,
  ];
}

function panels(x: number, y: number, base: Rgb, line: Rgb, size: number): Rgb {
  const onLine = x % size < 3 || y % size < 3;
  return onLine ? line : base;
}

function ceiling(x: number, y: number): Rgb {
  return panels(x, y, [226, 224, 216], [188, 186, 178], 120);
}

function pipeWall(x: number, y: number): Rgb {
  if (y > 270) return [120, 122, 124];
  if (y > 120 && y < 158)
    return mix([128, 132, 138], [205, 210, 214], 1 - Math.abs(y - 139) / 19);
  return panels(x, y, [206, 214, 216], [170, 178, 180], 80);
}

const PAINTERS: Record<DemoScene, (x: number, y: number) => Rgb> = {
  ceiling_stain(x, y) {
    const distance = Math.hypot(x - 250, (y - 180) * 1.2);
    const edge = 95 + blotch(x, y, 24) * 60;
    if (distance > edge) return ceiling(x, y);
    return mix(
      ceiling(x, y),
      [122, 86, 48],
      0.35 + (1 - distance / edge) * 0.5,
    );
  },
  pipe_leak(x, y) {
    const isDrop =
      (Math.abs(x - 210) < 3 || Math.abs(x - 300) < 3) &&
      y > 158 &&
      y < 270 &&
      y % 28 < 12;
    if (isDrop) return [60, 110, 170];
    const puddle =
      Math.hypot((x - 255) / 2.4, (y - 310) * 1.6) < 60 + blotch(x, y, 18) * 30;
    if (y > 270 && puddle) return [58, 84, 112];
    const stain =
      y > 158 && y < 270 && Math.abs(x - 255) < 70 + blotch(x, y, 20) * 30;
    return stain ? mix(pipeWall(x, y), [118, 110, 96], 0.5) : pipeWall(x, y);
  },
  cracked_floor(x, y) {
    const crackX = 60 + y * 0.9 + Math.sin(y / 17) * 26 + Math.sin(y / 5) * 7;
    const tile = panels(x, y, [176, 170, 158], [132, 126, 116], 110);
    if (Math.abs(x - crackX) < 3.5) return [32, 28, 24];
    return Math.abs(x - crackX) < 9 ? mix(tile, [70, 62, 52], 0.5) : tile;
  },
  dark_blurry(x, y) {
    const shape = blotch(x, y, 90);
    return mix([26, 26, 30], [84, 80, 76], shape * shape);
  },
  dead_light(x, y) {
    const isFixture = x > 150 && x < 330 && y > 60 && y < 96;
    if (isFixture) return [64, 64, 62];
    return mix([70, 72, 78], [34, 35, 40], y / HEIGHT);
  },
  repaired_pipe(x, y) {
    const isCollar = x > 240 && x < 270 && y > 112 && y < 166;
    return isCollar ? [226, 228, 230] : pipeWall(x, y);
  },
  repaired_ceiling(x, y) {
    return ceiling(x, y);
  },
  wrong_object(x, y) {
    const isDoor = x > 150 && x < 330 && y > 30;
    if (!isDoor) return [196, 188, 170];
    const isHandle = Math.hypot(x - 306, y - 200) < 9;
    return isHandle ? [214, 190, 90] : [92, 58, 40];
  },
};

function pngChunk(type: string, data: Buffer) {
  const typed = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(typed));
  return Buffer.concat([length, typed, checksum]);
}

export function drawDemoPhoto(scene: DemoScene): Uint8Array {
  const paint = PAINTERS[scene];
  const raw = Buffer.alloc((WIDTH * 3 + 1) * HEIGHT);
  for (let y = 0; y < HEIGHT; y += 1) {
    const rowStart = y * (WIDTH * 3 + 1);
    for (let x = 0; x < WIDTH; x += 1) {
      const [red, green, blue] = paint(x, y);
      // A little grain, so a flat fill doesn't read as a diagram.
      const grain = (noise(x, y) - 0.5) * 8;
      const pixel = rowStart + 1 + x * 3;
      raw[pixel] = Math.round(Math.max(0, Math.min(255, red + grain)));
      raw[pixel + 1] = Math.round(Math.max(0, Math.min(255, green + grain)));
      raw[pixel + 2] = Math.round(Math.max(0, Math.min(255, blue + grain)));
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(WIDTH, 0);
  header.writeUInt32BE(HEIGHT, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}
