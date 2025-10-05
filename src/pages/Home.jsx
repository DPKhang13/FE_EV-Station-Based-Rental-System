import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ReservationPage() {
  const [sameLocation, setSameLocation] = useState(true);
   const navigate=useNavigate();
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Top bar */}
      <div className="flex justify-between items-center px-8 py-3 text-sm bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span>📞</span> <span>123.456.7890</span>
        </div>
        <div className="flex items-center gap-2">
          <span>✉️</span>
          <a href="mailto:contact@rentacar.com" className="hover:text-red-500">
            contact@rentacar.com
          </a>
        </div>
      </div>

      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-4 bg-black border-b border-gray-800">
        <div className="flex items-center gap-2 text-2xl font-extrabold tracking-wide">
          🚗 YOUR LOGO
        </div>
        <ul className="flex gap-8 text-gray-300 font-semibold">
          <li>
            <a href="#" className="text-red-500 border-b-2 border-red-500 pb-1">
              HOME
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-red-500">
              RESERVATION
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-red-500">
              ABOUT US
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-red-500">
              CONTACT US
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-red-500">
              MY BOOKING
            </a>
          </li>
        </ul>
        <button  onClick={() => navigate('/Login')} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md font-semibold transition">
          Login 
         
        </button>
      </nav>

      {/* Hero Section */}
      <div
        className="relative h-80 flex flex-col items-center justify-center text-center"
        style={{
          backgroundImage: "url('/car-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <h1 className="text-5xl font-bold relative z-10 mb-3">RENT A CAR!</h1>
        <p className="text-lg text-gray-300 relative z-10">
          Choose dates and locations to make your reservation.
        </p>
      </div>

      {/* Reservation Form */}
      <section className="max-w-6xl mx-auto mt-10 bg-gray-900 p-10 rounded-2xl shadow-lg">
        {/* Date & Time Fields */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Pick-up Date */}
          <div>
            <label className="block text-gray-300 mb-1 text-sm">Pick-up Date</label>
            <div className="flex">
              <div className="bg-red-600 p-3 rounded-l-md flex items-center">📅</div>
              <input
                type="date"
                defaultValue="2025-10-05"
                className="w-full p-3 rounded-r-md bg-black border border-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Pick-up Time */}
          <div>
            <label className="block text-gray-300 mb-1 text-sm">Pick-up Time</label>
            <div className="flex">
              <div className="bg-red-600 p-3 rounded-l-md flex items-center">⏰</div>
              <input
                type="time"
                defaultValue="10:00"
                className="w-full p-3 rounded-r-md bg-black border border-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Return Date */}
          <div>
            <label className="block text-gray-300 mb-1 text-sm">Return Date</label>
            <div className="flex">
              <div className="bg-red-600 p-3 rounded-l-md flex items-center">📅</div>
              <input
                type="date"
                className="w-full p-3 rounded-r-md bg-black border border-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Return Time */}
          <div>
            <label className="block text-gray-300 mb-1 text-sm">Return Time</label>
            <div className="flex">
              <div className="bg-red-600 p-3 rounded-l-md flex items-center">⏰</div>
              <input
                type="time"
                defaultValue="10:00"
                className="w-full p-3 rounded-r-md bg-black border border-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Pick-up Location */}
          <div>
            <label className="block text-gray-300 mb-1 text-sm">Pick-up Location</label>
            <select className="w-full p-3 rounded-md bg-black border border-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-red-500">
              <option>Hogarth Road, London</option>
              <option>Heathrow Airport</option>
              <option>King’s Cross Station</option>
            </select>
            <p className="text-sm text-gray-400 mt-1">
              Can’t find the location?{' '}
              <a href="#" className="text-red-500 hover:underline">
                View Map
              </a>
            </p>
          </div>

          {/* Return Location */}
          <div>
            <label className="block text-gray-300 mb-1 text-sm">Return Location</label>
            <select
              disabled={sameLocation}
              className={`w-full p-3 rounded-md bg-black border ${
                sameLocation ? 'border-gray-800 text-gray-500' : 'border-gray-700 text-white'
              } focus:outline-none focus:ring-1 focus:ring-red-500`}
            >
              <option>Hogarth Road, London</option>
              <option>Heathrow Airport</option>
              <option>King’s Cross Station</option>
            </select>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={sameLocation}
                onChange={() => setSameLocation(!sameLocation)}
                className="accent-red-600"
              />
              <span className="text-sm text-gray-300">Same as pick-up location</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center mt-10">
          <button className="bg-red-600 hover:bg-red-700 text-white text-lg font-semibold px-10 py-3 rounded-md transition">
            Make Reservation
          </button>
        </div>
      </section>
    </div>
  );
}