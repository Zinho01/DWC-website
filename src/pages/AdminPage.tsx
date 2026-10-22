import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { checkSession, getToken, login, logout, saveContent, setToken, UnauthorizedError } from '../admin/api.ts'
import {
  ContactEditor,
  DonateEditor,
  EventsEditor,
  GeneralEditor,
  HeroEditor,
  HistoryEditor,
  NewsEditor,
  PrivacyEditor,
  TeamEditor,
} from '../admin/sections.tsx'
import { Icon } from '../components/Icon.tsx'
import { Logo } from '../components/Logo.tsx'
import { useContent } from '../content/ContentContext.tsx'
import type { SiteContent } from '../content/types.ts'

type TabId = 'general' | 'hero' | 'news' | 'history' | 'events' | 'team' | 'donate' | 'contact' | 'privacy'

// path: where 'Bekijk site' goes for this tab
const tabs: { id: TabId; label: string; icon: string; path: string }[] = [
  { id: 'general', label: 'Algemeen', icon: 'tune', path: '/' },
  { id: 'hero', label: 'Hero', icon: 'rocket_launch', path: '/' },
  { id: 'news', label: 'Nieuws', icon: 'newspaper', path: '/#nieuws' },
  { id: 'history', label: 'Geschiedenis', icon: 'history_edu', path: '/#geschiedenis' },
  { id: 'events', label: 'Evenementen', icon: 'event', path: '/#evenementen' },
  { id: 'team', label: 'Wie zijn wij', icon: 'groups', path: '/#wie-zijn-wij' },
  { id: 'donate', label: 'Donaties', icon: 'volunteer_activism', path: '/#donaties' },
  { id: 'contact', label: 'Contact', icon: 'mail', path: '/contact' },
  { id: 'privacy', label: 'Privacy Policy', icon: 'shield', path: '/privacy-policy' },
]

export function AdminPage() {
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [checking, setChecking] = useState(token !== null)

  useEffect(() => {
    document.title = 'Beheer — Dutch Whovian Community'
    if (!token) return
    checkSession(token)
      .then((ok) => {
        if (!ok) handleToken(null)
      })
      .catch(() => {})
      .finally(() => setChecking(false))
    // only on first mount: later token changes come from login/logout
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleToken(next: string | null) {
    setToken(next)
    setTokenState(next)
  }

  if (checking) return <FullScreen>Laden…</FullScreen>
  if (!token) return <LoginScreen onLogin={handleToken} />
  return (
    <Dashboard
      token={token}
      onLogout={() => {
        void logout(token)
        handleToken(null)
      }}
      onExpired={() => handleToken(null)}
    />
  )
}

function FullScreen({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh flex items-center justify-center px-4 text-on-surface-variant">{children}</div>
}

function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      onLogin(await login(password))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inloggen mislukt')
    } finally {
      setBusy(false)
    }
  }

  return (
    <FullScreen>
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-surface-container rounded-3xl p-8 flex flex-col items-center gap-5 shadow-[0_0_50px_rgba(160,120,255,0.15)] border border-primary/20">
        <Logo className="w-20 h-20 ring-2 ring-primary/40" />
        <div className="text-center">
          <h1 className="font-headline text-headline-md text-on-surface">Beheer</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Log in om de teksten van de website aan te passen.</p>
        </div>
        <div className="w-full">
          <label htmlFor="admin-password" className="block text-label-lg text-on-surface-variant mb-1.5">
            Wachtwoord
          </label>
          <input
            id="admin-password"
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface-container-low text-on-surface border border-outline-variant/60 px-4 py-3 rounded-lg focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
          />
        </div>
        {error && (
          <p role="alert" className="w-full text-body-sm text-error flex items-center gap-2">
            <Icon name="error" className="!text-[18px]" /> {error}
          </p>
        )}
        <button type="submit" disabled={busy || !password} className="w-full bg-white text-black hover:bg-gray-100 disabled:opacity-50 font-bold py-3 rounded-full transition-all">
          {busy ? 'Bezig…' : 'Inloggen'}
        </button>
        <Link to="/" className="text-body-sm text-secondary hover:underline">
          ← Terug naar de website
        </Link>
      </form>
    </FullScreen>
  )
}

type Toast = { kind: 'success' | 'error'; text: string }

function Dashboard({ token, onLogout, onExpired }: { token: string; onLogout: () => void; onExpired: () => void }) {
  const { content, loading, setContent } = useContent()
  const [draft, setDraft] = useState<SiteContent | null>(null)
  const [tab, setTab] = useState<TabId>('general')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  // Start editing from the live content once it has loaded
  useEffect(() => {
    if (!loading && draft === null) setDraft(structuredClone(content))
  }, [loading, content, draft])

  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(content)

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  if (!draft) return <FullScreen>Inhoud laden…</FullScreen>

  async function handleSave() {
    if (!draft) return
    setSaving(true)
    try {
      const saved = await saveContent(token, draft)
      setContent(saved)
      setDraft(structuredClone(saved))
      setToast({ kind: 'success', text: 'Wijzigingen opgeslagen en live op de website.' })
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        setToast({ kind: 'error', text: err.message })
        onExpired()
      } else {
        setToast({ kind: 'error', text: err instanceof Error ? err.message : 'Opslaan mislukt' })
      }
    } finally {
      setSaving(false)
    }
  }

  function handleDiscard() {
    if (confirm('Alle niet-opgeslagen wijzigingen ongedaan maken?')) setDraft(structuredClone(content))
  }

  const set = <K extends keyof SiteContent>(key: K) => (value: SiteContent[K]) => setDraft({ ...draft, [key]: value })
  const activeTab = tabs.find((t) => t.id === tab)!

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-surface-container-highest">
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Logo className="w-9 h-9 shrink-0" alt="" />
            <div className="min-w-0">
              <p className="font-headline text-body-md sm:text-headline-sm leading-tight truncate">Beheer</p>
              <p className="text-label-md text-on-surface-variant truncate hidden sm:block">{draft.siteName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <a
              href={activeTab.path}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Bekijk de website in een nieuw tabblad"
            >
              <Icon name="open_in_new" className="!text-[18px]" />
              <span className="hidden md:inline">Bekijk site</span>
            </a>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Uitloggen"
            >
              <Icon name="logout" className="!text-[18px]" />
              <span className="hidden md:inline">Uitloggen</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        {/* Section navigation: horizontal scroller on mobile, sidebar on desktop */}
        <nav aria-label="Secties" className="lg:w-60 lg:shrink-0 lg:sticky lg:top-16 lg:self-start lg:py-6 lg:pl-6 border-b lg:border-b-0 border-surface-container-highest">
          <ul className="flex lg:flex-col gap-1 overflow-x-auto px-4 py-3 lg:p-0 [scrollbar-width:none]">
            {tabs.map((t) => (
              <li key={t.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setTab(t.id)
                    window.scrollTo({ top: 0 })
                  }}
                  aria-current={t.id === tab ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 lg:py-2.5 rounded-lg text-body-sm whitespace-nowrap transition-colors ${
                    t.id === tab ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <Icon name={t.icon} className="!text-[20px]" />
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Editor */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 pb-32 flex flex-col gap-6">
          <h1 className="font-headline text-headline-lg-mobile">{activeTab.label}</h1>
          {tab === 'general' && <GeneralEditor content={draft} onChange={setDraft} />}
          {tab === 'hero' && <HeroEditor value={draft.hero} onChange={set('hero')} />}
          {tab === 'news' && <NewsEditor value={draft.news} onChange={set('news')} />}
          {tab === 'history' && <HistoryEditor value={draft.history} onChange={set('history')} />}
          {tab === 'events' && <EventsEditor value={draft.events} onChange={set('events')} />}
          {tab === 'team' && <TeamEditor value={draft.team} onChange={set('team')} />}
          {tab === 'donate' && <DonateEditor value={draft.donate} onChange={set('donate')} />}
          {tab === 'contact' && <ContactEditor value={draft.contact} onChange={set('contact')} />}
          {tab === 'privacy' && <PrivacyEditor value={draft.privacy} onChange={set('privacy')} />}
        </main>
      </div>

      {/* Save bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-surface-container-low/95 backdrop-blur-xl border-t border-surface-container-highest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <p className={`text-body-sm flex items-center gap-2 min-w-0 ${dirty ? 'text-tertiary' : 'text-on-surface-variant'}`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${dirty ? 'bg-tertiary animate-pulse' : 'bg-secondary'}`} />
            <span className="truncate">{dirty ? 'Niet opgeslagen' : 'Opgeslagen'}</span>
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={!dirty || saving}
              aria-label="Ongedaan maken"
              title="Ongedaan maken"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-full text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <Icon name="undo" className="!text-[18px]" />
              <span className="hidden sm:inline">Ongedaan maken</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || saving}
              className="flex items-center gap-2 bg-white text-black hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none font-bold px-5 py-2.5 rounded-full transition-all"
            >
              <Icon name="save" className="!text-[18px]" />
              {saving ? 'Opslaan…' : 'Opslaan'}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-body-sm ${
            toast.kind === 'success' ? 'bg-secondary-container text-black' : 'bg-error-container text-on-error-container'
          }`}
        >
          <Icon name={toast.kind === 'success' ? 'check_circle' : 'error'} className="!text-[20px]" />
          {toast.text}
        </div>
      )}
    </div>
  )
}
