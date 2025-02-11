import { useState } from 'react';
import { format } from 'date-fns';

export function DateRangePicker({ dateRange, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFromChange = (e) => {
    onChange({
      ...dateRange,
      from: e.target.value
    });
  };

  const handleToChange = (e) => {
    onChange({
      ...dateRange,
      to: e.target.value
    });
  };

  return (
    <div className="relative">
      <div className="flex gap-2 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700">From</label>
          <input
            type="date"
            value={dateRange.from || ''}
            onChange={handleFromChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">To</label>
          <input
            type="date"
            value={dateRange.to || ''}
            onChange={handleToChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
} 