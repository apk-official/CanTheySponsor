/**
 * Hero.tsx
 *
 * Page headline and strapline.
 *
 * FIX: `text-mono` is not a Tailwind utility class — it has no effect.
 * The correct class for IBM Plex Mono is `font-mono`.
 */

import { ArrowRight } from "lucide-react";
import React from "react";

export default function Hero() {
  return (
    <section className="mt-9 md:mt-14 lg:mt-16 mb-4 md:mb-6 lg:mb-8 flex flex-col gap-2 items-start">
      <h1 className="text-5xl md:text-6xl font-medium font-heading py-4">
        Can They <span className="text-accent">Sponsor</span>
      </h1>
      <p className="font-mono font-light text-muted-foreground flex gap-2 items-start justify-center text-xs">
        <ArrowRight strokeWidth={1} />
        <p>
          CanTheySponsor lets you instantly search the UK Home Office's{" "}
        <a
          href="https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline decoration-primary underline-offset-2"
        >
          Register of Licensed Sponsors
        </a>{" "}
        — over 140,000 organisations approved to sponsor overseas workers on the
        Skilled Worker visa and other routes. Free, no login required, updated daily.
        </p>
        
      </p>
    </section>
  );
}