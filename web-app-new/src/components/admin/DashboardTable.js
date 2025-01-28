import React from 'react';
import { motion } from 'framer-motion';

const DashboardTable = ({ title, headers, data, renderRow }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-[20px] bg-white bg-clip-border p-6 shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:text-white dark:shadow-none"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-navy-700 dark:text-white">
            {title}
          </h2>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="border-b border-gray-200 pb-[10px] text-start text-sm font-medium text-gray-600 dark:border-white/10 dark:text-white"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <motion.tr
                  key={item.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {renderRow(item)}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={headers.length}
                  className="py-4 text-center text-sm text-gray-600 dark:text-white"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default DashboardTable; 