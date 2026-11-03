import {
  Dots,
  Glow,
  Halo,
  Hued,
  Line,
  Solid,
  type Hue,
} from "@/components/iso/draw";
import * as k from "@/components/iso/iso-kit";
import type { Flat, Plan, Point3 } from "@/components/iso/iso-kit";

import type { ReporterStage } from "@streetproof/domain";

import "@/components/iso/iso.css";
import "./status-dial.css";

const WIDTH = 420;
const HEIGHT = 300;
const AZIMUTH = 45;
const ELEVATION = 36;

const PLATE: Plan = { x: -100, y: -80, w: 200, d: 160, r: 8 };
const PLATE_H = 10;
const FOOT_H = 4;

const DIAL_R = 36;
const DIAL_H = 8;
const COLLAR_R = 15;
const COLLAR_H = 2.5;
const KNOB_R = 11;
const KNOB_H = 7;

const LAMP_ORBIT = 52;
const LAMP_COLLAR_R = 8;
const LAMP_R = 6.4;
const LENS_R = 4.6;
const LENS_Z = 9;
const LENS_H = 3.5;

const FIRST_ANGLE = 165;
const STATION_GAP = 45;
const RISE_STEP_MS = 60;

const STATIONS: { hue: Hue | null }[] = [
  { hue: "amber" },
  { hue: "blue" },
  { hue: "cyan" },
  { hue: "rose" },
  { hue: null },
];
const CLOSED = 4;

type LampState = "done" | "current" | "off";

export function reporterProgress(stage: ReporterStage) {
  return stage === "closed_without_repair"
    ? { step: 3, total: 3 }
    : { step: stationOf(stage) + 1, total: 4 };
}

function stationOf(stage: ReporterStage) {
  if (stage === "closed_without_repair") return CLOSED;
  if (stage === "in_review") return 1;
  if (stage === "in_progress") return 2;
  if (stage === "resolved") return 3;
  return 0;
}

function lampStates(current: number): LampState[] {
  if (current === CLOSED) return ["done", "done", "off", "off", "current"];
  return STATIONS.map((_, index) =>
    index < current ? "done" : index === current ? "current" : "off",
  );
}

function bearing(station: number) {
  return ((45 - (FIRST_ANGLE - STATION_GAP * station)) * Math.PI) / 180;
}

function onOrbit(station: number, radius: number): Flat {
  const angle = bearing(station);
  return [Math.sin(angle) * radius, -Math.cos(angle) * radius];
}

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [0, 0, DIAL_H + COLLAR_H + KNOB_H + 2],
  ],
  WIDTH,
  HEIGHT,
  { pad: 22, azimuth: AZIMUTH, elevation: ELEVATION },
);

const SCREEN_UNIT = Math.abs(
  k.axisVector(P, [Math.SQRT1_2, -Math.SQRT1_2, 0])[0],
);

const GRID = (() => {
  const reach = 240;
  const segments: string[] = [];
  for (let c = -reach; c <= reach; c += 40) {
    segments.push(k.segment([c, -reach, 0], [c, reach, 0], P));
    segments.push(k.segment([-reach, c, 0], [reach, c, 0], P));
  }
  return segments.join("");
})();

function byDepth(points: Flat[]) {
  return [...points].sort(
    (a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P),
  );
}

function at(point: Point3) {
  return k.iso(point, P);
}

const TERMINAL_BLOCK: Plan = { x: -90, y: -58, w: 10, d: 92, r: 2 };
const POST_R = 2.5;
const POST_H = 5;

function postAt(): Flat {
  const [lampX, lampY] = onOrbit(CLOSED, LAMP_ORBIT);
  return [lampX + 19, lampY];
}

function Terminals() {
  const wired = Array.from({ length: CLOSED }, (_, index) =>
    onOrbit(index, LAMP_ORBIT),
  );
  const [lampX, lampY] = onOrbit(CLOSED, LAMP_ORBIT);
  const [postX] = postAt();
  return (
    <g>
      <Solid paths={k.slabOf(TERMINAL_BLOCK, 0, 5, P, 3, 0.5)} tone="mid" />
      <Line
        d={k.planOutline(k.insetPlan(TERMINAL_BLOCK, 1.6), 5, P, 3)}
        tone="faint"
      />
      <Dots points={wired.map(([, y]) => at([-85, y, 5]))} size={0.5} />
      {wired.map(([x, y]) => (
        <Line
          key={y}
          d={k.lineOnTop(
            [x - LAMP_COLLAR_R, y],
            [TERMINAL_BLOCK.x + TERMINAL_BLOCK.w, y],
            0,
            P,
          )}
          tone="lo"
        />
      ))}
      <Line
        d={k.lineOnTop(
          [lampX + LAMP_COLLAR_R, lampY],
          [postX - POST_R, lampY],
          0,
          P,
        )}
        tone="lo"
      />
    </g>
  );
}

function Post() {
  const [x, y] = postAt();
  return (
    <g>
      <Solid
        paths={k.cylinder(x, y, POST_R, 0, POST_H, P, 16)}
        tone="mid"
        crease="none"
      />
      <Dots points={[at([x, y, POST_H])]} size={0.45} />
    </g>
  );
}

function Base() {
  const strip: Plan = { x: -70, y: 65, w: 140, d: 7, r: 1 };
  const label: Plan = { x: 70, y: -30, w: 20, d: 60, r: 2 };
  const ticks = k.topTicks(
    strip.x + 4,
    strip.x + strip.w - 4,
    4,
    5,
    strip.y + 0.8,
    0.6,
    [2, 3.6],
    P,
  );
  const screws = k.corners(PLATE, 10);
  return (
    <g>
      {byDepth(k.corners(PLATE, 22)).map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <Solid
            paths={k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28)}
            tone="lo"
          />
          <Solid
            paths={k.cylinder(
              x,
              y,
              5.4,
              -PLATE_H - FOOT_H + 1.6,
              FOOT_H - 1.6,
              P,
              28,
            )}
            tone="mid"
          />
        </g>
      ))}
      <Solid paths={k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6)} tone="mid" />
      <Line d={k.planOutline(k.insetPlan(PLATE, 5), 0, P)} tone="lo" />
      <Line
        d={screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join("")}
        tone="lo"
      />
      <Dots points={screws.map(([x, y]) => at([x, y, 0]))} size={0.5} />
      <Solid
        paths={k.slabOf(strip, 0, 0.6, P, 3)}
        tone="lo"
        crease="none"
        flat
      />
      <Line d={ticks.minor} tone="lo" />
      <Line d={ticks.major} tone="mid" />
      <Dots
        points={[
          at([strip.x + 2, strip.y + 3.5, 0.6]),
          at([strip.x + strip.w - 2, strip.y + 3.5, 0.6]),
        ]}
        size={0.45}
      />
      <Solid paths={k.slabOf(label, 0, 0.8, P, 4)} tone="lo" crease="none" />
      <Line
        d={k.planOutline(k.insetPlan(label, 1.6), 0.8, P, 4)}
        tone="faint"
      />
      <Line d={k.lineOnTop([76, -22], [76, 22], 0.8, P)} tone="lo" />
      <Line d={k.lineOnTop([80, -22], [80, 8], 0.8, P)} tone="lo" />
      <Line d={k.lineOnTop([84, -22], [84, 15], 0.8, P)} tone="lo" />
      <Dots points={[at([80, -26, 0.8]), at([80, 26, 0.8])]} size={0.45} />
      <Terminals />
    </g>
  );
}

function EndStop({ station }: { station: number }) {
  const [x, y] = onOrbit(station, LAMP_ORBIT);
  const plan: Plan = { x: x - 3, y: y - 3, w: 6, d: 6, r: 1 };
  return (
    <g>
      <Solid paths={k.slabOf(plan, 0, 6, P, 3, 0.5)} tone="mid" />
      <Dots points={[at([x, y, 6])]} size={0.45} />
    </g>
  );
}

function Lamp({
  index,
  state,
  idPrefix,
}: {
  index: number;
  state: LampState;
  idPrefix: string;
}) {
  const hue = STATIONS[index]?.hue ?? null;
  const [x, y] = onOrbit(index, LAMP_ORBIT);
  const lens = k.cylinder(x, y, LENS_R, LENS_Z, LENS_H, P, 24, 0.4);
  const lensTop = LENS_Z + LENS_H;
  const facing = Math.PI / 4;
  const screws: Point3[] = [-1, 1].map((side) => [
    x + (LAMP_COLLAR_R - 1.2) * Math.cos(facing + side * 0.95),
    y + (LAMP_COLLAR_R - 1.2) * Math.sin(facing + side * 0.95),
    3,
  ]);
  const reach = (LENS_R + 16) * SCREEN_UNIT;
  const [haloX, haloY] = at([x, y, LENS_Z + LENS_H / 2]);
  const markTone = state === "current" ? "hi" : "mid";
  const cross = 3.25;

  return (
    <Hued hue={hue ?? "amber"} id={`${idPrefix}-lamp-${index}`}>
      <Solid paths={k.cylinder(x, y, LAMP_COLLAR_R, 0, 3, P, 28)} tone="mid" />
      <Dots points={k.pointsAt(screws, P)} size={0.4} />
      <Solid
        paths={k.cylinder(x, y, LAMP_R, 3, LENS_Z - 3, P, 24)}
        tone="mid"
        crease="none"
      />
      <Line d={k.sideArc(x, y, LAMP_R, 6, P, 14)} tone="faint" />
      {state === "current" && hue ? (
        <Halo
          id={`${idPrefix}-lamp-${index}`}
          shape={{
            cx: haloX,
            cy: haloY,
            rx: reach,
            ry: reach * Math.sin((ELEVATION * Math.PI) / 180),
            angle: 0,
          }}
          className="dial-lit"
        />
      ) : null}
      <Solid
        paths={lens}
        tone={state === "off" ? "lo" : "hi"}
        crease={state === "off" ? "faint" : "lo"}
      />
      {state === "current" && hue ? (
        <Glow className="dial-lit">
          <Solid paths={lens} tone="hi" crease="faint" />
        </Glow>
      ) : null}
      {state === "done" && hue ? (
        <path className="iso-line iso-trace" d={lens.outline + lens.crease} />
      ) : null}
      {index === CLOSED ? (
        <>
          <Line
            d={k.lineOnTop(
              [x - cross, y - cross],
              [x + cross, y + cross],
              lensTop,
              P,
            )}
            tone={markTone}
          />
          <Line
            d={k.lineOnTop(
              [x - cross, y + cross],
              [x + cross, y - cross],
              lensTop,
              P,
            )}
            tone={markTone}
          />
        </>
      ) : null}
    </Hued>
  );
}

function Dial({ current, idPrefix }: { current: number; idPrefix: string }) {
  const hue = STATIONS[current]?.hue ?? null;
  const top = DIAL_H;
  const knobZ = DIAL_H + COLLAR_H;
  const knobTop = knobZ + KNOB_H;
  const [pointerX, pointerY] = onOrbit(current, 1);
  const ticks = k.radialTicks(
    0,
    0,
    DIAL_R - 3,
    24,
    6,
    top,
    [1.3, 2.8],
    P,
    bearing(0),
    Math.PI,
  );
  const lastLit = current === CLOSED ? 1 : current;
  const arcHue = STATIONS[lastLit]?.hue ?? null;
  const progress = Array.from({ length: lastLit * 15 + 1 }, (_, step) =>
    onOrbit(step / 15, 30.2),
  );
  const needle = k.lineOnTop(
    [pointerX * COLLAR_R, pointerY * COLLAR_R],
    [pointerX * (DIAL_R - 2.2), pointerY * (DIAL_R - 2.2)],
    top + 0.2,
    P,
  );

  return (
    <g>
      <Solid
        paths={k.cylinder(0, 0, DIAL_R, 0, DIAL_H, P, 64, 0.8)}
        tone="hi"
        crease="lo"
      />
      <Line d={k.knurl(0, 0, DIAL_R, top - 3.4, top, 96, P, 0.3)} tone="lo" />
      <Line d={k.sideArc(0, 0, DIAL_R, top - 3.4, P, 40)} tone="faint" />
      <Line d={k.ring(0, 0, DIAL_R - 2.2, top, P, 64)} tone="lo" />
      <Line d={ticks.minor} tone="lo" />
      <Line d={ticks.major} tone="mid" />
      {arcHue && lastLit > 0 ? (
        <Hued hue={arcHue} id={`${idPrefix}-arc`}>
          <path className="iso-line iso-trace" d={k.onTop(progress, top, P)} />
        </Hued>
      ) : null}
      {hue ? (
        <Hued hue={hue} id={`${idPrefix}-needle`}>
          <path className="iso-line iso-trace" d={needle} />
        </Hued>
      ) : (
        <Line d={needle} tone="hi" />
      )}
      <Solid
        paths={k.cylinder(0, 0, COLLAR_R, top, COLLAR_H, P, 36)}
        tone="mid"
      />
      <Line d={k.ring(0, 0, COLLAR_R - 1.6, knobZ, P, 36)} tone="faint" />
      <Solid
        paths={k.cylinder(0, 0, KNOB_R, knobZ, KNOB_H, P, 32)}
        tone="mid"
      />
      <Line d={k.knurl(0, 0, KNOB_R, knobZ, knobTop, 36, P)} tone="lo" />
      <Line
        d={k.lineOnTop(
          [0, 0],
          [pointerX * KNOB_R, pointerY * KNOB_R],
          knobTop,
          P,
        )}
        tone="hi"
      />
      <Dots points={[at([0, 0, knobTop])]} size={0.5} />
    </g>
  );
}

export function StatusDial({
  stage,
  label,
  idPrefix,
  className,
}: {
  stage: ReporterStage;
  label: string;
  idPrefix: string;
  className?: string;
}) {
  const current = stationOf(stage);
  const states = lampStates(current);
  const stops = [-0.5, 4.5];
  const parts = [
    ...STATIONS.map((_, index) => ({
      key: `lamp-${index}`,
      position: onOrbit(index, LAMP_ORBIT),
      node: (
        <Lamp
          index={index}
          state={states[index] ?? "off"}
          idPrefix={idPrefix}
        />
      ),
    })),
    ...stops.map((station) => ({
      key: `stop-${station}`,
      position: onOrbit(station, LAMP_ORBIT),
      node: <EndStop station={station} />,
    })),
    { key: "post", position: postAt(), node: <Post /> },
    {
      key: "dial",
      position: [0, 0] as Flat,
      node: <Dial current={current} idPrefix={idPrefix} />,
    },
  ].sort(
    (a, b) =>
      k.depthOf([a.position[0], a.position[1], 0], P) -
      k.depthOf([b.position[0], b.position[1], 0], P),
  );

  return (
    <div className={className ? `iso ${className}` : "iso"}>
      <svg
        className="iso-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={label}
        focusable="false"
      >
        <defs>
          <radialGradient
            id={`${idPrefix}-fade-gradient`}
            gradientUnits="userSpaceOnUse"
            cx={WIDTH / 2}
            cy={HEIGHT / 2}
            r={WIDTH * 0.58}
          >
            <stop offset="0.6" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <mask
            id={`${idPrefix}-fade`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={WIDTH}
            height={HEIGHT}
          >
            <rect
              width={WIDTH}
              height={HEIGHT}
              fill={`url(#${idPrefix}-fade-gradient)`}
            />
          </mask>
        </defs>
        <g mask={`url(#${idPrefix}-fade)`}>
          <path className="iso-grid" d={GRID} />
          <Base />
          {parts.map((part, index) => (
            <g
              key={part.key}
              className="dial-rise"
              style={
                {
                  "--delay": `${index * RISE_STEP_MS}ms`,
                } as React.CSSProperties
              }
            >
              {part.node}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
