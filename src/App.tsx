import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { TranslationProvider } from './contexts/TranslationContext'
import BackgroundWrapper from './Components/ui/background'
import Header from './Components/ui/Header'
import PageTransition from './Components/ui/PageTransition'
import Sidebar from './Components/ui/Sidebar'
import './App.css'
import Landing from './Components/pages/landing'
import Operation from './Components/pages/operation'
import CreatePlan from './Components/pages/createPlan'
import EditPlans from './Components/pages/editPlan'
import Networkplan from './Components/pages/networkPlan'
import GanttPage from './Components/pages/GanttPage'
import ManagePlans from './Components/pages/managePlans'
import Support from './Components/pages/support'

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
        <Route path="/edit-plan/:planId" element={
          <PageTransition>
            <EditPlans />
          </PageTransition>
        } />
        <Route path="/networkplan/:planId" element={
          <PageTransition>
            <Networkplan />
          </PageTransition>
        } />
        <Route path="/gantt/:planId" element={
          <PageTransition>
            <GanttPage />
          </PageTransition>
        } />
        <Route path="/support" element={
          <PageTransition>
            <Support />
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <TranslationProvider>
      <Router>
        <BackgroundWrapper>
          <div className="flex w-full min-h-screen">
            <div className="hidden md:block">
              <Sidebar />
            </div>
            <div className="flex-1 flex flex-col">
              <Header />
              <AnimatedRoutes />
            </div>
          </div>
        </BackgroundWrapper>
      </Router>
    </TranslationProvider>
  )
}

export default App
