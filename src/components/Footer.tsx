import React from "react";
import { Separator } from "./ui/separator";
import { Handshake } from "lucide-react";
import { FooterProps } from "@/types";



export default function Footer({ buildDate }: FooterProps) {
  return (
    <section className="flex flex-col w-full md:1/2 pt-8 min-h-30">
      <Separator className="" />
      <div className="pt-4 flex gap-2 items-center">
        <Handshake strokeWidth={1} size={16} color={"#7C5CFF"} />
        <p className="text-sm font-sans text-forground">CanTheySponsor</p>
      </div>

      <p className="pt-2 pb-6 font-mono text-xs text-muted-foreground">
        Contains public sector information licensed under the
        <a
          href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-primary text-foreground font-medium"
        >
          &nbsp;Open Government Licence v3.0
        </a>
        .
        <a href="/" className="text-primary font-medium">
          &nbsp;CanTheySponsor
        </a>{" "}
        is a free, independent search tool that makes the UK Home Office's
        register of licensed sponsors instantly searchable; not affiliated with, endorsed by, or connected to the UK Home Office or any UK Government department. Source:{" "}
        <a
          href="https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-primary text-foreground font-medium"
        >
          &nbsp;Register of licensed sponsors (workers)
        </a>
        . Pipeline build{" "}
        <span className="build-date">{buildDate}</span>.
      </p>
    </section>
  );
}
