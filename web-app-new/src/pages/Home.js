import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-gray-100">
      <section 
        className="relative bg-cover bg-center h-screen bg-no-repeat" 
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50" />
        <div className="relative h-full flex items-center justify-center px-4">
          <div className="text-center text-white max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Welcome to Aryana Cafe
            </h1>
            <p className="text-lg md:text-2xl mb-10 text-gray-100">
              Experience the finest dining with our exquisite menu and exceptional service
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/menu" 
                className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-primary-dark transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                View Menu
              </Link>
              <Link 
                to="/reservations" 
                className="w-full sm:w-auto bg-white text-primary px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                Make Reservation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center text-gray-900">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.9A3.5 3.5 0 0 0 18.1 13H5.9A3.5 3.5 0 0 0 3 15.9V21h18v-5.1zm-1.5 3.1h-15V16a1.5 1.5 0 0 1 1.5-1.5h12a1.5 1.5 0 0 1 1.5 1.5v3zM12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Fresh Ingredients</h3>
              <p className="text-gray-600">We use only the freshest, locally-sourced ingredients in all our dishes.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Fast Service</h3>
              <p className="text-gray-600">Our professional staff ensures quick and efficient service every time.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Great Atmosphere</h3>
              <p className="text-gray-600">Enjoy your meal in our cozy and welcoming atmosphere.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary to-primary-dark py-20">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-4xl text-white font-bold mb-8">Ready to Order?</h2>
          <Link 
            to="/menu" 
            className="inline-block bg-white text-primary px-10 py-4 rounded-full text-xl font-medium hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            View Our Menu
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 