import { CaseStackFrame } from "@/components/case-stack-frame";
import {
  Dots,
  Glow,
  Halo,
  Hued,
  Label,
  Line,
  Solid,
  type Hue,
} from "@/components/iso/draw";
import * as k from "@/components/iso/iso-kit";
import type { Flat, Plan, Point3 } from "@/components/iso/iso-kit";

import "@/components/iso/iso.css";

const WIDTH = 640;
const HEIGHT = 560;
const AZIMUTH = 35;

const PLINTH: Plan = { x: -72, y: -96, w: 156, d: 192, r: 8 };
const PLINTH_H = 6;
const TRAY_H = 14;
const TRAY_STEPS = 3;
const RAIL: Plan = { x: 8, y: 96, w: 24, d: 230, r: 0 };
const RAIL_H = 3;
const PILL_H = 4;

interface Stage {
  name: string;
  status: string;
  hue: Hue;
}

const STAGES: Stage[] = [
  { name: "Report", status: "submitted", hue: "amber" },
  { name: "Triage", status: "triaged", hue: "blue" },
  { name: "Assign", status: "assigned", hue: "cyan" },
  { name: "Evidence", status: "completion_submitted", hue: "green" },
  { name: "Verified", status: "verified_closed", hue: "rose" },
];

// delay is when the pill lights in the 10s loop. The supervisor follows the Evidence stage.
const ROLES: { name: string; hue: Hue; delay: number }[] = [
  { name: "Supervisor", hue: "rose", delay: 6.6 },
  { name: "Technician", hue: "cyan", delay: 4.2 },
  { name: "Operator", hue: "blue", delay: 3 },
  { name: "Reporter", hue: "amber", delay: 0.2 },
];

const TOP = STAGES.length - 1;
const STAGE_DELAY = 1.8;
const STAGE_STEP = 1.2;
const TOKEN_START_Y = 300;

const trayDelay = (index: number) => STAGE_DELAY + STAGE_STEP * index;

function delayStyle(delay: number) {
  return { "--delay": `${delay}s` } as React.CSSProperties;
}

function trayPlan(index: number): Plan {
  const halfDepth = 75 - 7 * index;
  return { x: -60, y: -halfDepth, w: 120 - 20 * index, d: halfDepth * 2, r: 3 };
}

const trayZ = (index: number) => PLINTH_H + TRAY_H * index;

const P = k.fitProjection(
  [
    ...k.boxCorners(PLINTH, 0, PLINTH_H),
    ...k.boxCorners(trayPlan(4), trayZ(4), trayZ(4) + TRAY_H + 4),
    ...k.boxCorners({ ...RAIL, d: 90 }, 0, RAIL_H),
  ],
  WIDTH,
  HEIGHT,
  { pad: 16, azimuth: AZIMUTH },
);

const at = (point: Point3) => k.iso(point, P);

// An ellipse on screen that covers the part's projected box and reaches `pad` units past it.
function glowShape(plan: Plan, z: number, height: number, pad: number) {
  const [cx, cy] = at([
    plan.x + plan.w / 2,
    plan.y + plan.d / 2,
    z + height / 2,
  ]);
  const edges = [
    k.axisVector(P, [plan.w, 0, 0]),
    k.axisVector(P, [0, plan.d, 0]),
    k.axisVector(P, [0, 0, height]),
  ];
  const longest = edges.reduce((best, edge) =>
    Math.hypot(...edge) > Math.hypot(...best) ? edge : best,
  );
  const length = Math.hypot(...longest);
  const along: Flat = [longest[0] / length, longest[1] / length];
  const reach = (axis: Flat) =>
    edges.reduce(
      (sum, edge) => sum + Math.abs(edge[0] * axis[0] + edge[1] * axis[1]),
      0,
    ) / 2;
  return {
    cx,
    cy,
    rx: reach(along) + pad,
    ry: reach([-along[1], along[0]]) + pad,
    angle: (Math.atan2(along[1], along[0]) * 180) / Math.PI,
  };
}

function card(plan: Plan, z: number, dashed = false) {
  const outline = k.planOutline(k.insetPlan(plan, 1.2), z + 1.2, P, 2);
  if (dashed) {
    return <Line d={k.planOutline(plan, z, P, 2)} tone="mid" dashed />;
  }
  return (
    <>
      <Solid paths={k.slabOf(plan, z, 1.2, P, 2)} tone="mid" crease="faint" />
      <Line d={outline} tone="faint" />
    </>
  );
}

function rules(x: number, ys: [number, number][], z: number) {
  return ys.map(([from, to], index) => (
    <Line key={index} d={k.lineOnTop([x, from], [x, to], z, P)} tone="lo" />
  ));
}

const GRID = (() => {
  const reach = 320;
  const segments: string[] = [];
  for (let c = -reach; c <= reach; c += 40) {
    segments.push(k.segment([c, -reach, 0], [c, reach, 0], P));
    segments.push(k.segment([-reach, c, 0], [reach, c, 0], P));
  }
  return segments.join("");
})();

const TOKEN_FROM = k.axisVector(P, [0, TOKEN_START_Y - 103, 0]);

const RAIL_FLOW = {
  from: at([20, 326, RAIL_H]),
  to: at([20, 96, RAIL_H]),
};

function Plinth() {
  const strip: Plan = { x: 66, y: -60, w: 8, d: 120, r: 1 };
  const ticks = k.topTicks(
    -60,
    60,
    6,
    5,
    strip.x,
    PLINTH_H + 0.6,
    [2, 3.6],
    P,
    "y",
  );
  const screws = k.corners(PLINTH, 9);
  return (
    <g>
      <Solid
        paths={k.slabOf(PLINTH, 0, PLINTH_H, P, 6, 1)}
        tone="lo"
        crease="faint"
      />
      <Line
        d={k.planOutline(k.insetPlan(PLINTH, 5), PLINTH_H, P, 6)}
        tone="faint"
      />
      {screws.map(([x, y], index) => (
        <Line key={index} d={k.ring(x, y, 2.2, PLINTH_H, P, 14)} tone="lo" />
      ))}
      <Dots
        points={k.pointsAt(
          screws.map(([x, y]) => [x, y, PLINTH_H]),
          P,
        )}
        size={0.5}
      />
      <Solid
        paths={k.slabOf(strip, PLINTH_H, 0.6, P, 2)}
        tone="lo"
        crease="none"
        flat
      />
      <Line d={ticks.minor} tone="lo" />
      <Line d={ticks.major} tone="mid" />
    </g>
  );
}

function Rail() {
  return (
    <g>
      <Solid paths={k.slabOf(RAIL, 0, RAIL_H, P, 2)} tone="lo" crease="faint" />
      <Line
        d={k.planOutline(k.insetPlan(RAIL, 2.5), RAIL_H, P, 2)}
        tone="faint"
      />
      <path
        className="iso-line iso-flow"
        d={k.lineOnTop([20, 96], [20, 326], RAIL_H, P)}
        stroke="url(#cs-rail)"
        strokeWidth={1}
      />
      {ROLES.map((role, index) => {
        const y = 112 + 56 * index;
        const pill: Plan = { x: 10, y, w: 20, d: 40, r: 7 };
        const top = RAIL_H + PILL_H;
        const paths = k.slabOf(pill, RAIL_H, PILL_H, P, 4, 0.6);
        return (
          <g key={role.name}>
            <Line
              d={k.onTop(
                [
                  [16, y - 5],
                  [20, y - 9],
                  [24, y - 5],
                ],
                RAIL_H,
                P,
              )}
              tone="mid"
            />
            <Hued
              hue={role.hue}
              id={`cs-role-${index}`}
              className="iso-part"
              style={delayStyle(role.delay)}
            >
              {role.hue === "rose" ? (
                <Halo
                  id={`cs-role-${index}`}
                  shape={glowShape(pill, RAIL_H, PILL_H, 22)}
                  className="iso-seal iso-pulse"
                />
              ) : null}
              <Solid paths={paths} tone="mid" crease="faint" />
              {role.hue === "rose" ? (
                <Glow className="iso-seal iso-pulse">
                  <Solid paths={paths} tone="hi" crease="faint" />
                </Glow>
              ) : (
                <path
                  className="iso-line iso-trace iso-wave"
                  d={paths.outline + paths.crease}
                />
              )}
              <Label
                matrix={k.topMatrix([22.1, y + 40], top, P, "y")}
                x={20}
                size={5.2}
                anchor="middle"
                className="iso-name"
              >
                {role.name.toUpperCase()}
              </Label>
            </Hued>
          </g>
        );
      })}
      <Hued
        hue="rose"
        id="cs-token"
        className="iso-token"
        style={
          {
            "--dx": `${TOKEN_FROM[0]}px`,
            "--dy": `${TOKEN_FROM[1]}px`,
          } as React.CSSProperties
        }
      >
        <Halo
          id="cs-token"
          shape={glowShape(
            { x: 15, y: 98, w: 10, d: 10, r: 0 },
            RAIL_H + PILL_H,
            2.5,
            22,
          )}
          className=""
        />
        <Glow>
          <Solid
            paths={k.cylinder(20, 103, 5, RAIL_H + PILL_H, 2.5, P, 24, 0.4)}
            tone="hi"
            crease="faint"
          />
        </Glow>
      </Hued>
    </g>
  );
}

function Terrace({ index }: { index: number }) {
  const z = trayZ(index) + TRAY_H;
  const front = trayPlan(index).x + trayPlan(index).w;
  const dots = k.pointsAt(
    [-1, 1].map((side): Point3 => [
      front - 4,
      side * (trayPlan(index).d / 2 - 4),
      z,
    ]),
    P,
  );

  if (index === 0) {
    const photo: Plan = { x: 44, y: 36, w: 12, d: 26, r: 1.5 };
    const note: Plan = { x: 44, y: -34, w: 12, d: 30, r: 1.5 };
    return (
      <g>
        {card(photo, z)}
        <Line
          d={k.onTop(
            [
              [54, 40],
              [54, 58],
              [46, 49],
            ],
            z + 1.2,
            P,
            true,
          )}
          tone="mid"
        />
        {card(note, z)}
        {rules(47, [[-9, -29]], z + 1.2)}
        {rules(50, [[-9, -29]], z + 1.2)}
        {rules(53, [[-9, -22]], z + 1.2)}
        <Line d={k.ring(50, 10, 5, z, P, 20)} tone="faint" />
        <Line d={k.ring(50, 10, 2.6, z, P, 16)} tone="mid" />
        <Dots points={k.pointsAt([[50, 10, z]], P)} size={0.8} />
        <Dots points={dots} size={0.5} />
      </g>
    );
  }

  if (index === 1) {
    const draft: Plan = { x: 24, y: 24, w: 12, d: 34, r: 1.5 };
    const decision: Plan = { x: 24, y: -58, w: 12, d: 34, r: 1.5 };
    return (
      <g>
        {card(draft, z, true)}
        {rules(28, [[28, 52]], z)}
        {rules(32, [[28, 46]], z)}
        {card(decision, z)}
        <Line
          d={k.onTop(
            [
              [27, -45],
              [30, -41],
              [34, -52],
            ],
            z + 1.2,
            P,
          )}
          tone="hi"
        />
        <Line d={k.lineOnTop([30, 24], [30, -24], z, P)} tone="mid" />
        <Line
          d={k.onTop(
            [
              [27, -20],
              [30, -24],
              [33, -20],
            ],
            z,
            P,
          )}
          tone="mid"
        />
        <Dots points={dots} size={0.5} />
      </g>
    );
  }

  if (index === 2) {
    return (
      <g>
        {[-32, 0, 32].map((y) => (
          <g key={y}>
            <Line d={k.ring(10, y, 5, z, P, 20)} tone="lo" />
            <Line d={k.ring(10, y, 3.4, z, P, 16)} tone="faint" />
          </g>
        ))}
        <Solid
          paths={k.cylinder(10, 0, 3, z, 2, P, 20, 0.3)}
          tone="hi"
          crease="faint"
        />
        <Dots points={dots} size={0.5} />
      </g>
    );
  }

  const before: Plan = { x: -16, y: 20, w: 12, d: 26, r: 1.5 };
  const after: Plan = { x: -16, y: -46, w: 12, d: 26, r: 1.5 };
  return (
    <g>
      {card(before, z)}
      {card(after, z)}
      <Label
        matrix={k.topMatrix([-8.7, 46], z + 1.2, P, "y")}
        x={13}
        size={2.6}
        anchor="middle"
      >
        BEFORE
      </Label>
      <Label
        matrix={k.topMatrix([-8.7, -20], z + 1.2, P, "y")}
        x={13}
        size={2.6}
        anchor="middle"
      >
        AFTER
      </Label>
      <Line d={k.lineOnTop([-10, 20], [-10, -20], z, P)} tone="mid" />
      <Line
        d={k.onTop(
          [
            [-13, -16],
            [-10, -20],
            [-7, -16],
          ],
          z,
          P,
        )}
        tone="mid"
      />
      <Dots points={dots} size={0.5} />
    </g>
  );
}

function SupervisorDeck() {
  const z = trayZ(4) + TRAY_H;
  const knob = k.cylinder(-40, -17, 7.5, z, 3, P, 36, 0.4);
  const plate: Plan = { x: -58, y: -40, w: 6, d: 80, r: 1 };
  const corners = k.pointsAt(
    [
      [-56, -42, z],
      [-56, 42, z],
      [-24, -42, z],
      [-24, 42, z],
    ],
    P,
  );
  return (
    <g>
      <Solid
        paths={k.slabOf(plate, z, 0.8, P, 2)}
        tone="lo"
        crease="none"
        flat
      />
      <Label
        matrix={k.topMatrix([-54.6, 40], z + 0.8, P, "y")}
        x={40}
        size={2.6}
        anchor="middle"
      >
        ONLY A SUPERVISOR CLOSES
      </Label>
      <g
        className="iso-accept"
        data-accept=""
        role="button"
        tabIndex={0}
        aria-label="Accept the completed work and close the ticket"
      >
        <path
          className="iso-line iso-call"
          d={k.ring(-40, -17, 10, z, P, 36)}
        />
        <path
          className="iso-line iso-burst"
          d={k.ring(-40, -17, 10, z, P, 36)}
        />
        <Halo
          id="cs-tray-4"
          shape={glowShape(
            { x: -47.5, y: -24.5, w: 15, d: 15, r: 0 },
            z,
            3,
            22,
          )}
          className="iso-seal iso-pulse"
        />
        <g className="iso-knob">
          <Solid paths={knob} tone="hi" crease="faint" />
          <Glow className="iso-seal iso-pulse">
            <Solid paths={knob} tone="hi" crease="faint" />
          </Glow>
          <Line d={k.knurl(-40, -17, 7.5, z, z + 3, 30, P, 0.3)} tone="lo" />
          <Line
            d={k.onTop(
              [
                [-43.5, -18.5],
                [-41.5, -15.5],
                [-36.5, -20.5],
              ],
              z + 3,
              P,
            )}
            tone="hi"
          />
        </g>
      </g>
      <Solid
        paths={k.cylinder(-40, 17, 7.5, z, 3, P, 36, 0.4)}
        tone="mid"
        crease="faint"
      />
      <Line d={k.knurl(-40, 17, 7.5, z, z + 3, 30, P, 0.3)} tone="lo" />
      <Line d={k.lineOnTop([-43, 14], [-37, 20], z + 3, P)} tone="mid" />
      <Line d={k.lineOnTop([-43, 20], [-37, 14], z + 3, P)} tone="mid" />
      <Dots points={corners} size={0.5} />
    </g>
  );
}

function Tray({ index, stage }: { index: number; stage: Stage }) {
  const plan = trayPlan(index);
  const z = trayZ(index);
  const front = plan.x + plan.w;
  const lit = index === TOP;
  const seam = k.sideSeam(plan, z + 11, P, TRAY_STEPS);
  const paths = k.slabOf(plan, z, TRAY_H, P, TRAY_STEPS, 0.8);
  const delay = trayDelay(index);
  return (
    <Hued
      hue={stage.hue}
      id={`cs-tray-${index}`}
      className="iso-part"
      style={delayStyle(delay)}
    >
      <Solid
        paths={paths}
        tone="hi"
        crease="faint"
        inner={<Line d={seam} tone="faint" />}
      />
      {lit ? (
        <Glow className="iso-seal iso-pulse">
          <Solid paths={paths} tone="hi" crease="faint" />
        </Glow>
      ) : (
        <path
          className="iso-line iso-trace iso-wave"
          d={paths.outline + paths.crease}
        />
      )}
      <Label
        matrix={k.sideMatrix([front, plan.y + plan.d], z, P, "right")}
        x={8}
        y={-3.6}
        size={5.4}
        className="iso-name"
      >
        {stage.name}
      </Label>
      <Label
        matrix={k.sideMatrix([front, plan.y + plan.d], z, P, "right")}
        x={plan.d - 8}
        y={-3.6}
        size={3.4}
        anchor="end"
      >
        {stage.status}
      </Label>
      {lit ? <SupervisorDeck /> : <Terrace index={index} />}
    </Hued>
  );
}

export function CaseStack() {
  return (
    <CaseStackFrame>
      <svg
        className="iso-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="group"
        aria-label="Five trays rising from report to verified closure, fed by a rail carrying the reporter, operator, technician and supervisor roles. Only the supervisor's accept knob on the top tray closes the work."
        focusable="false"
      >
        <defs>
          <radialGradient
            id="cs-fade-gradient"
            gradientUnits="userSpaceOnUse"
            cx={WIDTH / 2}
            cy={HEIGHT / 2}
            r={WIDTH * 0.58}
          >
            <stop offset="0.6" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <mask
            id="cs-fade"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={WIDTH}
            height={HEIGHT}
          >
            <rect width={WIDTH} height={HEIGHT} fill="url(#cs-fade-gradient)" />
          </mask>
          <linearGradient
            id="cs-rail"
            gradientUnits="userSpaceOnUse"
            x1={RAIL_FLOW.from[0]}
            y1={RAIL_FLOW.from[1]}
            x2={RAIL_FLOW.to[0]}
            y2={RAIL_FLOW.to[1]}
          >
            <stop
              offset="0"
              style={{ stopColor: "var(--iso-mid)" }}
              stopOpacity="0"
            />
            <stop offset="1" style={{ stopColor: "var(--iso-mid)" }} />
          </linearGradient>
        </defs>
        <g mask="url(#cs-fade)">
          <path className="iso-grid" d={GRID} />
          <Plinth />
          <Rail />
          {STAGES.map((stage, index) => (
            <Tray key={stage.status} index={index} stage={stage} />
          ))}
          <Hued hue="rose" id="cs-bloom" style={delayStyle(trayDelay(TOP))}>
            <Halo
              id="cs-bloom"
              shape={glowShape(trayPlan(TOP), trayZ(TOP), TRAY_H, 48)}
              className="iso-seal iso-pulse"
            />
          </Hued>
        </g>
      </svg>
    </CaseStackFrame>
  );
}
