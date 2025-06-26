import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery, onSearch, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-10 relative">
      <div className="cyber-input flex items-center rounded-lg overflow-hidden border-2 border-cyber-blue/30 focus-within:border-cyber-blue/80 bg-black/50 backdrop-blur-lg">
        <input
          type="text"
          placeholder="Search for text in surveillance footage..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-4 px-6 bg-transparent text-white focus:outline-none text-lg"
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`px-6 py-4 bg-gradient-to-r from-cyber-blue to-cyber-green hover:opacity-90 transition-opacity ${isLoading ? 'opacity-70' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
          ) : (
            <Search className="text-white" />
          )}
        </button>
      </div>
      <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
        <div className="h-px w-1/2 bg-gradient-to-r from-transparent via-cyber-blue to-transparent"></div>
      </div>
    </form>
  );
};

export default SearchBar;
