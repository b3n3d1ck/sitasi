import { Fragment } from "react";
import type { Part } from "@/lib/format";

export function CitationText({ parts }: { parts: Part[] }) {
  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? <Fragment key={i}>{p}</Fragment> : <i key={i}>{p.i}</i>,
      )}
    </>
  );
}
