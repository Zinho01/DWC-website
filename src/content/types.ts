// Every piece of text on the site lives in SiteContent so the admin dashboard can edit it.

export type Accent = 'primary' | 'secondary' | 'tertiary'

export interface SectionHeading {
  eyebrow: string
  title: string
  intro: string
}

export interface NavItem {
  id: string // anchor id of the section, e.g. "nieuws"
  label: string
}

export interface NewsItem {
  image: string // uploaded image URL (/uploads/…), empty = show the icon
  icon: string // Material Symbols name
  accent: Accent
  date: string
  title: string
  excerpt: string
  linkLabel: string
  linkUrl: string
}

export interface Stat {
  value: string
  label: string
  accent: Accent
}

export interface EventItem {
  image: string
  accent: Accent
  date: string
  title: string
  description: string
  buttonLabel: string
  buttonUrl: string
}

export interface TeamMember {
  image: string
  accent: Accent
  name: string
  role: string
  bio: string
}

export interface ContactDetail {
  icon: string
  accent: Accent
  label: string
  value: string
}

export interface PrivacyCard {
  title: string
  text: string
  badge: string
}

export interface PrivacySection {
  title: string
  paragraphs: string[]
  bullets: string[]
  cards: PrivacyCard[]
  buttonLabel: string // empty = no button
  buttonUrl: string
}

export interface SiteContent {
  siteName: string
  nav: NavItem[]
  hero: {
    title: string
    text: string
    buttonLabel: string
    buttonUrl: string
    scrollLabel: string
  }
  news: SectionHeading & { items: NewsItem[] }
  history: SectionHeading & { image: string; paragraphs: string[]; stats: Stat[] }
  events: SectionHeading & { items: EventItem[] }
  team: SectionHeading & { members: TeamMember[] }
  donate: {
    title: string
    text: string
    buttonLabel: string
    buttonUrl: string
  }
  contact: {
    title: string
    intro: string
    formTitle: string
    form: {
      nameLabel: string
      namePlaceholder: string
      emailLabel: string
      emailPlaceholder: string
      messageLabel: string
      messagePlaceholder: string
      submitLabel: string
      successMessage: string
    }
    detailsTitle: string
    details: ContactDetail[]
  }
  privacy: {
    badge: string
    updated: string
    title: string
    intro: string
    sections: PrivacySection[]
  }
  footer: {
    copyright: string
  }
}
