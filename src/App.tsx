import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/SiteLayout.tsx'
import { ContentProvider } from './content/ContentContext.tsx'
import { AdminPage } from './pages/AdminPage.tsx'
import { ContactPage } from './pages/ContactPage.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { PrivacyPage } from './pages/PrivacyPage.tsx'

export default function App() {
  return (
    <ContentProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy-policy" element={<PrivacyPage />} />
            <Route path="*" element={<HomePage />} />
          </Route>
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </ContentProvider>
  )
}
