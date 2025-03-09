
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar = ({ 
  initialValue = "", 
  onSearch, 
  placeholder = "Search...",
  className = "" 
}: SearchBarProps) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  
  useEffect(() => {
    setSearchValue(initialValue);
  }, [initialValue]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };
  
  const handleClear = () => {
    setSearchValue("");
    onSearch("");
  };
  
  return (
    <form 
      onSubmit={handleSubmit} 
      className={`relative group ${className}`}
    >
      <div 
        className={`flex items-center relative rounded-full transition-all duration-300 ${
          isFocused 
            ? "bg-background shadow-md ring-2 ring-primary/20" 
            : "bg-secondary/50 hover:bg-secondary/80"
        }`}
      >
        <div className="flex-none pl-4">
          <Search 
            className={`h-4 w-4 transition-colors duration-300 ${
              isFocused ? "text-primary" : "text-muted-foreground"
            }`} 
          />
        </div>
        
        <input
          type="text"
          className="flex-1 bg-transparent border-none py-2.5 px-3 focus:outline-none text-sm w-full"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {searchValue && (
          <button
            type="button"
            className="flex-none pr-2"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        )}
        
        <button
          type="submit"
          className={`flex-none px-4 py-2 rounded-r-full text-sm font-medium transition-colors duration-300 ${
            isFocused 
              ? "bg-primary text-primary-foreground" 
              : "bg-secondary/80 text-foreground hover:bg-secondary"
          }`}
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
