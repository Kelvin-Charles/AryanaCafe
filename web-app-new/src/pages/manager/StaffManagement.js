import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'waiter'
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.users.getStaff();
      setStaff(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch staff members');
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.auth.registerStaff(formData);
      fetchStaff();
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'waiter'
      });
      alert('Staff member added successfully');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add staff member');
      console.error('Error adding staff:', err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) {
      return;
    }
    try {
      await api.users.delete(userId);
      fetchStaff();
      alert('Staff member removed successfully');
    } catch (err) {
      alert('Failed to remove staff member');
      console.error('Error removing staff:', err);
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
      <h1 className="text-3xl font-bold mb-8">Staff Management</h1>

      {/* Add Staff Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Staff Member</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="waiter">Waiter</option>
                <option value="chef">Chef</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Add Staff Member
          </button>
        </form>
      </div>

      {/* Staff List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Current Staff</h2>
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id} className="border-t">
                    <td className="px-4 py-2">{member.name}</td>
                    <td className="px-4 py-2">{member.email}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        member.role === 'waiter' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffManagement; 