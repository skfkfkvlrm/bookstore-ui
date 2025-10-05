import { ButtonHTMLAttributes } from "react";

interface FilterButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

const FilterButton = ({ label, className = "", ...props }: FilterButtonProps) => {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
      {...props}
    >
      {label} <span className="material-symbols-outlined text-sm">expand_more</span>
    </button>
  );
};

export default FilterButton;
