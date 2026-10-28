import { ArrowUpRight } from "lucide-react";

import { Eyebrow, MaskReveal } from "@/components/ds";
import { teamIntro, teamMembers } from "@/content/team";
import { cn } from "@/lib/utils";
import { revealIndex, useReveal } from "@/motion";

export function Team() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} aria-labelledby="team-heading" className="container py-12 md:py-16">
      <header className="reveal-fade mb-10 max-w-2xl">
        <Eyebrow tone="link" className="mb-4">
          {teamIntro.eyebrow}
        </Eyebrow>
        <h2 id="team-heading" className="text-heading-1 mb-4 font-serif text-ink-strong">
          {teamIntro.heading}
        </h2>
        <p className="text-body-md text-steel">{teamIntro.description}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {teamMembers.map((member, i) => (
          <article
            key={member.name}
            style={revealIndex(i + 1)}
            className="group reveal-fade rounded-xl border border-hairline bg-canvas p-4"
          >
            <div className="aspect-square overflow-hidden rounded-xl bg-soft">
              <img
                src={member.image}
                alt={`Foto ${member.name} - ${member.role}`}
                loading="lazy"
                className={cn(
                  "size-full object-cover grayscale transition-[filter,transform] duration-[600ms] ease-out",
                  "group-hover:scale-[1.03] group-hover:grayscale-0 group-focus-within:scale-[1.03] group-focus-within:grayscale-0",
                  "motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-within:scale-100",
                  member.imagePosition,
                )}
              />
            </div>
            <div className="px-2 pb-2 pt-5">
              <h3 className="text-heading-5 mb-2 text-ink-strong">{member.name}</h3>
              <p className="text-eyebrow mb-3 text-link">{member.role}</p>
              <p className="text-body-sm mb-5 text-steel">{member.bio}</p>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`LinkedIn profile of ${member.name}`}
                className="inline-flex min-h-11 items-center gap-1 rounded-sm text-sm font-medium text-link focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <MaskReveal>LinkedIn</MaskReveal>
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
