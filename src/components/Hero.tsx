import { ArrowRight } from "lucide-react";
import React from "react";

export default function Hero() {
  return (
    <section className="mt-9 md:mt-14 lg:mt-16 mb-4 md:mb-6 lg:mb-8 flex flex-col gap-2 items-start">
      <h1 className="text-5xl md:text-6xl font-medium font-heading py-4">
        Can They <span className="text-accent">Sponsor</span>
      </h1>
      <p className="text-mono font-light text-muted-foreground flex gap-2 items-start justify-center">
        <ArrowRight strokeWidth={1} />
        Query the UK Home Office sponsor register at the speed of thought.{" "}
      </p>
    </section>
  );
}
