import type { ReactNode } from 'react'
import type { SectionHeading, SiteContent } from '../content/types.ts'
import { AccentField, Card, Grid, IconField, ImageField, ListEditor, ParagraphsEditor, TextField } from './fields.tsx'

export interface SectionEditorProps<K extends keyof SiteContent> {
  value: SiteContent[K]
  onChange: (value: SiteContent[K]) => void
}

function HeadingFields<T extends SectionHeading>({ value, onChange, introHint }: { value: T; onChange: (v: T) => void; introHint?: string }) {
  return (
    <>
      <Grid>
        <TextField label="Label boven de titel" value={value.eyebrow} onChange={(eyebrow) => onChange({ ...value, eyebrow })} />
        <TextField label="Titel" value={value.title} onChange={(title) => onChange({ ...value, title })} />
      </Grid>
      <TextField label="Introductietekst" multiline rows={2} value={value.intro} onChange={(intro) => onChange({ ...value, intro })} hint={introHint ?? 'Laat leeg om niet te tonen.'} />
    </>
  )
}

export function GeneralEditor({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  return (
    <>
      <Card title="Website" description="Naam in de kopbalk en tekst onderaan de pagina.">
        <TextField label="Naam van de website" value={content.siteName} onChange={(siteName) => onChange({ ...content, siteName })} />
        <TextField label="Copyright-tekst in de footer" value={content.footer.copyright} onChange={(copyright) => onChange({ ...content, footer: { ...content.footer, copyright } })} />
      </Card>
      <Card title="Menu" description="De tekst van de menuknoppen (kopbalk en footer).">
        <Grid>
          {content.nav.map((item, i) => (
            <TextField
              key={item.id}
              label={`Menu-item → #${item.id}`}
              value={item.label}
              onChange={(label) => onChange({ ...content, nav: content.nav.map((n, j) => (j === i ? { ...n, label } : n)) })}
            />
          ))}
        </Grid>
      </Card>
    </>
  )
}

export function HeroEditor({ value, onChange }: SectionEditorProps<'hero'>) {
  return (
    <Card title="Hero" description="Het grote welkomstblok bovenaan de pagina.">
      <TextField label="Titel" value={value.title} onChange={(title) => onChange({ ...value, title })} />
      <TextField label="Tekst" multiline value={value.text} onChange={(text) => onChange({ ...value, text })} />
      <Grid>
        <TextField label="Knoptekst" value={value.buttonLabel} onChange={(buttonLabel) => onChange({ ...value, buttonLabel })} />
        <TextField label="Knoplink" value={value.buttonUrl} onChange={(buttonUrl) => onChange({ ...value, buttonUrl })} hint="Bijv. #nieuws, /contact of https://…" />
      </Grid>
      <TextField label="Scroll-tekst" value={value.scrollLabel} onChange={(scrollLabel) => onChange({ ...value, scrollLabel })} />
    </Card>
  )
}

export function NewsEditor({ value, onChange }: SectionEditorProps<'news'>) {
  return (
    <>
      <Card title="Nieuws — kop">
        <HeadingFields value={value} onChange={onChange} />
      </Card>
      <Card title="Nieuwsberichten">
        <ListEditor
          items={value.items}
          onChange={(items) => onChange({ ...value, items })}
          addLabel="Nieuwsbericht toevoegen"
          itemTitle={(item) => item.title || 'Nieuw bericht'}
          createItem={() => ({ image: '', icon: 'newspaper', accent: 'secondary' as const, date: '', title: '', excerpt: '', linkLabel: 'Lees meer', linkUrl: '#' })}
          renderItem={(item, update) => (
            <>
              <ImageField value={item.image} onChange={(image) => update({ image })} />
              <Grid>
                <TextField label="Titel" value={item.title} onChange={(title) => update({ title })} />
                <TextField label="Datum" value={item.date} onChange={(date) => update({ date })} placeholder="15 Mei 2024" />
              </Grid>
              <TextField label="Samenvatting" multiline rows={3} value={item.excerpt} onChange={(excerpt) => update({ excerpt })} />
              <Grid>
                <TextField label="Linktekst" value={item.linkLabel} onChange={(linkLabel) => update({ linkLabel })} />
                <TextField label="Link" value={item.linkUrl} onChange={(linkUrl) => update({ linkUrl })} />
                <IconField value={item.icon} onChange={(icon) => update({ icon })} />
                <AccentField value={item.accent} onChange={(accent) => update({ accent })} />
              </Grid>
            </>
          )}
        />
      </Card>
    </>
  )
}

export function HistoryEditor({ value, onChange }: SectionEditorProps<'history'>) {
  return (
    <>
      <Card title="Geschiedenis — kop">
        <HeadingFields value={value} onChange={onChange} introHint="Optionele vetgedrukte openingszin. Laat leeg om niet te tonen." />
        <ImageField value={value.image} onChange={(image) => onChange({ ...value, image })} />
      </Card>
      <Card title="Alinea's">
        <ParagraphsEditor label="Alinea" paragraphs={value.paragraphs} onChange={(paragraphs) => onChange({ ...value, paragraphs })} />
      </Card>
      <Card title="Cijfers" description="De kleine blokjes met cijfers onder de tekst.">
        <ListEditor
          items={value.stats}
          onChange={(stats) => onChange({ ...value, stats })}
          addLabel="Cijfer toevoegen"
          itemTitle={(s) => `${s.value} ${s.label}`.trim() || 'Nieuw cijfer'}
          createItem={() => ({ value: '', label: '', accent: 'primary' as const })}
          renderItem={(s, update) => (
            <>
              <Grid>
                <TextField label="Waarde" value={s.value} onChange={(v) => update({ value: v })} />
                <TextField label="Omschrijving" value={s.label} onChange={(label) => update({ label })} />
              </Grid>
              <AccentField value={s.accent} onChange={(accent) => update({ accent })} />
            </>
          )}
        />
      </Card>
    </>
  )
}

export function EventsEditor({ value, onChange }: SectionEditorProps<'events'>) {
  return (
    <>
      <Card title="Evenementen — kop">
        <HeadingFields value={value} onChange={onChange} />
      </Card>
      <Card title="Evenementen">
        <ListEditor
          items={value.items}
          onChange={(items) => onChange({ ...value, items })}
          addLabel="Evenement toevoegen"
          itemTitle={(e) => e.title || 'Nieuw evenement'}
          createItem={() => ({ image: '', accent: 'secondary' as const, date: '', title: '', description: '', buttonLabel: 'Meer info', buttonUrl: '#' })}
          renderItem={(e, update) => (
            <>
              <ImageField value={e.image} onChange={(image) => update({ image })} />
              <Grid>
                <TextField label="Titel" value={e.title} onChange={(title) => update({ title })} />
                <TextField label="Datum" value={e.date} onChange={(date) => update({ date })} placeholder="12 OKT 2025" />
              </Grid>
              <TextField label="Omschrijving" multiline rows={3} value={e.description} onChange={(description) => update({ description })} />
              <Grid>
                <TextField label="Knoptekst" value={e.buttonLabel} onChange={(buttonLabel) => update({ buttonLabel })} />
                <TextField label="Knoplink" value={e.buttonUrl} onChange={(buttonUrl) => update({ buttonUrl })} />
              </Grid>
              <AccentField value={e.accent} onChange={(accent) => update({ accent })} />
            </>
          )}
        />
      </Card>
    </>
  )
}

export function TeamEditor({ value, onChange }: SectionEditorProps<'team'>) {
  return (
    <>
      <Card title="Wie zijn wij — kop">
        <HeadingFields value={value} onChange={onChange} />
      </Card>
      <Card title="Teamleden">
        <ListEditor
          items={value.members}
          onChange={(members) => onChange({ ...value, members })}
          addLabel="Teamlid toevoegen"
          itemTitle={(m) => m.name || 'Nieuw teamlid'}
          createItem={() => ({ image: '', accent: 'primary' as const, name: '', role: '', bio: '' })}
          renderItem={(m, update) => (
            <>
              <ImageField label="Foto" round value={m.image} onChange={(image) => update({ image })} />
              <Grid>
                <TextField label="Naam" value={m.name} onChange={(name) => update({ name })} />
                <TextField label="Rol" value={m.role} onChange={(role) => update({ role })} />
              </Grid>
              <TextField label="Korte bio" multiline rows={2} value={m.bio} onChange={(bio) => update({ bio })} />
              <AccentField value={m.accent} onChange={(accent) => update({ accent })} />
            </>
          )}
        />
      </Card>
    </>
  )
}

export function DonateEditor({ value, onChange }: SectionEditorProps<'donate'>) {
  return (
    <Card title="Donaties">
      <TextField label="Titel" value={value.title} onChange={(title) => onChange({ ...value, title })} />
      <TextField label="Tekst" multiline value={value.text} onChange={(text) => onChange({ ...value, text })} />
      <Grid>
        <TextField label="Knoptekst" value={value.buttonLabel} onChange={(buttonLabel) => onChange({ ...value, buttonLabel })} />
        <TextField label="Knoplink" value={value.buttonUrl} onChange={(buttonUrl) => onChange({ ...value, buttonUrl })} hint="Bijv. een Tikkie- of PayPal-link" />
      </Grid>
    </Card>
  )
}

export function ContactEditor({ value, onChange }: SectionEditorProps<'contact'>) {
  const form = value.form
  const setForm = (patch: Partial<typeof form>) => onChange({ ...value, form: { ...form, ...patch } })

  return (
    <>
      <Card title="Contactpagina — kop">
        <TextField label="Titel" value={value.title} onChange={(title) => onChange({ ...value, title })} />
        <TextField label="Introductietekst" multiline rows={3} value={value.intro} onChange={(intro) => onChange({ ...value, intro })} />
      </Card>
      <Card title="Contactformulier" description="Labels en teksten van het formulier.">
        <TextField label="Titel van het formulier" value={value.formTitle} onChange={(formTitle) => onChange({ ...value, formTitle })} />
        <Grid>
          <TextField label="Label naam" value={form.nameLabel} onChange={(nameLabel) => setForm({ nameLabel })} />
          <TextField label="Placeholder naam" value={form.namePlaceholder} onChange={(namePlaceholder) => setForm({ namePlaceholder })} />
          <TextField label="Label e-mail" value={form.emailLabel} onChange={(emailLabel) => setForm({ emailLabel })} />
          <TextField label="Placeholder e-mail" value={form.emailPlaceholder} onChange={(emailPlaceholder) => setForm({ emailPlaceholder })} />
          <TextField label="Label bericht" value={form.messageLabel} onChange={(messageLabel) => setForm({ messageLabel })} />
          <TextField label="Placeholder bericht" value={form.messagePlaceholder} onChange={(messagePlaceholder) => setForm({ messagePlaceholder })} />
          <TextField label="Knoptekst" value={form.submitLabel} onChange={(submitLabel) => setForm({ submitLabel })} />
          <TextField label="Bevestiging na versturen" value={form.successMessage} onChange={(successMessage) => setForm({ successMessage })} />
        </Grid>
      </Card>
      <Card title="Contactgegevens">
        <TextField label="Titel" value={value.detailsTitle} onChange={(detailsTitle) => onChange({ ...value, detailsTitle })} />
        <ListEditor
          items={value.details}
          onChange={(details) => onChange({ ...value, details })}
          addLabel="Contactgegeven toevoegen"
          itemTitle={(d) => d.label || 'Nieuw contactgegeven'}
          createItem={() => ({ icon: 'mail', accent: 'primary' as const, label: '', value: '' })}
          renderItem={(d, update) => (
            <Grid>
              <TextField label="Omschrijving" value={d.label} onChange={(label) => update({ label })} />
              <TextField label="Waarde" value={d.value} onChange={(v) => update({ value: v })} />
              <IconField value={d.icon} onChange={(icon) => update({ icon })} />
              <AccentField value={d.accent} onChange={(accent) => update({ accent })} />
            </Grid>
          )}
        />
      </Card>
    </>
  )
}

export function PrivacyEditor({ value, onChange }: SectionEditorProps<'privacy'>) {
  return (
    <>
      <Card title="Privacypagina — kop">
        <Grid>
          <TextField label="Label boven de titel" value={value.badge} onChange={(badge) => onChange({ ...value, badge })} />
          <TextField label="Datum laatste update" value={value.updated} onChange={(updated) => onChange({ ...value, updated })} />
        </Grid>
        <TextField label="Titel" value={value.title} onChange={(title) => onChange({ ...value, title })} />
        <TextField label="Introductietekst" multiline rows={3} value={value.intro} onChange={(intro) => onChange({ ...value, intro })} />
      </Card>
      <Card title="Onderdelen" description="Elk onderdeel krijgt automatisch een nummer.">
        <ListEditor
          items={value.sections}
          onChange={(sections) => onChange({ ...value, sections })}
          addLabel="Onderdeel toevoegen"
          itemTitle={(s) => s.title || 'Nieuw onderdeel'}
          createItem={() => ({ title: '', paragraphs: [''], bullets: [], cards: [], buttonLabel: '', buttonUrl: '' })}
          renderItem={(section, update) => (
            <>
              <TextField label="Titel" value={section.title} onChange={(title) => update({ title })} />
              <SubList title="Alinea's">
                <ParagraphsEditor label="Alinea" paragraphs={section.paragraphs} onChange={(paragraphs) => update({ paragraphs })} />
              </SubList>
              <SubList title="Opsomming" description="Lijst met vinkjes. Optioneel.">
                <ListEditor
                  items={section.bullets.map((text) => ({ text }))}
                  onChange={(items) => update({ bullets: items.map((b) => b.text) })}
                  addLabel="Punt toevoegen"
                  itemTitle={(b) => b.text || 'Nieuw punt'}
                  createItem={() => ({ text: '' })}
                  renderItem={(b, set) => <TextField label="Tekst" value={b.text} onChange={(text) => set({ text })} />}
                />
              </SubList>
              <SubList title="Blokken" description="Kleine blokken met titel, tekst en label (zoals bij cookies). Optioneel.">
                <ListEditor
                  items={section.cards}
                  onChange={(cards) => update({ cards })}
                  addLabel="Blok toevoegen"
                  itemTitle={(c) => c.title || 'Nieuw blok'}
                  createItem={() => ({ title: '', text: '', badge: '' })}
                  renderItem={(c, set) => (
                    <>
                      <Grid>
                        <TextField label="Titel" value={c.title} onChange={(title) => set({ title })} />
                        <TextField label="Label" value={c.badge} onChange={(badge) => set({ badge })} placeholder="Altijd actief" />
                      </Grid>
                      <TextField label="Tekst" multiline rows={2} value={c.text} onChange={(text) => set({ text })} />
                    </>
                  )}
                />
              </SubList>
              <Grid>
                <TextField label="Knoptekst" value={section.buttonLabel} onChange={(buttonLabel) => update({ buttonLabel })} hint="Leeg = geen knop." />
                <TextField label="Knoplink" value={section.buttonUrl} onChange={(buttonUrl) => update({ buttonUrl })} hint="Bijv. /contact of mailto:privacy@…" />
              </Grid>
            </>
          )}
        />
      </Card>
    </>
  )
}

// Titled group inside a list item
function SubList({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h4 className="text-label-lg text-on-surface">{title}</h4>
        {description && <p className="text-label-md text-on-surface-variant/70">{description}</p>}
      </div>
      {children}
    </div>
  )
}
