import { cn } from "@/lib/utils";

import { ColorPair } from "./color-pair";
import { ShowcaseBlock, ShowcaseSection } from "./showcase-section";

const colorPairs = [
  { name: "Page", background: "background", foreground: "foreground" },
  { name: "Panel", background: "card", foreground: "card-foreground" },
  { name: "Popover", background: "popover", foreground: "popover-foreground" },
  { name: "Primary pill", background: "primary", foreground: "primary-foreground" },
  { name: "Brand rose", background: "brand", foreground: "brand-foreground" },
  { name: "Secondary", background: "secondary", foreground: "secondary-foreground" },
  { name: "Muted", background: "muted", foreground: "muted-foreground" },
  { name: "Raised panel", background: "surface-raised", foreground: "foreground" },
  { name: "Brand text on page", background: "background", foreground: "brand-text" },
  { name: "Destructive on page", background: "background", foreground: "destructive" },
  { name: "Faint text on page", background: "background", foreground: "faint-foreground" },
];

const paletteGroups = [
  {
    name: "Surfaces",
    swatches: [
      { name: "Page", token: "background" },
      { name: "Panel", token: "card" },
      { name: "Raised", token: "surface-raised" },
      { name: "Hover wash", token: "accent" },
    ],
  },
  {
    name: "Ink and brand",
    swatches: [
      { name: "Ink", token: "foreground" },
      { name: "Muted ink", token: "muted-foreground" },
      { name: "Faint ink", token: "faint-foreground" },
      { name: "Primary pill", token: "primary" },
      { name: "Rose", token: "brand" },
      { name: "Rose text", token: "brand-text" },
      { name: "Destructive", token: "destructive" },
    ],
  },
  {
    name: "Lines and charts",
    swatches: [
      { name: "Hairline", token: "border" },
      { name: "Input", token: "input" },
      { name: "Rule", token: "rule" },
      { name: "Ring", token: "ring" },
      { name: "Chart 1", token: "chart-1" },
      { name: "Chart 2", token: "chart-2" },
      { name: "Chart 3", token: "chart-3" },
      { name: "Chart 4", token: "chart-4" },
      { name: "Chart 5", token: "chart-5" },
    ],
  },
];

const typeTokens = [
  {
    token: "type-display",
    spec: "40–64px / 1 / 510 / -0.022em · Inter",
    use: "Page hero",
    className: "type-display",
    sample: "Every report, one trail.",
  },
  {
    token: "type-headline",
    spec: "32–48px / 1 / 510 / -0.022em · Inter",
    use: "Section heads",
    className: "type-headline",
    sample: "Close the open tickets",
  },
  {
    token: "type-title",
    spec: "20px / 1.3 / 590 · Inter",
    use: "Card and block titles",
    className: "type-title",
    sample: "Lobby lights · B2",
  },
  {
    token: "type-lead",
    spec: "18–24px / 1.33 / 400 · Inter",
    use: "Intro paragraphs",
    className: "type-lead",
    sample: "Photo and location look complete; assign a technician.",
  },
  {
    token: "body",
    spec: "15px / 1.6 / 400 / -0.011em · Inter",
    use: "Body copy",
    className: "",
    sample: "The report has two photos and a clear location pin.",
  },
  {
    token: "type-caption",
    spec: "13px / 1.5 · Inter, muted",
    use: "UI, meta and help text",
    className: "type-caption text-muted-foreground",
    sample: "Updated 12 minutes ago",
  },
  {
    token: "type-label-mono",
    spec: "11px uppercase · Geist Mono",
    use: "IDs, dates, figure captions",
    className: "type-label-mono text-muted-foreground",
    sample: "TK-0142 · Oct 20",
  },
];

const radiusSteps = [
  { token: "rounded-sm", value: "4px", use: "Inline code, tags", className: "rounded-sm" },
  { token: "rounded-md", value: "6px", use: "Menu items, sidebar rows", className: "rounded-md" },
  {
    token: "rounded-2xl",
    value: "8px",
    use: "Fields, alerts, small cards",
    className: "rounded-2xl",
  },
  { token: "rounded-3xl", value: "12px", use: "Popovers, menus", className: "rounded-3xl" },
  { token: "rounded-4xl", value: "12px", use: "Cards, dialogs, panels", className: "rounded-4xl" },
  {
    token: "rounded-full",
    value: "9999px",
    use: "Buttons, badges, nav links",
    className: "rounded-full",
  },
];

const elevationSteps = [
  { token: "bg-card", use: "Panel, one step up", className: "bg-card" },
  { token: "shadow-card", use: "Flat panels (hairline)", className: "bg-card shadow-card" },
  { token: "shadow-inset", use: "Raised inner panel", className: "bg-surface-raised shadow-inset" },
  { token: "glass", use: "Sticky header only", className: "glass border" },
  { token: "shadow-lg", use: "Floating windows, menus", className: "bg-card shadow-lg" },
];

const motionTokens = [
  { token: "duration", value: "160ms", use: "Every color fade (default)" },
  { token: "ease-out", value: "cubic-bezier(.25, .46, .45, .94)", use: "All motion" },
  { token: "ease-in-out", value: "cubic-bezier(.77, 0, .175, 1)", use: "Move or resize on screen" },
  { token: "pressable", value: "scale 0.97 · 160ms", use: "Press feedback on pointer-down" },
  { token: "rise-in", value: "640ms · 12px", use: "Hero only, once, 80ms stagger" },
  { token: "blur-in", value: "700ms · 8px blur", use: "Hero headline only, once, 60ms per word" },
];

export function FoundationsSection() {
  return (
    <ShowcaseSection
      id="foundations"
      title="Foundations"
      description="Near-black dark layers, warm cream light paper, three greys, one rose accent. Every pair below shows its live contrast."
    >
      <ShowcaseBlock
        title="Color roles"
        description="Each surface with its text color. Small text needs AA (4.5:1)."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {colorPairs.map((pair) => (
            <ColorPair key={pair.name} {...pair} />
          ))}
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock title="Palette">
        <div className="flex flex-col gap-6">
          {paletteGroups.map((group) => (
            <div key={group.name} className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-foreground">{group.name}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                {group.swatches.map((swatch) => (
                  <div key={swatch.token} className="flex flex-col gap-2">
                    <div
                      className="h-16 rounded-2xl ring-1 ring-border"
                      style={{ backgroundColor: `var(--${swatch.token})` }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{swatch.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {swatch.token}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        title="Typography"
        description="Inter at 510 for headings and UI, Geist Mono for data. Never bold, never uppercase headings."
      >
        <div className="flex flex-col divide-y rounded-4xl bg-card px-6 shadow-card">
          {typeTokens.map((type) => (
            <div
              key={type.token}
              className="grid gap-2 py-5 md:grid-cols-[12rem_1fr] md:items-baseline md:gap-6"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs text-foreground">{type.token}</span>
                <span className="text-xs text-muted-foreground">{type.use}</span>
                <span className="text-xs text-muted-foreground">{type.spec}</span>
              </div>
              <p className={cn("truncate", type.className)}>{type.sample}</p>
            </div>
          ))}
        </div>
        <p className="max-w-prose text-sm leading-relaxed text-foreground">
          <strong className="font-medium">Reports become repair work.</strong> StreetProof turns
          facility damage reports into assigned tickets with evidence. Open{" "}
          <a href="#recipes" className="font-medium text-brand-text underline underline-offset-4">
            the ticket card
          </a>{" "}
          to see the advice, or copy the ticket ID <code className="font-mono">TK-0142</code> to share
          it with your team.
        </p>
      </ShowcaseBlock>

      <div className="grid gap-10 lg:grid-cols-2">
        <ShowcaseBlock
          title="Radius"
          description="Pills for controls, 12px for panels, small steps inside."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {radiusSteps.map((step) => (
              <div key={step.token} className="flex flex-col gap-2">
                <div className={cn("h-20 border border-brand/40 bg-brand/10", step.className)} />
                <span className="font-mono text-xs text-foreground">
                  {step.token} · {step.value}
                </span>
                <span className="text-xs text-muted-foreground">{step.use}</span>
              </div>
            ))}
          </div>
        </ShowcaseBlock>

        <ShowcaseBlock
          title="Elevation"
          description="Depth is a surface step plus a hairline. Only floating layers cast a shadow."
        >
          <div className="grid grid-cols-2 gap-6 rounded-4xl bg-background p-6 shadow-card sm:grid-cols-3">
            {elevationSteps.map((step) => (
              <div key={step.token} className="flex flex-col gap-2">
                <div className={cn("h-20 rounded-3xl", step.className)} />
                <span className="font-mono text-xs text-foreground">{step.token}</span>
                <span className="text-xs text-muted-foreground">{step.use}</span>
              </div>
            ))}
          </div>
        </ShowcaseBlock>
      </div>

      <ShowcaseBlock
        title="Motion"
        description="Hovers are color fades. Nothing bounces, nothing moves on scroll. Hover and press the tile to try it."
      >
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="flex flex-col divide-y rounded-4xl bg-card px-6 shadow-card">
            {motionTokens.map((motion) => (
              <div key={motion.token} className="grid grid-cols-[8rem_1fr] gap-4 py-3 text-sm">
                <span className="font-mono text-xs text-foreground">{motion.token}</span>
                <span className="text-muted-foreground">
                  {motion.value} · {motion.use}
                </span>
              </div>
            ))}
          </div>
          <div className="size-24 pressable rounded-4xl bg-card shadow-card transition-[background-color,scale] hover:bg-surface-raised" />
        </div>
      </ShowcaseBlock>
    </ShowcaseSection>
  );
}
