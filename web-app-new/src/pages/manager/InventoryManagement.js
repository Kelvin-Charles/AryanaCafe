import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    unit: '',
    minThreshold: '',
    category: ''
  });
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await api.inventory.getAll();
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingItem) {
      setEditingItem(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setNewItem(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.inventory.update(editingItem.id, editingItem);
        setEditingItem(null);
      } else {
        await api.inventory.create(newItem);
        setNewItem({
          name: '',
          quantity: '',
          unit: '',
          minThreshold: '',
          category: ''
        });
      }
      fetchInventory();
      alert(editingItem ? 'Item updated successfully' : 'Item added successfully');
    } catch (error) {
      console.error('Error saving inventory item:', error);
      alert('Failed to save item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.inventory.delete(id);
        fetchInventory();
        alert('Item deleted successfully');
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  };

  const handleUpdateStock = async (id, change) => {
    try {
      const item = inventory.find(i => i.id === id);
      const newQuantity = Math.max(0, item.quantity + change);
      await api.inventory.update(id, { ...item, quantity: newQuantity });
      fetchInventory();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
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
      <h1 className="text-3xl font-bold mb-8">Inventory Management</h1>

      {/* Add/Edit Item Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingItem ? 'Edit Item' : 'Add New Item'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name
              </label>
              <input
                type="text"
                name="name"
                value={editingItem ? editingItem.name : newItem.name}
                onChange={handleInputChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={editingItem ? editingItem.quantity : newItem.quantity}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                name="unit"
                value={editingItem ? editingItem.unit : newItem.unit}
                onChange={handleInputChange}
                required
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., kg, liters, pieces"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Threshold
              </label>
              <input
                type="number"
                name="minThreshold"
                value={editingItem ? editingItem.minThreshold : newItem.minThreshold}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={editingItem ? editingItem.category : newItem.category}
                onChange={handleInputChange}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Category</option>
                <option value="ingredients">Ingredients</option>
                <option value="beverages">Beverages</option>
                <option value="supplies">Supplies</option>
                <option value="equipment">Equipment</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
            >
              {editingItem ? 'Update Item' : 'Add Item'}
            </button>
            {editingItem && (
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Inventory Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Current Stock</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Item Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Unit</th>
                <th className="px-4 py-2 text-left">Min. Threshold</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.category}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStock(item.id, -1)}
                        className="px-2 bg-gray-200 rounded"
                      >
                        -
                      </button>
                      {item.quantity}
                      <button
                        onClick={() => handleUpdateStock(item.id, 1)}
                        className="px-2 bg-gray-200 rounded"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2">{item.unit}</td>
                  <td className="px-4 py-2">{item.minThreshold}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        item.quantity <= item.minThreshold
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {item.quantity <= item.minThreshold ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
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

export default InventoryManagement; 