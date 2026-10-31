import type { TicketDetail } from "@streetproof/db";

import { getI18n } from "@/lib/i18n/server";
import { getStorage } from "@/lib/storage";

type Region = TicketDetail["damageRegions"][number];

function Outline({ region }: { region: Region }) {
  const { left, top, right, bottom } = region;
  return (
    <>
      {region.maskPath ? (
        <path
          d={region.maskPath}
          transform={`translate(${left} ${top})`}
          className="fill-brand/40"
        />
      ) : null}
      <rect
        x={left}
        y={top}
        width={right - left}
        height={bottom - top}
        vectorEffect="non-scaling-stroke"
        className="fill-none stroke-brand stroke-2"
      />
    </>
  );
}

// The photo keeps its own shape, so a frame stretched over it lines up exactly.
export async function DamageFigure({ regions }: { regions: Region[] }) {
  const first = regions[0];
  if (!first) return null;
  const { t } = await getI18n();
  const url = await getStorage().signedReadUrl(first.objectKey);

  return (
    <figure className="flex flex-col gap-2">
      <div className="relative overflow-hidden rounded-2xl">
        {/* A signed, short-lived URL from the private bucket. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={t("Report photo with the AI suggested area marked: {label}", {
            label: first.label,
          })}
          className="block w-full"
        />
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${first.frameWidth} ${first.frameHeight}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
        >
          {regions.map((region) => (
            <Outline key={region.id} region={region} />
          ))}
        </svg>
      </div>
      <figcaption className="type-caption text-muted-foreground">
        {t("AI suggested area: {label}. It's a pointer, not a measurement.", {
          label: first.label,
        })}
      </figcaption>
    </figure>
  );
}
