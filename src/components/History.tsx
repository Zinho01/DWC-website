import { useContent } from '../content/ContentContext.tsx'
import { UploadedImage } from './UploadedImage.tsx'
import { accentText } from './accent.ts'
import { Icon } from './Icon.tsx'
import { Reveal } from './Reveal.tsx'

export function History() {
  const { history } = useContent().content

  return (
    <div className="px-4 sm:px-gutter">
      <section id="geschiedenis" className="py-12 md:py-24 px-5 sm:px-8 md:px-12 max-w-7xl mx-auto w-full bg-surface-container-low rounded-3xl my-8 md:my-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <Reveal className="w-full h-56 sm:h-72 lg:h-96 bg-surface-container-highest rounded-2xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20" />
            <UploadedImage
              src={history.image}
              alt={history.title}
              className="absolute inset-0 w-full h-full object-cover"
              fallback={<Icon name="history_edu" className="!text-6xl text-primary relative z-10" />}
            />
          </Reveal>
          <Reveal delay={150}>
            <span className="text-tertiary font-bold text-label-lg uppercase tracking-wider block mb-2">{history.eyebrow}</span>
            <h2 className="font-headline text-headline-lg-mobile md:text-headline-lg mb-6">{history.title}</h2>
            {history.intro && <p className="text-body-lg text-on-surface mb-4">{history.intro}</p>}
            {history.paragraphs.map((p, i) => (
              <p key={i} className={`text-on-surface-variant mb-4 last-of-type:mb-6 ${i === 0 ? 'text-body-lg' : 'text-body-md'}`}>
                {p}
              </p>
            ))}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {history.stats.map((stat, i) => (
                <div key={i} className="p-4 bg-surface-container rounded-xl min-w-24">
                  <span className={`font-headline text-headline-md block ${accentText[stat.accent]}`}>{stat.value}</span>
                  <span className="text-label-md text-on-surface-variant">{stat.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
