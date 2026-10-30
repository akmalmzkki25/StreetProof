import Link from "next/link";

import { Button } from "@streetproof/ui/components/button";

import { CaseStack } from "@/components/case-stack";
import { ModeToggle } from "@/components/mode-toggle";
import { StreetProofMark } from "@/components/street-proof-mark";

// The seeded synthetic site. A real tenant shares its own site's report link.
const DEMO_INTAKE_CODE = "graha-tower-a";

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-16 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <StreetProofMark className="shrink-0" />
              <p className="font-heading text-sm font-medium tracking-tight text-foreground">
                StreetProof
              </p>
            </div>
            <h1 className="type-display">
              Reports become
              <br />
              <span className="text-muted-foreground">repair work.</span>
            </h1>
            <p className="max-w-xl type-lead text-muted-foreground">
              Facility damage reports turn into assigned tickets with completion
              evidence and supervisor-controlled closure. AI drafts; people
              decide.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button nativeButton={false} render={<Link href="/login" />}>
              Sign in
            </Button>
            <Button
              variant="secondary"
              nativeButton={false}
              render={<Link href={`/report/${DEMO_INTAKE_CODE}`} />}
            >
              Try the report form
            </Button>
          </div>
        </div>
        <CaseStack />
      </main>
      <div className="flex justify-end px-4 pb-4 sm:px-8">
        <ModeToggle />
      </div>
    </div>
  );
}
