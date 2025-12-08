import { useState, useRef, useEffect } from 'react';

type Option = {
  value: string;
  label: string;
  id?: string | number;
};

type SearchableSelectProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  maxHeight?: string;
};

export function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Search and select...',
  disabled = false,
  required = false,
  className = '',
  maxHeight = '200px',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`space-y-1 text-xs relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-[11px] font-semibold text-slate-800">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Selected value display / trigger button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-left flex items-center justify-between ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-300'
          } ${!selectedOption ? 'text-slate-400' : ''}`}
        >
          <span className="truncate flex-1">{displayValue}</span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg">
            {/* Search input */}
            <div className="p-2 border-b border-slate-200">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options list - scrollable */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight }}
            >
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-500 text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors ${
                      value === option.value ? 'bg-primary/10 text-primary font-medium' : 'text-slate-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

