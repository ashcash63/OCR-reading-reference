
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
    if (searchQuery.trim()) {
      onSearch();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter keyword to search video archive..."
            className="cyber-input w-full pr-32 text-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !searchQuery.trim()}
            className="absolute right-2 px-4 py-2 flex items-center gap-2 text-sm bg-cyber-blue hover:bg-cyan-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyber-blue/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Search size={16} />
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
