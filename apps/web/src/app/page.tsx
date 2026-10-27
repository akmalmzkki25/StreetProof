import Link from "next/link";

import { Button } from "@streetproof/ui/components/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-8 px-4 py-16">
      <div className="flex flex-col gap-4">
        <p className="type-label-mono text-muted-foreground">StreetProof</p>
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
    </main>
  );
}
