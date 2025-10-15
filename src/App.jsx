import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useLocation } from 'react-router-dom';
import './App.css'
import Header from './components/Header'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Offers from './components/Offers'
import Testimonials from './components/Testimonials'
import Stats from './components/Stats'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ListCarPage from './components/ListCarPage';
import LocationSelect from './components/LocationSelect';
import Booking4Seater from './components/Booking4Seater';
import Booking7Seater from './components/Booking7Seater';

// Homepage Component
const HomePage = () => (
  <ScrollToSectionWrapper>
    <Hero />
    <Offers />
    <Testimonials />
    <Stats />
    <Contact />
  </ScrollToSectionWrapper>
);

function ScrollToSectionWrapper({ children }) {
  const location = useLocation();
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scrollId = params.get('scroll');
    if (scrollId) {
      setTimeout(() => {
        const el = document.getElementById(scrollId);
        if (el) {
          const yOffset = -100;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 350);
    }
  }, [location.search]);
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/location-select" element={<LocationSelect />} />
          <Route path="/listcar" element={<ListCarPage />} />
          <Route path="/booking-4seater" element={<Booking4Seater />} />
          <Route path="/booking-7seater" element={<Booking7Seater />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App
