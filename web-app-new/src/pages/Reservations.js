import React, { useState, useEffect } from 'react';
import { format, addDays, parseISO, isAfter, isBefore, startOfDay, differenceInDays } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import MenuOrderPopup from '../components/MenuOrderPopup';

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
  const [showMenuPopup, setShowMenuPopup] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showOrderOption, setShowOrderOption] = useState(false);
  const [timeSlotInfo, setTimeSlotInfo] = useState([]);

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
    if (!isAuthenticated) {
      setReservations([]);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching reservations for user:', user?.id);
      const response = await api.reservations.getMyReservations();
      console.log('Received reservations:', response.data);
      
      if (response.data) {
      setReservations(response.data);
      } else {
        setReservations([]);
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to fetch reservations');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    try {
      setCheckingAvailability(true);
      setAvailabilityError(null);
      
      const response = await api.reservations.checkAvailability(
        format(selectedDate, 'yyyy-MM-dd'),
        null,
        guests
      );

      const { timeSlots } = response.data;
      
      setAvailableTimes(timeSlots.filter(slot => slot.available).map(slot => slot.time));
      setTimeSlotInfo(timeSlots);

    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailabilityError('Unable to check availability at this time. Please try again later.');
      setAvailableTimes([]);
      setTimeSlotInfo([]);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleOrderComplete = (newOrderId) => {
    setOrderId(newOrderId);
    setShowMenuPopup(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Double check availability right before submitting
      const response = await api.reservations.checkAvailability(
        format(selectedDate, 'yyyy-MM-dd'),
        selectedTime,
        guests
      );

      const { timeSlots } = response.data;
      const selectedTimeSlot = timeSlots.find(slot => slot.time === selectedTime);

      if (!selectedTimeSlot || !selectedTimeSlot.available) {
        alert('Sorry, this time slot has just been booked. Please select another time.');
        await checkAvailability();
        return;
      }

      // If user is not authenticated, redirect to login with return URL
      if (!isAuthenticated) {
        const reservationData = {
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
          guests,
          specialRequests,
          contactInfo
        };
        // Store reservation data in session storage
        sessionStorage.setItem('pendingReservation', JSON.stringify(reservationData));
        window.location.href = `/login?redirect=${encodeURIComponent('/reservations')}`;
        return;
      }

      // Ask if they want to add food to their reservation
      setShowOrderOption(true);

    } catch (err) {
      console.error('Error creating reservation:', err);
      alert('Failed to check availability. Please try again.');
    }
  };

  const finalizeReservation = async (withOrder = false) => {
    try {
      if (!isAuthenticated || !user?.id) {
        alert('You must be logged in to make a reservation');
        return;
      }

      const reservationData = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        guests: parseInt(guests, 10),
        specialRequests: specialRequests || '',
        contactInfo: {
          name: contactInfo.name || user.name,
          email: contactInfo.email || user.email,
          phone: contactInfo.phone || ''
        }
      };

      // Only include OrderId if it exists and is not null
      if (orderId) {
        reservationData.OrderId = orderId;
      }

      console.log('Creating reservation with data:', {
        ...reservationData,
        userId: user.id,
        userInfo: {
          name: user.name,
          email: user.email
        }
      });

      const response = await api.reservations.create(reservationData);
      console.log('Reservation created:', response.data);
      
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
      await fetchReservations();
      resetForm();
      setShowOrderOption(false);
      setOrderId(null);
    } catch (err) {
      console.error('Error creating reservation:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.details || 'Failed to create reservation. Please try again.';
      alert(errorMessage);
      
      // Log detailed error information
      console.error('Detailed error:', {
        status: err.response?.status,
        data: err.response?.data,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          data: err.config?.data
        }
      });
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
    if (!reservations || !Array.isArray(reservations)) return [];
    
    const now = new Date();
    return reservations
      .filter(reservation => {
        if (!reservation.date || !reservation.time) return false;
        
        const reservationDate = parseISO(`${reservation.date}T${reservation.time}`);
        if (tab === 'upcoming') {
          return isAfter(reservationDate, now) && reservation.status !== 'cancelled';
        } else {
          return isBefore(reservationDate, now) || reservation.status === 'cancelled';
        }
      })
      .sort((a, b) => {
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

  // Add useEffect to check for pending reservation
  useEffect(() => {
    if (isAuthenticated) {
      const pendingReservation = sessionStorage.getItem('pendingReservation');
      if (pendingReservation) {
        try {
          const reservationData = JSON.parse(pendingReservation);
          setSelectedDate(parseISO(reservationData.date));
          setSelectedTime(reservationData.time);
          setGuests(reservationData.guests);
          setSpecialRequests(reservationData.specialRequests);
          setContactInfo(reservationData.contactInfo);
          // Clear the pending reservation
          sessionStorage.removeItem('pendingReservation');
          // Show the order option
          setShowOrderOption(true);
        } catch (err) {
          console.error('Error restoring pending reservation:', err);
          sessionStorage.removeItem('pendingReservation');
        }
      }
    }
  }, [isAuthenticated]);

  const renderTimeSlot = (time) => {
    const slotInfo = timeSlotInfo.find(slot => slot.time === time) || {
      available: true,
      availableTables: null,
      totalTables: null
    };

    return (
      <button
        key={time}
        type="button"
        onClick={() => setSelectedTime(time)}
        disabled={!slotInfo.available}
        className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 relative group ${
          selectedTime === time
            ? 'bg-primary text-white shadow-md'
            : slotInfo.available
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {time}
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {slotInfo.available 
            ? slotInfo.availableTables 
              ? `${slotInfo.availableTables} of ${slotInfo.totalTables} tables available`
              : 'Available'
            : 'Fully booked'}
        </span>
      </button>
    );
  };

  // Add this new function to render reservation details
  const renderReservationDetails = (reservation) => {
    return (
      <div
        key={reservation.id}
        className="border rounded-lg p-6 hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium text-lg">{reservation.contactInfo?.name}</p>
            <p className="text-gray-600">
              {getReservationDateDisplay(reservation.date)} at {reservation.time}
            </p>
            <p className="text-gray-600">{reservation.guests} guests</p>
            {reservation.Order && (
              <p className="text-gray-600 mt-2">
                <span className="font-medium">Order ID:</span> {reservation.Order.orderId}
              </p>
            )}
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
    );
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
                    {timeSlots.map(time => renderTimeSlot(time))}
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
                  {filterReservations(activeTab).map(reservation => renderReservationDetails(reservation))}
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

      {/* Order Option Modal */}
      {showOrderOption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Would you like to add food to your reservation?</h3>
            <p className="text-gray-600 mb-6">
              You can pre-order food from our menu to be ready at your reserved time.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowOrderOption(false);
                  setShowMenuPopup(true);
                }}
                className="flex-1 py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Yes, Add Food
              </button>
              <button
                onClick={() => finalizeReservation(false)}
                className="flex-1 py-3 px-4 border rounded-lg hover:bg-gray-100"
              >
                No, Just Reserve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Popup */}
      <MenuOrderPopup
        isOpen={showMenuPopup}
        onClose={() => {
          setShowMenuPopup(false);
          finalizeReservation(false);
        }}
        onOrderComplete={(orderId) => {
          handleOrderComplete(orderId);
          finalizeReservation(true);
        }}
      />
    </div>
  );
};

export default Reservations; 