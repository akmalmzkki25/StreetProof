"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@streetproof/ui/components/dialog";
import { cn } from "@streetproof/ui/lib/utils";
import { useState } from "react";

type LightboxPhoto = { id: string; url: string; alt: string };

const PHOTO_EDGE =
  "outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10";

export function PhotoLightbox({
  photos,
  className,
}: {
  photos: LightboxPhoto[];
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<LightboxPhoto | null>(null);

  function openPhoto(photo: LightboxPhoto) {
    setSelected(photo);
    setIsOpen(true);
  }

  return (
    <>
      <div className={cn("grid gap-3", className)}>
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            aria-haspopup="dialog"
            onClick={() => openPhoto(photo)}
            className="pressable cursor-zoom-in rounded-2xl [-webkit-tap-highlight-color:transparent] outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.alt}
              loading="lazy"
              className={cn(
                "aspect-square w-full rounded-2xl object-cover",
                PHOTO_EDGE,
              )}
            />
          </button>
        ))}
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="gap-0 rounded-[20px] p-3 sm:max-w-4xl">
          <DialogTitle className="sr-only">{selected?.alt}</DialogTitle>
          {selected ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selected.url}
              alt={selected.alt}
              className={cn(
                "mx-auto block h-auto max-h-[80svh] w-auto max-w-full rounded-2xl",
                PHOTO_EDGE,
              )}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
