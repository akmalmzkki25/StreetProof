import type { SolidPaths, Tone, LineTone, Flat } from "./iso-kit";

export type Hue = "rose" | "blue" | "amber" | "green" | "cyan";

interface HuedProps {
  hue: Hue;
  id: string;
  className?: string;
  style?: React.CSSProperties | undefined;
  children: React.ReactNode;
}

// Gives its children one hue pair and the gradient that paints a Glow. The body stays neutral.
export function Hued({ hue, id, className, style, children }: HuedProps) {
  const paint = {
    ...style,
    "--glow-fill": `url(#${id}-glow)`,
  } as React.CSSProperties;
  return (
    <g
      className={`iso-hue-${hue}${className ? ` ${className}` : ""}`}
      style={paint}
    >
      <defs>
        <radialGradient
          id={`${id}-glow`}
          cx="0.5"
          cy="0.5"
          r="0.5"
          fx="0.34"
          fy="0.3"
        >
          <stop offset="0" className="iso-glow-hot" />
          <stop offset="0.5" className="iso-glow-body" />
          <stop offset="1" className="iso-glow-edge" />
        </radialGradient>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" className="iso-halo-core" />
          <stop offset="0.55" className="iso-halo-mid" />
          <stop offset="0.8" className="iso-halo-fade" />
          <stop offset="1" className="iso-halo-rim" />
        </radialGradient>
      </defs>
      {children}
    </g>
  );
}

export interface HaloShape {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  angle: number;
}

// Light spilling past a glowing part. An ellipse whose own gradient reaches zero at its edge, so nothing is cropped.
// A gradient, not a blur filter, so Safari and Firefox paint it the same.
export function Halo({
  id,
  shape,
  className,
}: {
  id: string;
  shape: HaloShape;
  className: string;
}) {
  const { cx, cy, rx, ry, angle } = shape;
  return (
    <ellipse
      className={`iso-halo ${className}`}
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      transform={`rotate(${angle} ${cx} ${cy})`}
      fill={`url(#${id}-halo)`}
    />
  );
}

export function Glow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <g className={className ? `iso-glow ${className}` : "iso-glow"}>
      {children}
    </g>
  );
}

interface SolidProps {
  paths: SolidPaths;
  tone?: Tone;
  crease?: Tone | "none";
  flat?: boolean;
  inner?: React.ReactNode;
}

export function Solid({
  paths,
  tone = "hi",
  crease = "faint",
  flat = false,
  inner,
}: SolidProps) {
  return (
    <g className="iso-solid">
      <path className="iso-fill" d={paths.fill} />
      {flat
        ? null
        : paths.shades.map((d, shade) =>
            d ? (
              <path
                key={shade}
                className="iso-shade"
                data-shade={shade}
                d={d}
              />
            ) : null,
          )}
      {flat ? null : <path className="iso-top" d={paths.top} />}
      {crease === "none" || !paths.crease ? null : (
        <path
          className="iso-line iso-crease"
          data-tone={crease}
          d={paths.crease}
        />
      )}
      {crease === "none" || !paths.bevel ? null : (
        <path
          className="iso-line iso-bevel"
          data-tone={crease}
          d={paths.bevel}
        />
      )}
      {inner}
      <path className="iso-line iso-edge" data-tone={tone} d={paths.outline} />
    </g>
  );
}

interface LineProps {
  d: string;
  tone?: LineTone;
  dashed?: boolean;
}

export function Line({ d, tone = "lo", dashed = false }: LineProps) {
  if (!d) return null;
  return (
    <path
      className="iso-line"
      data-tone={tone}
      data-dashed={dashed ? "" : undefined}
      d={d}
    />
  );
}

export function Dots({
  points,
  size = 0.5,
}: {
  points: Flat[];
  size?: number;
}) {
  return (
    <g className="iso-dots">
      {points.map(([x, y], index) => (
        <circle
          key={index}
          cx={Math.round(x * 10) / 10}
          cy={Math.round(y * 10) / 10}
          r={size}
        />
      ))}
    </g>
  );
}

interface LabelProps {
  matrix: string;
  x?: number;
  y?: number;
  size: number;
  anchor?: "start" | "middle" | "end";
  className?: string;
  children: React.ReactNode;
}

// Safari rounds very small SVG font sizes, so the text is drawn 10x larger in a 0.1-scaled frame.
export function Label({
  matrix,
  x = 0,
  y = 0,
  size,
  anchor = "start",
  className,
  children,
}: LabelProps) {
  return (
    <text
      className={className ? `iso-text ${className}` : "iso-text"}
      transform={`${matrix} scale(0.1)`}
      x={x * 10}
      y={y * 10}
      fontSize={size * 10}
      textAnchor={anchor}
    >
      {children}
    </text>
  );
}
