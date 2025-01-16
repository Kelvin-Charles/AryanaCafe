import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../services/api';

const timeSlots = [
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:00 PM',
  '5:30 PM',
  '6:00 PM',
  '6:30 PM',
  '7:00 PM',
  '7:30 PM',
  '8:00 PM',
  '8:30 PM',
  '9:00 PM',
];

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: '',
    specialRequests: '',
    contactInfo: {
      name: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await api.reservations.getMyReservations();
      setReservations(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch reservations. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('contactInfo.')) {
      setFormData((prevData) => ({
        ...prevData,
        contactInfo: {
          ...prevData.contactInfo,
          [name.split('.')[1]]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.reservations.create(formData);
      setFormData({
        date: '',
        time: '',
        guests: '',
        specialRequests: '',
        contactInfo: {
          name: '',
          email: '',
          phone: '',
        },
      });
      fetchReservations();
    } catch (error) {
      setError('Failed to create reservation. Please try again.');
    }
  };

  const cancelReservation = async (reservationId) => {
    try {
      await api.reservations.cancel(reservationId);
      fetchReservations();
    } catch (error) {
      setError('Failed to cancel reservation. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Reservations</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Make a Reservation</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block mb-1">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-2"
              required
            />
          </div>
          <div>
            <label htmlFor="time" className="block mb-1">Time</label>
            <select
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-2"
              required
            >
              <option value="">Select a time</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="guests" className="block mb-1">Number of Guests</label>
            <input
              type="number"
              id="guests"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-2"
              min="1"
              max="10"
              required
            />
          </div>
          <div>
            <label htmlFor="specialRequests" className="block mb-1">Special Requests</label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-2"
              rows="3"
            ></textarea>
          </div>
          <div>
            <label htmlFor="contactInfo.name" className="block mb-1">Name</label>
            <input
              type="text"
              id="contactInfo.name"
              name="contactInfo.name"
              value={formData.contactInfo.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-2"
              required
            />
          </div>
          <div>
            <label htmlFor="contactInfo.email" className="block mb-1">Email</label>
            <input
              type="email"
              id="contactInfo.email"
              name="contactInfo.email"
              value={formData.contactInfo.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-2"
              required
            />
          </div>
          <div>
            <label htmlFor="contactInfo.phone" className="block mb-1">Phone</label>
            <input
              type="tel"
              id="contactInfo.phone"
              name="contactInfo.phone"
              value={formData.contactInfo.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-2"
              required
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="bg-primary text-white px-6 py-2 rounded">
              Make Reservation
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Your Reservations</h2>
        {loading ? (
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : reservations.length === 0 ? (
          <div className="text-center">No reservations found.</div>
        ) : (
          <ul className="space-y-4">
            {reservations.map((reservation) => (
              <li key={reservation.id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold">{format(new Date(reservation.date), 'MMMM d, yyyy')}</h3>
                  <span className={`px-2 py-1 rounded text-white ${
                    reservation.status === 'pending'
                      ? 'bg-yellow-500'
                      : reservation.status === 'confirmed'
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}>
                    {reservation.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">Time: {reservation.time}</p>
                <p className="text-gray-600 mb-2">Guests: {reservation.guests}</p>
                {reservation.specialRequests && (
                  <p className="text-gray-600 mb-2">Special Requests: {reservation.specialRequests}</p>
                )}
                {reservation.status === 'pending' && (
                  <button
                    onClick={() => cancelReservation(reservation.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Cancel Reservation
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Reservations; 