import React from 'react';
import { motion } from 'framer-motion';

const MiniStatistics = ({ title, amount, icon, percentage, trend }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-[20px] bg-white bg-clip-border px-[25px] py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:text-white dark:shadow-none"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-600 dark:text-white">{title}</div>
          <div className="text-2xl font-bold text-navy-700 dark:text-white">
            {amount}
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-brandLinear to-brand-500 bg-lightPrimary dark:!bg-navy-800">
          {icon}
        </div>
      </div>
      {percentage && (
        <div className="flex items-center gap-1 mt-2">
          <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
              </svg>
            )}
            <span className="ml-1">{percentage}%</span>
          </div>
          <span className="text-sm text-gray-600">vs last month</span>
        </div>
      )}
    </motion.div>
  );
};

export default MiniStatistics; 