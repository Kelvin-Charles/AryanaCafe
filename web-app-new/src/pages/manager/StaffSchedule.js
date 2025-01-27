import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { format, parse } from 'date-fns';

const StaffSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newShift, setNewShift] = useState({
    staffId: '',
    date: '',
    startTime: '',
    endTime: '',
    role: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shiftsResponse, staffResponse] = await Promise.all([
        api.shifts.getAll(),
        api.users.getStaff()
      ]);
      setSchedules(shiftsResponse.data);
      setStaff(staffResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewShift(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.shifts.create(newShift);
      fetchData();
      setNewShift({
        staffId: '',
        date: '',
        startTime: '',
        endTime: '',
        role: ''
      });
      alert('Shift created successfully');
    } catch (error) {
      console.error('Error creating shift:', error);
      alert('Failed to create shift');
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      try {
        await api.shifts.delete(shiftId);
        fetchData();
        alert('Shift deleted successfully');
      } catch (error) {
        console.error('Error deleting shift:', error);
        alert('Failed to delete shift');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Staff Schedule</h1>

      {/* Add New Shift Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Shift</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Staff Member
              </label>
              <select
                name="staffId"
                value={newShift.staffId}
                onChange={handleInputChange}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Staff Member</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={newShift.date}
                onChange={handleInputChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={newShift.startTime}
                onChange={handleInputChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={newShift.endTime}
                onChange={handleInputChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
          >
            Add Shift
          </button>
        </form>
      </div>

      {/* Schedule Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Current Schedule</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Staff Member</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((shift) => (
                <tr key={shift.id} className="border-t">
                  <td className="px-4 py-2">{shift.staffName}</td>
                  <td className="px-4 py-2">{shift.role}</td>
                  <td className="px-4 py-2">
                    {format(new Date(shift.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-4 py-2">
                    {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDeleteShift(shift.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffSchedule; 