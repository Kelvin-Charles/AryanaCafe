import React, { useState } from 'react';
import api from '../services/api';
import AddressForm from './AddressForm';

const AddressList = ({ addresses, onAddressUpdated, onAddressDeleted }) => {
  const [editingAddress, setEditingAddress] = useState(null);

  const handleEdit = (address) => {
    setEditingAddress(address);
  };

  const handleDelete = async (id) => {
    try {
      await api.addresses.delete(id);
      onAddressDeleted(id);
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleAddressUpdated = (updatedAddress) => {
    onAddressUpdated(updatedAddress);
    setEditingAddress(null);
  };

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <div key={address.id} className="bg-gray-100 p-4 rounded">
          {editingAddress?.id === address.id ? (
            <AddressForm
              address={editingAddress}
              onAddressUpdated={handleAddressUpdated}
            />
          ) : (
            <>
              <p>{address.street}</p>
              <p>{address.city}, {address.state} {address.zip_code}</p>
              {address.is_default && (
                <p className="text-sm text-green-600">Default Address</p>
              )}
              <div className="mt-2">
                <button
                  onClick={() => handleEdit(address)}
                  className="px-2 py-1 bg-blue-500 text-white rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default AddressList; 