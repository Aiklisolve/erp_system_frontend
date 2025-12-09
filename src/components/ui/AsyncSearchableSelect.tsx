import { useState, useRef, useEffect } from 'react';

type AsyncSearchableSelectProps<T = any> = {
  label?: string;
  value: string;
  onChange: (value: string, selectedOption?: T) => void;
  loadOptions: (searchTerm: string) => Promise<T[]>;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  maxHeight?: string;
};

export function AsyncSearchableSelect<T = any>({
  label,
  value,
  onChange,
  loadOptions,
  getOptionLabel,
  getOptionValue,
  placeholder = 'Search and select...',
  disabled = false,
  required = false,
  className = '',
  maxHeight = '200px',
}: AsyncSearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<T | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Load options when dropdown opens or search query changes
  useEffect(() => {
    if (!isOpen) return;

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await loadOptions(searchQuery);
        setOptions(results);
      } catch (error) {
        console.error('Error loading options:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [isOpen, searchQuery, loadOptions]);

  // Load selected option when value changes
  useEffect(() => {
    if (value && options.length > 0) {
      const found = options.find((opt) => getOptionValue(opt) === value);
      if (found) {
        setSelectedOption(found);
      }
    } else {
      setSelectedOption(null);
    }
  }, [value, options, getOptionValue]);

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
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option: T) => {
    const optionValue = getOptionValue(option);
    onChange(optionValue, option);
    setSelectedOption(option);
    setIsOpen(false);
    setSearchQuery('');
  };

  const displayValue = selectedOption ? getOptionLabel(selectedOption) : placeholder;

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
                placeholder="Type to search managers..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options list - scrollable */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight }}
            >
              {loading ? (
                <div className="px-3 py-2 text-xs text-slate-500 text-center">
                  Loading...
                </div>
              ) : options.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-500 text-center">
                  {searchQuery ? `No managers found for "${searchQuery}"` : 'Type to search managers...'}
                </div>
              ) : (
                options.map((option) => (
                  <button
                    key={getOptionValue(option)}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors ${
                      value === getOptionValue(option) ? 'bg-primary/10 text-primary font-medium' : 'text-slate-900'
                    }`}
                  >
                    {getOptionLabel(option)}
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

