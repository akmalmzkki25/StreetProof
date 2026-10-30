"use client";

import { Badge } from "@streetproof/ui/components/badge";
import { Button } from "@streetproof/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@streetproof/ui/components/card";
import { Separator } from "@streetproof/ui/components/separator";

import { cn } from "@/lib/utils";

import { ShowcaseBlock, ShowcaseSection } from "./showcase-section";

function GuidelineExample({
  kind,
  rule,
  children,
}: {
  kind: "Do" | "Don't";
  rule: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-32 flex-wrap items-center justify-center gap-3 rounded-4xl bg-background p-6 ring-1 ring-foreground/5">
        {children}
      </div>
      <p className="text-sm">
        <span
          className={cn(
            "font-semibold",
            kind === "Do" ? "text-brand-text" : "text-destructive",
          )}
        >
          {kind}.
        </span>{" "}
        <span className="text-muted-foreground">{rule}</span>
      </p>
    </div>
  );
}

export function RecipesSection() {
  return (
    <>
      <ShowcaseSection
        id="guidelines"
        title="Do and don't"
        description="The rules that are easiest to break."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <GuidelineExample
            kind="Do"
            rule="Use the light pill for the main action. Rose marks state."
          >
            <Button>Assign technician</Button>
            <Badge variant="brand">Verified</Badge>
          </GuidelineExample>
          <GuidelineExample
            kind="Don't"
            rule="Fill large areas or every button with rose."
          >
            <Button variant="brand">Assign</Button>
            <Button variant="brand">Cancel</Button>
            <Button variant="brand">Export</Button>
          </GuidelineExample>
          <GuidelineExample
            kind="Do"
            rule="Put arrows on quiet text links next to the button."
          >
            <Button>Open ticket</Button>
            <Button variant="link">View evidence →</Button>
          </GuidelineExample>
          <GuidelineExample
            kind="Don't"
            rule="Put arrows or icons inside pill buttons."
          >
            <Button>Open ticket →</Button>
          </GuidelineExample>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        id="recipes"
        title="Recipes"
        description="A ticket card using the installed subset."
      >
        <ShowcaseBlock title="Ticket card">
          <Card className="max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="type-title">Lobby lights · B2</CardTitle>
                <Badge variant="brand">In progress</Badge>
              </div>
              <CardDescription>
                Reported broken fixture still sparking near the east stair.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ticket</span>
                <span className="font-mono text-xs">TK-0142</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span>Lighting</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="secondary">Need info</Button>
              <Button>Assign</Button>
            </CardFooter>
          </Card>
        </ShowcaseBlock>
      </ShowcaseSection>
    </>
  );
}
