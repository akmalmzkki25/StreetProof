"use client";

import { useState } from "react";

// The supervisor's accept knob is the only control. CSS reads data-closed.
export function CaseStackFrame({ children }: { children: React.ReactNode }) {
  const [closed, setClosed] = useState(false);

  function isAccept(target: EventTarget) {
    return (
      target instanceof Element && target.closest("[data-accept]") !== null
    );
  }

  return (
    <div
      className="iso hidden md:block"
      data-closed={closed ? "" : undefined}
      onClick={(event) => {
        if (isAccept(event.target)) setClosed((value) => !value);
      }}
      onKeyDown={(event) => {
        if (
          (event.key === "Enter" || event.key === " ") &&
          isAccept(event.target)
        ) {
          event.preventDefault();
          setClosed((value) => !value);
        }
      }}
    >
      {children}
    </div>
  );
}
