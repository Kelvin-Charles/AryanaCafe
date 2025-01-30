import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import { format } from 'date-fns';

const ManageReservations = () => {
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await api.reservations.getAll();
      setReservations(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to load reservations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.reservations.updateStatus(id, newStatus);
      await fetchReservations();
    } catch (error) {
      console.error('Error updating reservation status:', error);
      alert('Failed to update reservation status. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Reservations</h1>
            <button
              onClick={fetchReservations}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200"
            >
              Refresh
            </button>
          </div>

          {/* Reservations List */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={fetchReservations}
                  className="text-primary hover:text-primary-dark"
                >
                  Try Again
                </button>
              </div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reservations found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Time</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Guests</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reservations.map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              {reservation.contactInfo?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reservation.contactInfo?.email || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {format(new Date(reservation.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-4 py-3 text-gray-900">{reservation.time}</td>
                        <td className="px-4 py-3 text-gray-900">{reservation.guests}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <select
                              value={reservation.status}
                              onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                              className="block w-32 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirm</option>
                              <option value="cancelled">Cancel</option>
                              <option value="completed">Complete</option>
                            </select>
                            <button
                              onClick={() => setSelectedReservation(reservation)}
                              className="px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors duration-200"
                            >
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Reservation Details Modal */}
        {selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl max-w-lg w-full mx-4 shadow-xl">
              <h2 className="text-2xl font-bold mb-6">Reservation Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-700">Customer Name:</label>
                  <p className="mt-1">{selectedReservation.contactInfo?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Email:</label>
                  <p className="mt-1">{selectedReservation.contactInfo?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Phone:</label>
                  <p className="mt-1">{selectedReservation.contactInfo?.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Date:</label>
                  <p className="mt-1">{format(new Date(selectedReservation.date), 'MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Time:</label>
                  <p className="mt-1">{selectedReservation.time}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Number of Guests:</label>
                  <p className="mt-1">{selectedReservation.guests} people</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Special Requests:</label>
                  <p className="mt-1">{selectedReservation.specialRequests || 'None'}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Status:</label>
                  <p className="mt-1">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReservation.status)}`}>
                      {selectedReservation.status.charAt(0).toUpperCase() + selectedReservation.status.slice(1)}
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageReservations; 