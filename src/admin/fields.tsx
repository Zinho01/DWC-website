import { useId, useState, type ChangeEvent, type ReactNode } from 'react'
import { UPLOAD_TYPES, uploadImage } from './api.ts'
import { isUploadPath } from '../content/safety.ts'
import { Icon } from '../components/Icon.tsx'
import type { Accent } from '../content/types.ts'

const controlClass =
  'w-full bg-surface-container-low text-on-surface border border-outline-variant/60 px-3 py-2.5 rounded-lg text-body-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all'

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  rows?: number
  hint?: string
  placeholder?: string
}

export function TextField({ label, value, onChange, multiline, rows = 4, hint, placeholder }: TextFieldProps) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="block text-label-lg text-on-surface-variant mb-1.5">
        {label}
      </label>
      {multiline ? (
        <textarea id={id} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${controlClass} resize-y`} />
      ) : (
        <input id={id} type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={controlClass} />
      )}
      {hint && <p className="text-label-md text-on-surface-variant/70 mt-1">{hint}</p>}
    </div>
  )
}

export function IconField({ label = 'Icoon', value, onChange }: { label?: string; value: string; onChange: (value: string) => void }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="block text-label-lg text-on-surface-variant mb-1.5">
        {label}
      </label>
      <div className="flex gap-2 items-center">
        <span className="w-11 h-11 shrink-0 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
          <Icon name={value || 'help'} />
        </span>
        <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} className={controlClass} />
      </div>
      <p className="text-label-md text-on-surface-variant/70 mt-1">
        Naam van een{' '}
        <a href="https://fonts.google.com/icons" target="_blank" rel="noreferrer" className="text-secondary hover:underline">
          Material Symbol
        </a>
        , bijv. newspaper, event, podcasts
      </p>
    </div>
  )
}

const accents: { value: Accent; label: string; swatch: string }[] = [
  { value: 'primary', label: 'Paars', swatch: 'bg-primary' },
  { value: 'secondary', label: 'Blauw', swatch: 'bg-secondary' },
  { value: 'tertiary', label: 'Lila', swatch: 'bg-tertiary' },
]

export function AccentField({ value, onChange }: { value: Accent; onChange: (value: Accent) => void }) {
  return (
    <fieldset>
      <legend className="block text-label-lg text-on-surface-variant mb-1.5">Accentkleur</legend>
      <div className="flex flex-wrap gap-2">
        {accents.map((a) => (
          <button
            key={a.value}
            type="button"
            aria-pressed={value === a.value}
            onClick={() => onChange(a.value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-body-sm transition-colors ${
              value === a.value ? 'border-secondary bg-surface-container-highest text-on-surface' : 'border-outline-variant/60 text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className={`w-3 h-3 rounded-full ${a.swatch}`} />
            {a.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="bg-surface-container rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
      <header>
        <h2 className="font-headline text-headline-sm">{title}</h2>
        {description && <p className="text-body-sm text-on-surface-variant mt-1">{description}</p>}
      </header>
      {children}
    </section>
  )
}

export function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
}

interface ListEditorProps<T> {
  items: T[]
  onChange: (items: T[]) => void
  createItem: () => NoInfer<T>
  itemTitle: (item: T, index: number) => string
  renderItem: (item: T, update: (patch: Partial<T>) => void) => ReactNode
  addLabel: string
}

// Editable list with add / remove / move up / move down.
export function ListEditor<T>({ items, onChange, createItem, itemTitle, renderItem, addLabel }: ListEditorProps<T>) {
  const move = (from: number, to: number) => {
    const next = [...items]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  const iconButton = 'w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest disabled:opacity-30 disabled:pointer-events-none transition-colors'

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-outline-variant/50 bg-surface-container-low/50">
          <div className="flex items-center justify-between gap-2 pl-4 pr-2 py-2 border-b border-outline-variant/40">
            <span className="text-label-lg text-on-surface truncate">
              <span className="text-on-surface-variant mr-2">#{i + 1}</span>
              {itemTitle(item, i)}
            </span>
            <div className="flex shrink-0">
              <button type="button" className={iconButton} disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Omhoog" title="Omhoog">
                <Icon name="arrow_upward" className="!text-[20px]" />
              </button>
              <button type="button" className={iconButton} disabled={i === items.length - 1} onClick={() => move(i, i + 1)} aria-label="Omlaag" title="Omlaag">
                <Icon name="arrow_downward" className="!text-[20px]" />
              </button>
              <button
                type="button"
                className={`${iconButton} hover:!text-error`}
                onClick={() => {
                  if (confirm(`"${itemTitle(item, i)}" verwijderen?`)) onChange(items.filter((_, j) => j !== i))
                }}
                aria-label="Verwijderen"
                title="Verwijderen"
              >
                <Icon name="delete" className="!text-[20px]" />
              </button>
            </div>
          </div>
          <div className="p-4 flex flex-col gap-4">{renderItem(item, (patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it))))}</div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, createItem()])}
        className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-secondary transition-colors"
      >
        <Icon name="add" className="!text-[20px]" /> {addLabel}
      </button>
    </div>
  )
}

// A list of plain paragraphs (privacy policy, history text).
export function ParagraphsEditor({ paragraphs, onChange, label }: { paragraphs: string[]; onChange: (p: string[]) => void; label: string }) {
  return (
    <ListEditor
      items={paragraphs.map((text) => ({ text }))}
      onChange={(items) => onChange(items.map((i) => i.text))}
      createItem={() => ({ text: '' })}
      itemTitle={(p) => (p.text ? p.text.slice(0, 50) + (p.text.length > 50 ? '…' : '') : label)}
      addLabel={`${label} toevoegen`}
      renderItem={(p, update) => <TextField label={label} multiline value={p.text} onChange={(text) => update({ text })} />}
    />
  )
}

interface ImageFieldProps {
  label?: string
  value: string
  onChange: (value: string) => void
  round?: boolean // preview as a circle (team photos)
}

export function ImageField({ label = 'Afbeelding', value, onChange, round }: ImageFieldProps) {
  const id = useId()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow choosing the same file again
    if (!file) return
    setBusy(true)
    setError('')
    try {
      onChange(await uploadImage(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Uploaden mislukt')
    } finally {
      setBusy(false)
    }
  }

  const src = isUploadPath(value) ? value : ''

  return (
    <div>
      <span className="block text-label-lg text-on-surface-variant mb-1.5">{label}</span>
      <div className="flex items-center gap-4">
        <div
          className={`shrink-0 overflow-hidden bg-surface-container-highest flex items-center justify-center text-on-surface-variant ${
            round ? 'w-20 h-20 rounded-full' : 'w-32 aspect-video rounded-lg'
          }`}
        >
          {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : <Icon name="image" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <label
            htmlFor={id}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border border-outline-variant/60 text-body-sm cursor-pointer hover:border-secondary hover:text-on-surface transition-colors focus-within:ring-2 focus-within:ring-secondary/40 ${
              busy ? 'opacity-50 pointer-events-none' : 'text-on-surface-variant'
            }`}
          >
            <Icon name="upload" className="!text-[18px]" />
            {busy ? 'Uploaden…' : src ? 'Vervangen' : 'Uploaden'}
            <input id={id} type="file" accept={UPLOAD_TYPES.join(',')} onChange={handleFile} className="sr-only" disabled={busy} />
          </label>
          {src && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-body-sm text-on-surface-variant hover:text-error transition-colors"
            >
              <Icon name="delete" className="!text-[18px]" /> Verwijderen
            </button>
          )}
        </div>
      </div>
      {error ? (
        <p role="alert" className="text-label-md text-error mt-1.5">
          {error}
        </p>
      ) : (
        <p className="text-label-md text-on-surface-variant/70 mt-1.5">JPG, PNG, WebP of GIF, max 5 MB.{round ? '' : ' Zonder afbeelding wordt het icoon getoond.'}</p>
      )}
    </div>
  )
}
