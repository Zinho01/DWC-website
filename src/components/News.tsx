import { useContent } from '../content/ContentContext.tsx'
import { UploadedImage } from './UploadedImage.tsx'
import { SafeLink } from './SafeLink.tsx'
import { accentText } from './accent.ts'
import { Icon } from './Icon.tsx'
import { Reveal } from './Reveal.tsx'

export function News() {
  const { news } = useContent().content

  return (
    <section id="nieuws" className="py-16 md:py-24 px-4 sm:px-gutter max-w-7xl mx-auto w-full">
      <Reveal className="flex items-end justify-between gap-4 mb-12 md:mb-16">
        <div>
          <span className="text-secondary font-bold text-label-lg uppercase tracking-wider block mb-2">{news.eyebrow}</span>
          <h2 className="font-headline text-headline-lg-mobile md:text-headline-lg">{news.title}</h2>
          {news.intro && <p className="text-body-md text-on-surface-variant mt-4 max-w-2xl">{news.intro}</p>}
        </div>
        <div className="hidden sm:flex gap-2 pb-3" aria-hidden="true">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <div className="w-3 h-3 rounded-full bg-tertiary" />
        </div>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {news.items.map((item, i) => (
          <Reveal key={i} delay={(i % 3) * 120} className="flex">
          <article
            className="w-full bg-surface-container rounded-xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(123,208,255,0.1)] flex flex-col justify-between"
          >
            <div>
              <div className="aspect-video bg-surface-container-highest rounded-lg mb-6 flex items-center justify-center overflow-hidden">
                <UploadedImage src={item.image} alt={item.title} className="w-full h-full object-cover" fallback={<Icon name={item.icon} className={`!text-4xl ${accentText[item.accent]}`} />} />
              </div>
              <span className="text-secondary text-label-md">{item.date}</span>
              <h3 className="text-headline-sm mt-1 mb-3">{item.title}</h3>
              <p className="text-body-md text-on-surface-variant mb-6">{item.excerpt}</p>
            </div>
            <SafeLink className="inline-flex items-center gap-2 text-primary font-bold hover:underline" href={item.linkUrl}>
              {item.linkLabel} <Icon name="arrow_forward" className="!text-[18px]" />
            </SafeLink>
          </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
