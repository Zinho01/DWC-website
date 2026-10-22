import { useState, type FormEvent } from 'react'
import { accentText } from '../components/accent.ts'
import { Icon } from '../components/Icon.tsx'
import { PageIntro } from '../components/PageIntro.tsx'
import { Reveal } from '../components/Reveal.tsx'
import { usePageTitle } from '../components/usePageTitle.ts'
import { useContent } from '../content/ContentContext.tsx'

const inputClass =
  'w-full bg-surface-container-highest/70 text-on-surface placeholder:text-on-surface-variant/50 px-5 py-3.5 rounded-lg border border-transparent focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all'

export function ContactPage() {
  const { content } = useContent()
  const contact = content.contact
  const label = content.nav.find((n) => n.id === 'contact')?.label
  usePageTitle(label ?? contact.title)

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-[32rem] bg-gradient-to-b from-primary-container/10 via-transparent to-transparent pointer-events-none" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-gutter pt-32 md:pt-40 pb-16 md:pb-24">
        <PageIntro title={contact.title} intro={contact.intro} />

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-12 mt-12 md:mt-16">
          <Reveal className="flex">
            <ContactForm />
          </Reveal>

          <Reveal delay={120}>
            <div className="bg-surface-container rounded-2xl p-6 sm:p-8 border border-white/5">
              <h2 className="font-headline text-headline-sm mb-6">{contact.detailsTitle}</h2>
              <ul className="flex flex-col gap-5">
                {contact.details.map((detail, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <span className={`w-12 h-12 shrink-0 rounded-full bg-primary-container/15 flex items-center justify-center ${accentText[detail.accent]}`}>
                      <Icon name={detail.icon} className="!text-[22px]" />
                    </span>
                    <div className="min-w-0">
                      <span className="block text-label-lg uppercase tracking-wider text-on-surface-variant">{detail.label}</span>
                      <span className="block text-body-md text-on-surface break-words">{detail.value}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  )
}

function ContactForm() {
  const { contact } = useContent().content
  const { form } = contact
  const [sent, setSent] = useState(false)

  // Front-end only for now: the message is not sent anywhere yet.
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.currentTarget.reset()
    setSent(true)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-gradient-to-br from-surface-container to-surface-container-low rounded-2xl p-6 sm:p-10 flex flex-col gap-6 border border-white/5"
    >
      <h2 className="font-headline text-headline-lg-mobile md:text-headline-lg">{contact.formTitle}</h2>
      <div>
        <label htmlFor="contact-name" className="block text-body-md mb-2 text-on-surface">
          {form.nameLabel}
        </label>
        <input id="contact-name" name="name" className={inputClass} placeholder={form.namePlaceholder} required maxLength={200} type="text" autoComplete="name" />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-body-md mb-2 text-on-surface">
          {form.emailLabel}
        </label>
        <input id="contact-email" name="email" className={inputClass} placeholder={form.emailPlaceholder} required maxLength={320} type="email" autoComplete="email" />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-body-md mb-2 text-on-surface">
          {form.messageLabel}
        </label>
        <textarea id="contact-message" name="message" className={`${inputClass} resize-y`} placeholder={form.messagePlaceholder} required maxLength={5000} rows={6} />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button
          type="submit"
          className="self-start inline-flex items-center gap-2 bg-white text-black hover:bg-gray-100 font-medium px-8 py-4 rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_24px_rgba(123,208,255,0.35)]"
        >
          {form.submitLabel}
          <Icon name="send" className="!text-[20px]" />
        </button>
        {sent && (
          <p role="status" className="flex items-center gap-2 text-secondary text-body-sm">
            <Icon name="check_circle" className="!text-[20px]" /> {form.successMessage}
          </p>
        )}
      </div>
    </form>
  )
}
