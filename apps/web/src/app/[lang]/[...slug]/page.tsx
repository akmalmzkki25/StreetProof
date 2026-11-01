import { notFound } from "next/navigation";
import { Suspense } from "react";

// Every address under a language that has no page of its own: /en/missing,
// /en/app/missing, /en/login/extra. notFound() has to run inside Suspense.
// Thrown before the shell streams, the response is a hard 404, and the browser
// reloads that address without stopping.
export default function UnknownPage() {
  return (
    <Suspense fallback={null}>
      <Missing />
    </Suspense>
  );
}

function Missing(): never {
  notFound();
}
