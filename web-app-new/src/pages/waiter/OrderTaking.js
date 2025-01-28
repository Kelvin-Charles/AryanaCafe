import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const OrderTaking = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tablesResponse, menuResponse] = await Promise.all([
        api.tables.getStatus(),
        api.menu.getAll()
      ]);
      
      // Only show available tables
      setTables(tablesResponse.data.filter(table => table.status === 'available'));
      
      // Ensure all menu items have numeric prices
      const formattedMenuItems = menuResponse.data.map(item => ({
        ...item,
        price: typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price) || 0
      }));
      setMenuItems(formattedMenuItems);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const handleAddItem = (menuItem) => {
    const existingItem = orderItems.find(item => item.menuItemId === menuItem.id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.menuItemId === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: typeof menuItem.price === 'string' ? parseFloat(menuItem.price) : Number(menuItem.price) || 0,
        quantity: 1
      }]);
    }
  };

  const handleRemoveItem = (menuItem) => {
    const existingItem = orderItems.find(item => item.menuItemId === menuItem.id);
    
    if (existingItem.quantity === 1) {
      setOrderItems(orderItems.filter(item => item.menuItemId !== menuItem.id));
    } else {
      setOrderItems(orderItems.map(item =>
        item.menuItemId === menuItem.id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    }
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price) || 0;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const handleSubmitOrder = async () => {
    if (!selectedTable) {
      alert('Please select a table');
      return;
    }

    if (orderItems.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    try {
      const orderData = {
        tableId: selectedTable,
        customerName,
        items: orderItems.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity
        })),
        specialRequests
      };

      await api.orders.create(orderData);
      alert('Order created successfully');
      navigate('/waiter/tables');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order');
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
      <h1 className="text-3xl font-bold mb-8">Take Order</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Items */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Menu Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <span className="font-medium">${formatPrice(item.price)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-600">
                      {orderItems.find(orderItem => orderItem.menuItemId === item.id)?.quantity || 0} in order
                    </span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleRemoveItem(item)}
                        disabled={!orderItems.find(orderItem => orderItem.menuItemId === item.id)}
                        className="px-2 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleAddItem(item)}
                        className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            {/* Table Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Table
              </label>
              <select
                value={selectedTable || ''}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="">Select a table...</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    Table {table.number} (Capacity: {table.capacity})
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border rounded-lg p-2"
                placeholder="Enter customer name..."
              />
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Items</h3>
              {orderItems.length > 0 ? (
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-4">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${formatPrice(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No items added</p>
              )}
            </div>

            {/* Special Requests */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full border rounded-lg p-2"
                rows="3"
                placeholder="Enter any special requests..."
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitOrder}
              className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTaking; 