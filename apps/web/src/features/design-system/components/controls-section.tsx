"use client";

import { Badge } from "@streetproof/ui/components/badge";
import { Button } from "@streetproof/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@streetproof/ui/components/field";
import { Input } from "@streetproof/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@streetproof/ui/components/input-group";
import { Checkbox } from "@streetproof/ui/components/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@streetproof/ui/components/select";
import { Spinner } from "@streetproof/ui/components/spinner";
import { Switch } from "@streetproof/ui/components/switch";
import { Textarea } from "@streetproof/ui/components/textarea";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { ShowcaseBlock, ShowcaseSection } from "./showcase-section";
import { StateMatrix, previewState } from "./state-matrix";

const buttonVariants = [
  "default",
  "brand",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;

const badgeVariants = [
  "default",
  "brand",
  "secondary",
  "outline",
  "destructive",
] as const;

const categories = [
  { label: "Lighting", value: "lighting" },
  { label: "Plumbing", value: "plumbing" },
  { label: "Safety", value: "safety" },
];

export function ControlsSection() {
  return (
    <>
      <ShowcaseSection
        id="actions"
        title="Actions"
        description="Pills only. The main action is the light pill. Rose marks state and small highlights."
      >
        <ShowcaseBlock
          title="Button"
          description="One light primary per group. Brand rose confirms a field action."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button>Assign technician</Button>
            <Button variant="brand">Verify closed</Button>
            <Button variant="secondary">Save draft</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
          <StateMatrix
            rows={buttonVariants}
            states={[
              "default",
              "hover",
              "focus",
              "active",
              "disabled",
              "loading",
            ]}
            render={(variant, state) => (
              <Button
                variant={variant}
                {...previewState(state)}
                disabled={state === "disabled" || state === "loading"}
              >
                {state === "loading" ? (
                  <Spinner data-icon="inline-start" />
                ) : null}
                Save ticket
              </Button>
            )}
          />
        </ShowcaseBlock>

        <ShowcaseBlock
          title="Badge"
          description="Status chips stay quiet. Brand is for good status."
        >
          <div className="flex flex-wrap items-center gap-3">
            {badgeVariants.map((variant) => (
              <Badge key={variant} variant={variant}>
                {variant}
              </Badge>
            ))}
          </div>
        </ShowcaseBlock>
      </ShowcaseSection>

      <ShowcaseSection
        id="inputs"
        title="Inputs"
        description="FieldGroup + Field layout. Validation uses data-invalid on the field and aria-invalid on the control."
      >
        <div className="grid gap-10 lg:grid-cols-2">
          <ShowcaseBlock title="Text fields">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <Input id="location" placeholder="Lobby · Level B2" />
                <FieldDescription>Where the damage was seen.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="notes">Notes</FieldLabel>
                <Textarea
                  id="notes"
                  placeholder="Broken fixture, still sparking."
                />
              </Field>
              <Field data-invalid>
                <FieldLabel htmlFor="phone">Reporter phone</FieldLabel>
                <Input id="phone" aria-invalid placeholder="+62…" />
                <FieldError>Enter a valid phone number.</FieldError>
              </Field>
            </FieldGroup>
          </ShowcaseBlock>

          <ShowcaseBlock title="Select, search, and switches">
            <FieldGroup>
              <Field>
                <FieldLabel>Category</FieldLabel>
                <Select defaultValue="lighting">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="search">Search tickets</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <HugeiconsIcon icon={Search01Icon} />
                  </InputGroupAddon>
                  <InputGroupInput id="search" placeholder="TK-0142" />
                </InputGroup>
              </Field>
              <Field orientation="horizontal">
                <Switch id="urgent" />
                <FieldLabel htmlFor="urgent">Mark as urgent</FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Checkbox id="photo" defaultChecked />
                <FieldLabel htmlFor="photo">Photos attached</FieldLabel>
              </Field>
            </FieldGroup>
          </ShowcaseBlock>
        </div>
      </ShowcaseSection>
    </>
  );
}
