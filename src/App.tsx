import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FloatingEmbers from './components/FloatingEmbers'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import NsitPage from './pages/NsitPage'
import ScraperPage from './pages/ScraperPage'
import LdgrPage from './pages/LdgrPage'
import WsprPage from './pages/WsprPage'
import OmniPage from './pages/OmniPage'
import DiscordPage from './pages/DiscordPage'
import ResetPassword from './pages/ResetPassword'
import { AuthProvider } from './contexts/AuthContext'
import { AdminProvider } from './contexts/AdminContext'

// App pages that should persist once visited (iframes + stateful pages)
const PERSISTENT_APPS: { path: string; Component: React.ComponentType }[] = [
  { path: '/nsit', Component: NsitPage },
  { path: '/omni', Component: OmniPage },
  { path: '/scrp', Component: ScraperPage },
  { path: '/ldgr', Component: LdgrPage },
  { path: '/wspr', Component: WsprPage },
]

const PERSISTENT_PATHS = new Set(PERSISTENT_APPS.map(a => a.path))

/** Renders app pages once visited, hides inactive ones with CSS */
function PersistentApps() {
  const location = useLocation()
  const [visited, setVisited] = useState<Set<string>>(() => {
    // If we're starting on an app page, mark it visited immediately
    return PERSISTENT_PATHS.has(location.pathname) ? new Set([location.pathname]) : new Set()
  })

  const currentPath = location.pathname

  useEffect(() => {
    if (PERSISTENT_PATHS.has(currentPath) && !visited.has(currentPath)) {
      setVisited(prev => new Set(prev).add(currentPath))
    }
  }, [currentPath])

  const isAppRoute = PERSISTENT_PATHS.has(currentPath)

  return (
    <>
      {/* Non-app routes rendered normally via React Router */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ display: isAppRoute ? 'none' : undefined }}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/discord" element={<DiscordPage />} />
            {/* Catch-all so Router doesn't complain about unmatched app paths */}
            <Route path="*" element={null} />
          </Routes>
        </ErrorBoundary>
      </div>

      {/* Persistent app pages — rendered once visited, hidden when inactive */}
      {PERSISTENT_APPS.map(({ path, Component }) => {
        if (!visited.has(path)) return null
        return (
          <div
            key={path}
            className="flex-1 overflow-y-auto overflow-x-hidden"
            style={{ display: currentPath === path ? undefined : 'none' }}
          >
            <ErrorBoundary>
              <Component />
            </ErrorBoundary>
          </div>
        )
      })}
    </>
  )
}

function App() {
  const [embersOn, setEmbersOn] = useState(() => localStorage.getItem('rmg-embers') !== 'off')

  useEffect(() => {
    const handler = (e: Event) => setEmbersOn((e as CustomEvent).detail)
    window.addEventListener('rmg:embers', handler)
    return () => window.removeEventListener('rmg:embers', handler)
  }, [])

  return (
    <AuthProvider>
      <AdminProvider>
        <Router>
        <div className="fixed inset-0 flex flex-col bg-samurai-black">
          {/* Floating embers - toggled via footer flame button */}
          {embersOn && <FloatingEmbers />}
          
          {/* Fixed Header — z-[200] so navbar dropdowns render above app content */}
          <div className="flex-shrink-0 z-[200] relative">
            <Navbar />
          </div>
          
          {/* Scrollable Content — persistent app caching */}
          <PersistentApps />
          
          {/* Fixed Footer */}
          <div className="flex-shrink-0 z-10">
            <Footer />
          </div>
        </div>
      </Router>
      </AdminProvider>
    </AuthProvider>
  )
}

export default App
