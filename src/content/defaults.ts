import type { SiteContent } from './types.ts'

const lorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.'
const loremShort = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.'

export const defaultContent: SiteContent = {
  siteName: 'Dutch Whovian Community',
  nav: [
    { id: 'home', label: 'Home' },
    { id: 'nieuws', label: 'Nieuws' },
    { id: 'geschiedenis', label: 'Geschiedenis' },
    { id: 'donaties', label: 'Donaties' },
    { id: 'wie-zijn-wij', label: 'Wie zijn wij' },
    { id: 'evenementen', label: 'Evenementen' },
    { id: 'contact', label: 'Contact' },
    { id: 'privacy-policy', label: 'Privacy Policy' },
  ],
  hero: {
    title: 'Welkom bij de Dutch Whovian Community!',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
    buttonLabel: 'Word lid van de community',
    buttonUrl: '#nieuws',
    scrollLabel: 'Scroll',
  },
  news: {
    eyebrow: 'Updates',
    title: 'Laatste Nieuws & Updates',
    intro: '',
    items: [
      { image: '', icon: 'newspaper', accent: 'secondary', date: '15 Mei 2024', title: 'Nieuwseizoen Doctor Who aangekondigd', excerpt: lorem, linkLabel: 'Lees meer', linkUrl: '#' },
      { image: '', icon: 'celebration', accent: 'primary', date: '10 Mei 2024', title: 'Terugblik op de Grote Jubileummeetup', excerpt: lorem, linkLabel: 'Lees meer', linkUrl: '#' },
      { image: '', icon: 'podcasts', accent: 'tertiary', date: '02 Mei 2024', title: 'Podcast Aflevering 42 nu online', excerpt: lorem, linkLabel: 'Lees meer', linkUrl: '#' },
    ],
  },
  history: {
    eyebrow: 'Tijdlijn',
    title: 'Onze Geschiedenis in Tijd en Ruimte',
    intro: '',
    image: '',
    paragraphs: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    ],
    stats: [
      { value: '2012', label: 'Opgericht', accent: 'primary' },
      { value: '1000+', label: 'Leden', accent: 'secondary' },
      { value: '50+', label: 'Evenementen', accent: 'tertiary' },
    ],
  },
  events: {
    eyebrow: 'Agenda',
    title: 'Komende Evenementen & Meetups',
    intro: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur pretium tincidunt lacus.',
    items: [
      { image: '', accent: 'secondary', date: '12 OKT 2025', title: 'Whovian Utrecht Meetup', description: loremShort, buttonLabel: 'Meer info', buttonUrl: '#' },
      { image: '', accent: 'primary', date: '05 NOV 2025', title: 'Cosplay Workshop & Quiz', description: loremShort, buttonLabel: 'Meer info', buttonUrl: '#' },
      { image: '', accent: 'tertiary', date: '20 DEC 2025', title: 'Christmas Special Watch Party', description: loremShort, buttonLabel: 'Meer info', buttonUrl: '#' },
    ],
  },
  team: {
    eyebrow: 'Team',
    title: 'Wie zijn wij - Het Team & De Community',
    intro: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur pretium tincidunt lacus.',
    members: [
      { image: '', accent: 'primary', name: 'Bram van Vliet', role: 'Community Lead', bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
      { image: '', accent: 'secondary', name: 'Clara de Jong', role: 'Event Coordinator', bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
      { image: '', accent: 'tertiary', name: 'Rory Williams', role: 'Treasurer & Tech', bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
      { image: '', accent: 'primary', name: 'River Song', role: 'Social Media & PR', bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    ],
  },
  donate: {
    title: 'Steun de TARDIS Reizen - Doe een Donatie',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Help ons de servers online te houden en evenementen te organiseren!',
    buttonLabel: 'Doneer nu',
    buttonUrl: '#',
  },
  contact: {
    title: 'Neem Contact Op',
    intro:
      'Heb je een vraag over de Dutch Whovian Community, wil je samenwerken of wil je gewoon even kletsen over Doctor Who? Stuur ons een bericht door de tijdzones heen.',
    formTitle: 'Stuur een bericht',
    form: {
      nameLabel: 'Jouw Naam',
      namePlaceholder: 'Bijv. The Doctor',
      emailLabel: 'E-mailadres',
      emailPlaceholder: 'doctor@gallifrey.tardis',
      messageLabel: 'Je Bericht',
      messagePlaceholder: 'Vertel ons alles over je favoriete reisschema of stel je vraag...',
      submitLabel: 'Verstuur Bericht',
      successMessage: 'Bericht verzonden! We nemen zo snel mogelijk contact met je op.',
    },
    detailsTitle: 'Coördinaten & Kanalen',
    details: [
      { icon: 'mail', accent: 'primary', label: 'E-mail', value: 'info@dutchwhovians.nl' },
      { icon: 'forum', accent: 'primary', label: 'Discord Server', value: 'discord.gg/dutchwhovians' },
      { icon: 'location_on', accent: 'primary', label: 'Locatie Basis', value: 'Utrecht, Nederland' },
    ],
  },
  privacy: {
    badge: 'AVG / GDPR',
    updated: 'Laatste update: 22 oktober 2026',
    title: 'Privacyverklaring',
    intro:
      'We houden het simpel: deze website is er om te lezen over de community en om je de weg naar onze Discord te wijzen. Hieronder staat precies welke gegevens daarbij een rol spelen.',
    sections: [
      {
        title: 'Wie zijn wij?',
        paragraphs: [
          'De Dutch Whovian Community (DWC) is een community voor fans van Doctor Who. Wij zijn verantwoordelijk voor de gegevens die via deze website binnenkomen. Vragen over privacy kun je stellen via het e-mailadres op onze contactpagina.',
        ],
        bullets: [],
        cards: [],
        buttonLabel: '',
        buttonUrl: '',
      },
      {
        title: 'Het contactformulier',
        paragraphs: [
          'Als je ons een bericht stuurt via het contactformulier, ontvangen we je naam, je e-mailadres en je bericht. Die gebruiken we alleen om je vraag te beantwoorden.',
          'We delen deze gegevens met niemand en verkopen ze nooit. We bewaren je bericht niet langer dan nodig is om je te helpen, en uiterlijk een jaar.',
        ],
        bullets: [],
        cards: [],
        buttonLabel: '',
        buttonUrl: '',
      },
      {
        title: 'Bezoek aan de website',
        paragraphs: [
          'Zoals bij bijna elke website houdt onze hostingpartij korte tijd technische logbestanden bij, met onder meer je IP-adres, je browser en het tijdstip van je bezoek. Die zijn alleen bedoeld om de website veilig en bereikbaar te houden.',
        ],
        bullets: [],
        cards: [
          { title: 'Cookies', text: 'Deze website plaatst geen cookies bij bezoekers.', badge: 'Niet in gebruik' },
          { title: 'Analytics en tracking', text: 'We houden niet bij wat je op de website doet en gebruiken geen advertentie- of trackingdiensten.', badge: 'Niet in gebruik' },
          { title: 'Lettertypen', text: 'Lettertypen en iconen komen van onze eigen server, dus er gaan geen gegevens naar Google of andere partijen.', badge: 'Lokaal gehost' },
        ],
        buttonLabel: '',
        buttonUrl: '',
      },
      {
        title: 'Discord en andere externe links',
        paragraphs: [
          'Via deze website kun je doorklikken naar onze Discord-server en andere websites. Zodra je daar bent, gelden de privacyregels van die partij. Voor Discord is dat het privacybeleid van Discord.',
        ],
        bullets: [],
        cards: [],
        buttonLabel: 'Privacybeleid van Discord',
        buttonUrl: 'https://discord.com/privacy',
      },
      {
        title: 'Jouw rechten',
        paragraphs: ['Op grond van de AVG heb je onder andere het recht om:'],
        bullets: [
          'te vragen welke gegevens we van je hebben (inzage);',
          'onjuiste gegevens te laten aanpassen;',
          'je gegevens te laten verwijderen;',
          'bezwaar te maken tegen het gebruik van je gegevens;',
          'een klacht in te dienen bij de Autoriteit Persoonsgegevens als je vindt dat we niet goed met je gegevens omgaan.',
        ],
        cards: [],
        buttonLabel: 'Contact opnemen',
        buttonUrl: '/contact',
      },
    ],
  },
  footer: {
    copyright: '© 2025 Dutch Whovian Community. Not officially affiliated with the BBC.',
  },
}
