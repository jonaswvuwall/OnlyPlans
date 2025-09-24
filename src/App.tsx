import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import BackgroundWrapper from './Components/ui/background'
import PageTransition from './Components/ui/PageTransition'
import './App.css'
import Landing from './Components/pages/landing'
import Operation from './Components/pages/operation'
import CreatePlan from './Components/pages/createPlan'
import ManagePlans from './Components/pages/managePlans'

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <Landing />
          </PageTransition>
        } />
        <Route path="/home" element={
          <PageTransition>
            <Landing />
          </PageTransition>
        } />
        <Route path="/operation" element={
          <PageTransition>
            <Operation />
          </PageTransition>
        } />
        <Route path="/create-plan" element={
          <PageTransition>
            <CreatePlan />
          </PageTransition>
        } />
        <Route path="/manage-plans" element={
          <PageTransition>
            <ManagePlans />
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <BackgroundWrapper>
        <AnimatedRoutes />
      </BackgroundWrapper>
    </Router>
  )
}

export default App
