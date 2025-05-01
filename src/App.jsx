import React from 'react';
import './App.css'
import Hero from './components/custom/Hero'
import Footer from './components/custom/Footer'
import Header from './components/custom/Header'

function App() {
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Hero />
      <Footer />
    </div>
  )
}

export default App
