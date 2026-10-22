import { useContent } from '../content/ContentContext.tsx'
import { UploadedImage } from './UploadedImage.tsx'
import { accentBorder } from './accent.ts'
import { Icon } from './Icon.tsx'
import { Reveal } from './Reveal.tsx'
import { SectionHeader } from './SectionHeader.tsx'

export function Team() {
  const { team } = useContent().content

  return (
    <section id="wie-zijn-wij" className="py-16 md:py-24 px-4 sm:px-gutter max-w-7xl mx-auto w-full">
      <SectionHeader heading={team} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {team.members.map((member, i) => (
          <Reveal key={i} delay={(i % 4) * 100} className="flex">
          <div className="w-full bg-surface-container p-6 rounded-xl text-center flex flex-col items-center">
            <div className={`w-24 h-24 rounded-full bg-surface-container-highest border-2 ${accentBorder[member.accent]} mx-auto mb-4 flex items-center justify-center text-on-surface-variant overflow-hidden`}>
              <UploadedImage src={member.image} alt={member.name} className="w-full h-full object-cover" fallback={<Icon name="person" className="!text-3xl" />} />
            </div>
            <h3 className="text-headline-sm mb-1">{member.name}</h3>
            <span className="text-secondary text-label-md mb-3 block">{member.role}</span>
            <p className="text-body-sm text-on-surface-variant">{member.bio}</p>
          </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
