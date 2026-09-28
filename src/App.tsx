import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useStore } from './store/useStore'
import { Layout } from './components/Layout'
import { Skeleton } from './components/ui'
import { applyTheme } from './pages/Settings'
import Dashboard from './pages/Dashboard'
import Plan from './pages/Plan'
import Learn, { TopicPage } from './pages/Learn'
import Train from './pages/Train'
import Mistakes, { Review } from './pages/Mistakes'
import Exam from './pages/Exam'
import Landeskunde from './pages/Landeskunde'
import Unesco from './pages/Unesco'
import Stats from './pages/Stats'
import Parent from './pages/Parent'
import Settings from './pages/Settings'
import Writing from './pages/Writing'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

/** Nowe moduły dodaje się tutaj (trasa) i w components/Layout.tsx (nawigacja). */
export default function App() {
  const init = useStore((s) => s.init)
  const hydrated = useStore((s) => s.hydrated)
  const theme = useStore((s) => s.p.profile.theme)
  useEffect(() => {
    void init()
  }, [init])
  useEffect(() => {
    applyTheme(theme)
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const h = () => applyTheme(useStore.getState().p.profile.theme)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [theme])

  return (
    <HashRouter>
      <ScrollTop />
      <Layout>
        {!hydrated ? (
          <div className="grid gap-4">
            <Skeleton className="h-44" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
            <Skeleton className="h-64" />
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/nauka" element={<Learn />} />
            <Route path="/nauka/:topicId" element={<TopicPage />} />
            <Route path="/trening" element={<Train />} />
            <Route path="/bledy" element={<Mistakes />} />
            <Route path="/powtorki" element={<Review />} />
            <Route path="/konkurs" element={<Exam />} />
            <Route path="/landeskunde" element={<Landeskunde />} />
            <Route path="/unesco" element={<Unesco />} />
            <Route path="/pisanie" element={<Writing />} />
            <Route path="/statystyki" element={<Stats />} />
            <Route path="/rodzic" element={<Parent />} />
            <Route path="/ustawienia" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </Layout>
    </HashRouter>
  )
}
