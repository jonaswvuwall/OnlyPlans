//import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import BackgroundWrapper from './Components/background'
import './App.css'
import Landing from './Components/pages/landing'
import Operation from './Components/pages/operation'


function App() {
  return (
    <Router>
      <BackgroundWrapper>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/operation" element={<Operation />} />
        </Routes>
      </BackgroundWrapper>
    </Router>
  )
}

export default App
