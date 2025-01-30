import React, { useState } from 'react';
import api from '../services/api';

const AddressForm = ({ onAddressCreated, address, onAddressUpdated, onCancel }) => {
  const [formData, setFormData] = useState({
    street: address?.street || '',
    city: address?.city || '',
    state: address?.state || '',
    zipCode: address?.zip_code || '',
    isDefault: address?.is_default || false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (address) {
        const updatedAddress = await api.addresses.update(address.id, formData);
        onAddressUpdated(updatedAddress.data);
      } else {
        const newAddress = await api.addresses.create(formData);
        onAddressCreated(newAddress.data);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      street: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Street</label>
        <input
          type="text"
          name="street"
          value={formData.street}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">City</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">State</label>
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Zip Code</label>
        <input
          type="text"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleInputChange}
            className="mr-2"
          />
          <span className="text-sm font-medium">Set as default address</span>
        </label>
      </div>
      <div className="flex space-x-4">
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          {address ? 'Update Address' : 'Add Address'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AddressForm; 