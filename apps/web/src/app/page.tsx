import Link from "next/link";

import { Button } from "@streetproof/ui/components/button";

import { CaseStack } from "@/components/case-stack";
import { ModeToggle } from "@/components/mode-toggle";

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <main className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-4 py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:px-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <svg
                width="21"
                height="24"
                viewBox="0 0 21 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="shrink-0"
              >
                <g filter="url(#street-proof-mark-inner)">
                  <use href="#street-proof-mark-stroke" stroke="#0A0A0A" />
                  <use href="#street-proof-mark-stroke" stroke="#FEFEFE" strokeOpacity="0.4" />
                </g>
                <defs>
                  <filter
                    id="street-proof-mark-inner"
                    x="0"
                    y="0"
                    width="20.5"
                    height="24.5"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="1" />
                    <feGaussianBlur stdDeviation="0.75" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0"
                    />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
                  </filter>
                  <path
                    id="street-proof-mark-stroke"
                    d="M10.25 22.25C10.564 22.25 10.8559 22.1017 11.4394 21.8052L16.1342 19.4192C18.2114 18.3637 19.25 17.8358 19.25 17M10.25 22.25C9.93603 22.25 9.64415 22.1017 9.06065 21.8052L4.36576 19.4192C2.28859 18.3637 1.25 17.8358 1.25 17M10.25 22.25V11.75M19.25 17V6.5M19.25 17L14.75 14.375M19.25 6.5C19.25 5.66416 18.2114 5.13635 16.1342 4.08073L11.4401 1.69519C10.8561 1.39839 10.5641 1.25 10.25 1.25M19.25 6.5C19.25 7.3358 18.2114 7.86369 16.1342 8.9192L11.4401 11.3048C10.8566 11.6013 10.564 11.75 10.25 11.75M1.25 17V6.5M1.25 17L5.75 14.375M1.25 6.5C1.25 5.66416 2.28859 5.13635 4.36576 4.08073L9.05994 1.69519C9.64391 1.39839 9.9359 1.25 10.25 1.25M1.25 6.5C1.25 7.3358 2.28859 7.86369 4.36576 8.9192L9.05994 11.3048C9.64344 11.6013 9.93603 11.75 10.25 11.75M10.25 1.25V6.5"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </defs>
              </svg>
              <p className="font-heading text-sm font-medium tracking-tight text-foreground">
                Street Proof
              </p>
            </div>
            <h1 className="type-display">
              Reports become
              <br />
              <span className="text-muted-foreground">repair work.</span>
            </h1>
            <p className="max-w-xl type-lead text-muted-foreground">
              Facility damage reports turn into assigned tickets with completion evidence and
              supervisor-controlled closure. AI drafts; people decide.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button nativeButton={false} render={<Link href="/design-system" />}>
              Open design system
            </Button>
            <Button
              variant="secondary"
              nativeButton={false}
              render={<Link href="/design-system#recipes" />}
            >
              View ticket recipe
            </Button>
          </div>
        </div>
        <CaseStack />
      </main>
      <div className="flex justify-end px-4 pb-4 md:px-8">
        <ModeToggle />
      </div>
    </div>
  );
}
