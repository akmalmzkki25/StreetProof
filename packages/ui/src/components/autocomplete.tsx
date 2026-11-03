"use client";

import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";
import { cn } from "@streetproof/ui/lib/utils";

// Base UI's autocomplete, styled like Select: a quiet field and a floating list.
const Autocomplete = AutocompletePrimitive.Root;
const AutocompleteList = AutocompletePrimitive.List;

function AutocompleteInput({
  className,
  ...props
}: AutocompletePrimitive.Input.Props) {
  return (
    <AutocompletePrimitive.Input
      data-slot="autocomplete-input"
      className={cn(
        "h-full w-full min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteContent({
  className,
  children,
  hidden,
}: {
  className?: string;
  children: React.ReactNode;
  hidden?: boolean;
}) {
  return (
    <AutocompletePrimitive.Portal hidden={hidden}>
      <AutocompletePrimitive.Positioner
        sideOffset={4}
        align="start"
        className="z-50 w-(--anchor-width)"
      >
        <AutocompletePrimitive.Popup
          data-slot="autocomplete-content"
          className={cn(
            "max-h-72 origin-(--transform-origin) overflow-y-auto rounded-3xl bg-popover p-1.5 text-popover-foreground shadow-lg",
            className,
          )}
        >
          {children}
        </AutocompletePrimitive.Popup>
      </AutocompletePrimitive.Positioner>
    </AutocompletePrimitive.Portal>
  );
}

function AutocompleteItem({
  className,
  ...props
}: AutocompletePrimitive.Item.Props) {
  return (
    <AutocompletePrimitive.Item
      data-slot="autocomplete-item"
      className={cn(
        "cursor-default rounded-md px-3 py-2 text-sm outline-none select-none data-highlighted:bg-accent",
        className,
      )}
      {...props}
    />
  );
}

export {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
};
