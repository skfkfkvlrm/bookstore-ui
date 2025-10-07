import { InputHTMLAttributes } from "react";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

const SearchInput = ({ placeholder = "Search", className = "", onSearch, ...props }: SearchInputProps) => {
  return (
    <div className={`relative ${className}`}>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400">
        search
      </span>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-[#1173d4] focus:outline-none"
        onChange={(e) => onSearch?.(e.target.value)}
        {...props}
      />
    </div>
  );
};

export default SearchInput;
