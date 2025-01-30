import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AddressForm from '../components/AddressForm';
import AddressList from '../components/AddressList';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: ''
  });
  const [addresses, setAddresses] = useState([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchAddresses();
    fetchTotalSpend();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.auth.me();
      setUser(response.data);
      setFormData({
        name: response.data.name
      });
    } catch (error) {
      setError('Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await api.addresses.getAll();
      setAddresses(response.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
    }
  };

  const fetchTotalSpend = async () => {
    try {
      const response = await api.orders.getTotalSpend();
      setTotalSpend(response.data.totalSpend);
    } catch (error) {
      console.error('Error fetching total spend:', error);
      console.error('Error response:', error.response);
      setError('Failed to fetch total spend');
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.users.updateProfile(formData);
      alert('Profile updated successfully');
      fetchUserProfile();
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const handleAddressCreated = (newAddress) => {
    setAddresses(prev => [...prev, newAddress]);
    setShowAddressForm(false);
  };

  const handleAddressUpdated = (updatedAddress) => {
    setAddresses(prev => prev.map(address => 
      address.id === updatedAddress.id ? updatedAddress : address
    ));
  };

  const handleAddressDeleted = (deletedAddressId) => {
    setAddresses(prev => prev.filter(address => address.id !== deletedAddressId));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Profile Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                value={user.email}
                className="w-full p-2 border rounded bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <input
                type="text"
                value={user.role}
                className="w-full p-2 border rounded bg-gray-100"
                disabled
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              Update Profile
            </button>
          </form>
        </div>
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Addresses</h2>
            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              >
                Add New Address
              </button>
            )}
          </div>
          {showAddressForm && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Add New Address</h3>
              <AddressForm 
                onAddressCreated={handleAddressCreated}
                onCancel={() => setShowAddressForm(false)}
              />
            </div>
          )}
          {addresses.length > 0 ? (
            <AddressList 
              addresses={addresses}
              onAddressUpdated={handleAddressUpdated}
              onAddressDeleted={handleAddressDeleted}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No addresses found.</p>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="mt-4 text-primary hover:text-primary-dark"
                >
                  Add your first address
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Total Spend</h2>
        <p className="text-4xl font-bold">TSh {totalSpend.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default Profile; 
