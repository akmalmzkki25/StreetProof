import QRCode from "qrcode";

// Drawn as one SVG path from the code's modules, so no generated markup is
// injected and it stays sharp at any print size.
export function QrCode({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const { modules } = QRCode.create(value, { errorCorrectionLevel: "M" });
  const quietZone = 2;
  const size = modules.size + quietZone * 2;
  let path = "";
  for (let row = 0; row < modules.size; row += 1) {
    for (let column = 0; column < modules.size; column += 1) {
      if (modules.get(row, column)) {
        path += `M${column + quietZone} ${row + quietZone}h1v1h-1z`;
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className={className}
    >
      <rect width={size} height={size} fill="#ffffff" />
      <path d={path} fill="#000000" />
    </svg>
  );
}
