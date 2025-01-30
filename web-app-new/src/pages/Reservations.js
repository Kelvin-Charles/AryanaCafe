import React, { useState, useEffect } from 'react';
import { format, addDays, parseISO, isAfter, isBefore, startOfDay, differenceInDays } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Reservations = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [contactInfo, setContactInfo] = useState({
      name: '',
      email: '',
    phone: ''
  });

  // Time slots configuration
  const timeSlots = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00'
  ];

  useEffect(() => {
    if (isAuthenticated) {
      setContactInfo({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      fetchReservations();
    } else {
      // Reset reservations for non-authenticated users
      setReservations([]);
      // Reset contact info for non-authenticated users
      setContactInfo({
        name: '',
        email: '',
        phone: ''
      });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (selectedDate) {
      checkAvailability();
    }
  }, [selectedDate]);

  const fetchReservations = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await api.reservations.getMyReservations();
      setReservations(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    try {
      setCheckingAvailability(true);
      setAvailabilityError(null);
      
      // Get all tables and their capacity
      const response = await api.tables.getAll();
      const tables = response.data || [];
      const totalTables = tables.length;

      if (totalTables === 0) {
        setAvailabilityError('No tables are configured in the system.');
        setAvailableTimes([]);
        return;
      }
      
      try {
        // Get existing reservations for the selected date
        const reservationsResponse = await api.reservations.getByDate(format(selectedDate, 'yyyy-MM-dd'));
        const dateReservations = reservationsResponse.data || [];

        // Check availability for each time slot
        const availableSlots = timeSlots.filter(time => {
          // Get active reservations for this specific time slot
          const activeReservations = dateReservations.filter(
            res => res.time === time && res.status !== 'cancelled'
          );

          // A time slot is available if there are tables not yet booked
          const tablesBooked = activeReservations.length;
          return tablesBooked < totalTables;
        });
        
        setAvailableTimes(availableSlots);

        // Only show error if no times are available
        if (availableSlots.length === 0) {
          setAvailabilityError('All tables are booked for all time slots on this date. Please try another date.');
        }
      } catch (err) {
        // If we can't get reservations, assume all slots are available
        console.warn('Could not fetch reservations, showing all time slots as available:', err);
        setAvailableTimes(timeSlots);
      }
    } catch (err) {
      console.error('Error checking availability:', err);
      // If we can't get tables, show an error but still show time slots
      setAvailabilityError('Could not check table availability, but you can still select a time.');
      setAvailableTimes(timeSlots);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Double check availability right before submitting
      const tablesResponse = await api.tables.getAll();
      const tables = tablesResponse.data || [];
      const totalTables = tables.length;
      
      // Get current reservations for the selected time slot
      const reservationsResponse = await api.reservations.getByDate(format(selectedDate, 'yyyy-MM-dd'));
      const currentTimeReservations = (reservationsResponse.data || []).filter(
        res => res.time === selectedTime && res.status !== 'cancelled'
      );

      // Verify the time slot is still available
      if (currentTimeReservations.length >= totalTables) {
        alert('Sorry, this time slot has just been booked. Please select another time.');
        await checkAvailability();
        return;
      }

      const reservationData = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        guests,
        specialRequests,
        contactInfo: {
          name: contactInfo.name,
          email: contactInfo.email,
          phone: contactInfo.phone
        }
      };

      await api.reservations.create(reservationData);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
      fetchReservations();
      resetForm();
    } catch (err) {
      if (err.response?.status === 409) {
        alert('This time slot has just been booked. Please select another time.');
        await checkAvailability();
      } else {
        alert('Failed to create reservation. Please try again.');
        console.error('Error creating reservation:', err);
      }
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await api.reservations.cancel(id);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
      fetchReservations();
    } catch (err) {
        alert('Failed to cancel reservation');
        console.error('Error cancelling reservation:', err);
      }
    }
  };

  const resetForm = () => {
    setSelectedTime('');
    setGuests(2);
    setSpecialRequests('');
    if (!isAuthenticated) {
      setContactInfo({ name: '', email: '', phone: '' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isTimeSlotAvailable = (time) => {
    return availableTimes.includes(time);
  };

  const filterReservations = (tab) => {
    if (!reservations) return [];
    const now = new Date();
    return reservations.filter(reservation => {
      const reservationDate = parseISO(`${reservation.date}T${reservation.time}`);
      return tab === 'upcoming' ? isAfter(reservationDate, now) : isBefore(reservationDate, now);
    }).sort((a, b) => {
      const dateA = parseISO(`${a.date}T${a.time}`);
      const dateB = parseISO(`${b.date}T${b.time}`);
      return tab === 'upcoming' ? dateA - dateB : dateB - dateA;
    });
  };

  const getReservationDateDisplay = (date) => {
    const reservationDate = parseISO(date);
    const today = new Date();
    const diffDays = differenceInDays(reservationDate, today);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    return format(reservationDate, 'MMM dd, yyyy');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Table Reservations</h1>
          <p className="text-lg text-gray-600">Book your table or manage your reservations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Reservation Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-2xl">
            <h2 className="text-2xl font-bold mb-8 text-center">Make a Reservation</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
          <div>
                <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    setSelectedDate(parseISO(e.target.value));
                    setSelectedTime(''); // Reset selected time when date changes
                  }}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>

              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                {checkingAvailability ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                    <p className="mt-2 text-sm text-gray-500">Checking availability...</p>
                  </div>
                ) : availabilityError ? (
                  <div className="text-center py-4">
                    <p className="text-red-500">{availabilityError}</p>
                    <button
                      type="button"
                      onClick={checkAvailability}
                      className="mt-2 text-primary hover:text-primary-dark text-sm"
                    >
                      Check Again
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        disabled={!isTimeSlotAvailable(time)}
                        className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                          selectedTime === time
                            ? 'bg-primary text-white shadow-md'
                            : isTimeSlotAvailable(time)
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed relative group'
                        }`}
                      >
                        {time}
                        {!isTimeSlotAvailable(time) && (
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            Not available
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

          <div>
                <label className="block text-sm font-medium mb-2">Number of Guests</label>
            <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
              required
            >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>

              {!isAuthenticated && (
                <>
          <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
                      value={contactInfo.name}
                      onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
              required
            />
          </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Special Requests</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
                  rows="3"
                  placeholder="Any special requests or dietary requirements?"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedTime || checkingAvailability}
                className={`w-full py-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  !selectedTime || checkingAvailability
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {checkingAvailability ? 'Checking Availability...' : 'Make Reservation'}
            </button>
            </form>
          </div>

          {/* Reservations List - Only show if authenticated */}
          {isAuthenticated && (
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-8 text-center">Your Reservations</h2>
              
              {/* Tabs */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    activeTab === 'upcoming'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    activeTab === 'past'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Past
                </button>
      </div>

              {/* Reservations list content */}
        {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-8 bg-red-50 rounded-lg">
                  <p className="font-medium">{error}</p>
                  <button
                    onClick={fetchReservations}
                    className="mt-4 text-sm text-primary hover:text-primary-dark"
                  >
                    Try Again
                  </button>
                </div>
              ) : filterReservations(activeTab).length === 0 ? (
                <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-lg">
                  <p className="font-medium">No {activeTab} reservations found</p>
                  {activeTab === 'upcoming' && (
                    <p className="mt-2 text-sm">Make a reservation to get started!</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filterReservations(activeTab).map((reservation) => (
                    <div
                      key={reservation.id}
                      className="border rounded-lg p-6 hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-lg">{reservation.contactInfo.name}</p>
                          <p className="text-gray-600">
                            {getReservationDateDisplay(reservation.date)} at {reservation.time}
                          </p>
                          <p className="text-gray-600">{reservation.guests} guests</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            reservation.status
                          )}`}
                        >
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </span>
                      </div>
                      
                      {reservation.specialRequests && (
                        <p className="mt-4 text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <span className="font-medium">Special Requests:</span> {reservation.specialRequests}
                        </p>
                      )}
                      
                      {(user?.role === 'admin' || user?.role === 'manager') && (
                        <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <p><span className="font-medium">Email:</span> {reservation.contactInfo.email}</p>
                          <p><span className="font-medium">Phone:</span> {reservation.contactInfo.phone}</p>
                        </div>
                      )}
                      
                      {reservation.status === 'pending' && activeTab === 'upcoming' && (
                        <div className="mt-4">
                          <button
                            onClick={() => handleCancel(reservation.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm bg-red-50 px-4 py-2 rounded-lg transition-colors duration-200"
                          >
                            Cancel Reservation
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 animate-fade-in-up">
          <p className="font-medium">Success!</p>
          <p className="text-sm">Your reservation has been {activeTab === 'upcoming' ? 'updated' : 'created'}.</p>
        </div>
      )}
    </div>
  );
};

export default Reservations; 