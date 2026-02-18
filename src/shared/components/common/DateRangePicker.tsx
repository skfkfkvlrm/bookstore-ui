import { useState } from "react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
  label?: string;
}

const DateRangePicker = ({
  startDate,
  endDate,
  onDateChange,
  label = "기간 선택",
}: DateRangePickerProps) => {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  const handleApply = () => {
    onDateChange(localStartDate, localEndDate);
  };

  const handlePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const endStr = end.toISOString().split("T")[0];
    const startStr = start.toISOString().split("T")[0];

    setLocalStartDate(startStr);
    setLocalEndDate(endStr);
    onDateChange(startStr, endStr);
  };

  return (
    <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        {label}
      </label>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2 flex-1">
          <input
            type="date"
            value={localStartDate}
            onChange={(e) => setLocalStartDate(e.target.value)}
            className="flex-1 px-3 py-2 bg-white dark:bg-[#1a2632] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2f9e5f] focus:border-transparent dark:text-white text-sm"
          />
          <span className="text-gray-500 dark:text-gray-400">~</span>
          <input
            type="date"
            value={localEndDate}
            onChange={(e) => setLocalEndDate(e.target.value)}
            className="flex-1 px-3 py-2 bg-white dark:bg-[#1a2632] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2f9e5f] focus:border-transparent dark:text-white text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handlePreset(7)}
            className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            최근 7일
          </button>
          <button
            type="button"
            onClick={() => handlePreset(30)}
            className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            최근 30일
          </button>
          <button
            type="button"
            onClick={() => handlePreset(90)}
            className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            최근 90일
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 text-xs font-medium text-white bg-[#2f9e5f] hover:bg-[#1f7d57] rounded-lg transition-colors"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
