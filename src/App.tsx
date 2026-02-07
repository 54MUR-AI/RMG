import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import StonksPage from './pages/StonksPage'
import ScraperPage from './pages/ScraperPage'
import LdgrPage from './pages/LdgrPage'
import WsprPage from './pages/WsprPage'
import OmniPage from './pages/OmniPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-samurai-black">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stonks" element={<StonksPage />} />
            <Route path="/scraper" element={<ScraperPage />} />
            <Route path="/ldgr" element={<LdgrPage />} />
            <Route path="/wspr" element={<WsprPage />} />
            <Route path="/omni" element={<OmniPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
