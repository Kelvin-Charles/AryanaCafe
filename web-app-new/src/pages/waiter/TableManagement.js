import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tablesResponse, ordersResponse] = await Promise.all([
        api.tables.getStatus(),
        api.orders.getActiveOrders()
      ]);
      setTables(tablesResponse.data);
      setOrders(ordersResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
  };

  const handleAssignTable = async (tableId) => {
    try {
      await api.tables.assign(tableId);
      fetchData();
      alert('Table assigned successfully');
    } catch (error) {
      console.error('Error assigning table:', error);
      alert('Failed to assign table');
    }
  };

  const handleReleaseTable = async (tableId) => {
    if (window.confirm('Are you sure you want to release this table?')) {
      try {
        await api.tables.release(tableId);
        fetchData();
        setSelectedTable(null);
        alert('Table released successfully');
      } catch (error) {
        console.error('Error releasing table:', error);
        alert('Failed to release table');
      }
    }
  };

  const handleAddNote = async (orderId, note) => {
    try {
      await api.orders.addNote(orderId, note);
      fetchData();
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <h1 className="text-3xl font-bold mb-8">Table Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Tables</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => handleTableSelect(table)}
                  className={`p-4 rounded-lg border-2 ${
                    selectedTable?.id === table.id
                      ? 'border-primary'
                      : 'border-gray-200'
                  } hover:border-primary transition-colors`}
                >
                  <div className="text-lg font-bold mb-2">Table {table.number}</div>
                  <div className={`text-sm px-2 py-1 rounded ${getStatusColor(table.status)}`}>
                    {table.status}
                  </div>
                  {table.capacity && (
                    <div className="text-sm text-gray-600 mt-2">
                      Capacity: {table.capacity}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Details */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Table Details</h2>
            {selectedTable ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Table {selectedTable.number}</h3>
                  <p className="text-gray-600">
                    Status: <span className={`px-2 py-1 rounded ${getStatusColor(selectedTable.status)}`}>
                      {selectedTable.status}
                    </span>
                  </p>
                  {selectedTable.capacity && (
                    <p className="text-gray-600">Capacity: {selectedTable.capacity}</p>
                  )}
                </div>

                {selectedTable.currentOrder && (
                  <div>
                    <h3 className="font-medium">Current Order</h3>
                    <div className="space-y-2 mt-2">
                      <p>Order #{selectedTable.currentOrder.id}</p>
                      <p>Time: {format(new Date(selectedTable.currentOrder.createdAt), 'HH:mm')}</p>
                      <div className="space-y-1">
                        {selectedTable.currentOrder.items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <span>{item.quantity}x {item.menuItem.name}</span>
                            <span>{item.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {selectedTable.status === 'available' ? (
                    <button
                      onClick={() => handleAssignTable(selectedTable.id)}
                      className="w-full bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
                    >
                      Assign Table
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReleaseTable(selectedTable.id)}
                      className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Release Table
                    </button>
                  )}
                </div>

                {selectedTable.status === 'occupied' && (
                  <div>
                    <h3 className="font-medium mb-2">Add Note</h3>
                    <textarea
                      className="w-full border rounded p-2"
                      rows="3"
                      placeholder="Enter note..."
                      onBlur={(e) => {
                        if (e.target.value && selectedTable.currentOrder) {
                          handleAddNote(selectedTable.currentOrder.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">Select a table to view details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableManagement; 