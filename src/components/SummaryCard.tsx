import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white dark:bg-[#1f2937] rounded-lg shadow p-6 flex items-center">
      <div className="flex-shrink-0 mr-4">
        <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-lg font-medium text-gray-500 dark:text-gray-300">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
    </div>
  );
};

export default SummaryCard; 