import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLenis } from './hooks/useAnimations'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    // Use Lenis scrollTo if available, else native
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname])
  return null
}

/* ── Global Lenis initialiser — lives at App root so it's one instance ── */
function SmoothScrollProvider() {
  useLenis()
  return null
}

import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar          from './components/Navbar'
import Footer          from './components/Footer'
import LoadingScreen   from './components/LoadingScreen'
import ScrollProgress  from './components/ScrollProgress'
import Home            from './pages/Home'
import About           from './pages/About'
import WorkWithUs      from './pages/WorkWithUs'
import LeadGeneration  from './pages/workwithus/LeadGeneration'
import SocialMediaMgmt from './pages/workwithus/SocialMediaMgmt'
import EventsWwU       from './pages/workwithus/Events'
import WaterRipple from './components/WaterRipple'
import WebDevelopmentWwU from './pages/workwithus/WebDevelopmentWwU'

function App() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!loaded && <LoadingScreen onDone={() => setLoaded(true)} />}
        <Router>
          {/* Lenis smooth scroll — single global instance */}
          <SmoothScrollProvider />
          <ScrollToTop />
          <ScrollProgress />
          <div className="app-wrapper">
            <Navbar />
            <main className="main-content">
                <Routes>
                  <Route path="/"                                     element={<Home />} />
                  <Route path="/about"                                element={<About />} />
                  <Route path="/work-with-us"                         element={<WorkWithUs />} />
                  <Route path="/work-with-us/lead-generation"         element={<LeadGeneration />} />
                  <Route path="/work-with-us/social-media-management" element={<SocialMediaMgmt />} />
                  <Route path="/work-with-us/events"                  element={<EventsWwU />} />
                  <Route path="/work-with-us/web-development"         element={<WebDevelopmentWwU />} />
                </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      <WaterRipple />
    </>
  )
}

export default App