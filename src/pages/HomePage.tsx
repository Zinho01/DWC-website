import { Donate } from '../components/Donate.tsx'
import { Events } from '../components/Events.tsx'
import { Hero } from '../components/Hero.tsx'
import { History } from '../components/History.tsx'
import { News } from '../components/News.tsx'
import { Team } from '../components/Team.tsx'
import { usePageTitle } from '../components/usePageTitle.ts'

export function HomePage() {
  usePageTitle()
  return (
    <>
      <Hero />
      <News />
      <History />
      <Events />
      <Team />
      <Donate />
    </>
  )
}
