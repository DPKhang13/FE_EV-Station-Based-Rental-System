import React from 'react'
import './App.css'
import Header from './components/Header'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Offers from './components/Offers'
import Testimonials from './components/Testimonials'
import Stats from './components/Stats'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  return (
    <div className="App">
      <Header />
      <Navbar />
      <Hero />
      <Offers />
      <Testimonials />
      <Stats />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
