import { Icon } from '../components/Icon.tsx'
import { PageIntro } from '../components/PageIntro.tsx'
import { Reveal } from '../components/Reveal.tsx'
import { SafeLink } from '../components/SafeLink.tsx'
import { usePageTitle } from '../components/usePageTitle.ts'
import { useContent } from '../content/ContentContext.tsx'
import type { PrivacySection } from '../content/types.ts'

export function PrivacyPage() {
  const { content } = useContent()
  const privacy = content.privacy
  const label = content.nav.find((n) => n.id === 'privacy-policy')?.label
  usePageTitle(label ?? privacy.title)

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-br from-primary-container/10 via-transparent to-secondary/5 pointer-events-none" aria-hidden="true" />
      <div className="relative max-w-4xl mx-auto w-full px-4 sm:px-gutter pt-32 md:pt-40 pb-16 md:pb-24">
        <PageIntro badge={privacy.badge} meta={privacy.updated} title={privacy.title} intro={privacy.intro} />

        <Reveal className="mt-10 md:mt-14">
          <article className="bg-surface-container rounded-3xl p-6 sm:p-10 border border-white/5 flex flex-col">
            {privacy.sections.map((section, i) => (
              <Section key={i} id={`privacy-${i + 1}`} number={i + 1} section={section} />
            ))}
          </article>
        </Reveal>
      </div>
    </div>
  )
}

function Section({ id, number, section }: { id: string; number: number; section: PrivacySection }) {
  return (
    <section id={id} className="scroll-mt-10 py-8 first:pt-0 last:pb-0 border-t border-white/[0.06] first:border-t-0">
      <h2 className="flex items-center gap-3 font-headline text-headline-sm mb-5">
        <span className="w-8 h-8 shrink-0 rounded-full bg-primary-container text-on-primary-container text-body-sm font-bold flex items-center justify-center shadow-[0_0_12px_rgba(160,120,255,0.4)]">
          {number}
        </span>
        {section.title}
      </h2>

      <div className="flex flex-col gap-4 text-body-md text-on-surface-variant">
        {section.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}

        {section.bullets.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {section.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <Icon name="check_circle" className="!text-[20px] text-primary shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {section.cards.length > 0 && (
          <div className="flex flex-col gap-3">
            {section.cards.map((card, i) => (
              <div key={i} className="rounded-xl bg-surface-container-high/70 p-4 border border-white/5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h3 className="font-medium text-on-surface">{card.title}</h3>
                  {card.badge && <span className="px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-label-md">{card.badge}</span>}
                </div>
                <p className="text-body-sm">{card.text}</p>
              </div>
            ))}
          </div>
        )}

        {section.buttonLabel && (
          <SafeLink
            href={section.buttonUrl}
            className="self-start inline-flex items-center gap-2 mt-2 px-6 py-3 rounded-full bg-primary text-on-primary font-medium hover:shadow-[0_0_20px_rgba(208,188,255,0.45)] transition-shadow"
          >
            <Icon name={/^https?:\/\//i.test(section.buttonUrl) ? 'open_in_new' : 'mail'} className="!text-[20px]" />
            {section.buttonLabel}
          </SafeLink>
        )}
      </div>
    </section>
  )
}
