import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FloatingEmbers from './components/FloatingEmbers'
import Home from './pages/Home'
import StonksPage from './pages/StonksPage'
import ScraperPage from './pages/ScraperPage'
import LdgrPage from './pages/LdgrPage'
import WsprPage from './pages/WsprPage'
import OmniPage from './pages/OmniPage'
import DiscordPage from './pages/DiscordPage'
import ResetPassword from './pages/ResetPassword'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="fixed inset-0 flex flex-col bg-samurai-black">
          {/* Floating embers - persists across all pages */}
          <FloatingEmbers />
          
          {/* Fixed Header */}
          <div className="flex-shrink-0 z-10">
            <Navbar />
          </div>
          
          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/stonks" element={<StonksPage />} />
              <Route path="/scraper" element={<ScraperPage />} />
              <Route path="/ldgr" element={<LdgrPage />} />
              <Route path="/wspr" element={<WsprPage />} />
              <Route path="/omni" element={<OmniPage />} />
              <Route path="/discord" element={<DiscordPage />} />
            </Routes>
          </main>
          
          {/* Fixed Footer */}
          <div className="flex-shrink-0 z-10">
            <Footer />
          </div>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
