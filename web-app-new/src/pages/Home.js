import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-gray-100">
      <section className="bg-cover bg-center h-screen" style={{ backgroundImage: "url('https://example.com/hero-image.jpg')" }}>
        <div className="bg-black bg-opacity-50 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Welcome to Aryana Cafe</h1>
            <p className="text-xl mb-8">Discover our delicious menu and make a reservation today!</p>
            <div>
              <Link to="/menu" className="bg-primary text-white px-8 py-3 rounded-full mr-4">View Menu</Link>
              <Link to="/reservations" className="bg-white text-primary px-8 py-3 rounded-full">Make Reservation</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded shadow text-center">
              <img src="https://example.com/fresh-icon.png" alt="Fresh Ingredients" className="w-20 h-20 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">Fresh Ingredients</h3>
              <p>We use only the freshest ingredients in all our dishes.</p>
            </div>
            <div className="bg-white p-8 rounded shadow text-center">
              <img src="https://example.com/service-icon.png" alt="Fast Service" className="w-20 h-20 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">Fast Service</h3>
              <p>Our friendly staff ensures quick and efficient service.</p>
            </div>
            <div className="bg-white p-8 rounded shadow text-center">
              <img src="https://example.com/atmosphere-icon.png" alt="Great Atmosphere" className="w-20 h-20 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">Great Atmosphere</h3>
              <p>Enjoy your meal in our cozy and welcoming cafe.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl text-white font-bold mb-8">Ready to Order?</h2>
          <Link to="/menu" className="bg-white text-primary px-8 py-3 rounded-full text-xl">View Our Menu</Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 