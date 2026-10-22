import { useContent } from '../content/ContentContext.tsx'
import { UploadedImage } from './UploadedImage.tsx'
import { SafeLink } from './SafeLink.tsx'
import { accentText } from './accent.ts'
import { Icon } from './Icon.tsx'
import { Reveal } from './Reveal.tsx'
import { SectionHeader } from './SectionHeader.tsx'

export function Events() {
  const { events } = useContent().content

  return (
    <section id="evenementen" className="py-16 md:py-24 px-4 sm:px-gutter max-w-7xl mx-auto w-full">
      <SectionHeader heading={events} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {events.items.map((event, i) => (
          <Reveal key={i} delay={(i % 3) * 120} className="flex">
          <div className="w-full bg-surface-container rounded-xl overflow-hidden flex flex-col justify-between">
            <div className="relative">
              <div className="aspect-video bg-surface-container-highest flex items-center justify-center overflow-hidden">
                <UploadedImage src={event.image} alt={event.title} className="w-full h-full object-cover" fallback={<Icon name="event" className={`!text-4xl ${accentText[event.accent]}`} />} />
              </div>
              <span className="absolute top-4 right-4 bg-primary text-on-primary font-bold text-label-md px-3 py-1 rounded-full shadow-md">{event.date}</span>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-headline-sm mb-3">{event.title}</h3>
              <p className="text-body-md text-on-surface-variant mb-6 flex-1">{event.description}</p>
              <SafeLink className="inline-block bg-white text-black hover:bg-gray-100 font-bold px-6 py-2.5 rounded-full text-label-lg transition-all text-center w-full" href={event.buttonUrl}>
                {event.buttonLabel}
              </SafeLink>
            </div>
          </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
