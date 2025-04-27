import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterButtonProps {
  label: string;
  options: string[];
  selectedOption: string;
  onChange: (option: string) => void;
  className?: string;
  disabled?: boolean;
}

const FilterButton = ({
  label,
  options,
  selectedOption,
  onChange,
  className = '',
  disabled = false,
}: FilterButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={cn('relative inline-block', className)} ref={buttonRef}>
      <button
        type="button"
        className={`flex items-center justify-between gap-2 px-4 py-2 rounded-lg text-sm border border-border/50 bg-background hover:bg-secondary/50 transition-all duration-200 ${
          isOpen ? 'ring-2 ring-primary/20' : ''
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className="text-muted-foreground mr-1">{label}:</span>
        <span className="font-medium">{selectedOption}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-2 w-full min-w-[140px] max-h-60 overflow-auto rounded-lg bg-background border border-border shadow-lg animate-scale-in py-1">
          {options.map((option) => (
            <button
              key={option}
              className={`w-full flex items-center px-4 py-2 text-sm hover:bg-secondary/50 transition-colors ${
                selectedOption === option ? 'bg-secondary/30' : ''
              }`}
              onClick={() => handleOptionSelect(option)}
            >
              <span className="flex-1 text-left">{option}</span>
              {selectedOption === option && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterButton;
