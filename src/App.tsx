import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { TranslationProvider } from './contexts/TranslationContext'
import BackgroundWrapper from './Components/ui/background'
import Header from './Components/ui/Header'
import PageTransition from './Components/ui/PageTransition'
import './App.css'
import Landing from './Components/pages/landing'
import Operation from './Components/pages/operation'
import CreatePlan from './Components/pages/createPlan'
import ManagePlans from './Components/pages/managePlans'
import Visualization from './Components/pages/Visualization'

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
        <Route path="/visualization" element={
          <PageTransition>
            <Visualization />
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <TranslationProvider defaultLanguage="en">
      <Router>
        <BackgroundWrapper>
          <Header />
          <AnimatedRoutes />
        </BackgroundWrapper>
      </Router>
    </TranslationProvider>
  )
}

export default App
