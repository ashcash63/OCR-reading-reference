import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (filters?: { dateRange?: { start: string; end: string }, cameraId?: string }) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery, onSearch, isLoading }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [cameraId, setCameraId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filters: any = {};
    if (dateRange.start && dateRange.end) filters.dateRange = dateRange;
    if (cameraId) filters.cameraId = cameraId;
    onSearch(Object.keys(filters).length ? filters : undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-10 relative">
      <div className="cyber-input flex items-center rounded-lg overflow-hidden border-2 border-cyber-blue/30 focus-within:border-cyber-blue/80 bg-black/50 backdrop-blur-lg">
        <input
          type="text"
          placeholder="Search for text... e.g., PALLET-A123, Exit Sign, Caution Label."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-4 px-6 bg-transparent text-white focus:outline-none text-lg"
          disabled={isLoading}
        />
        <button
          type="button"
          className="px-4 py-4 bg-cyber-blue text-white hover:opacity-90 transition-opacity border-r border-cyber-green"
          onClick={() => setShowFilters((prev) => !prev)}
          tabIndex={-1}
        >
          Filters
        </button>
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
      {showFilters && (
        <div className="flex flex-col md:flex-row gap-4 mt-4 p-4 bg-black/60 rounded-lg border border-cyber-blue/30">
          <div className="flex flex-col">
            <label className="text-white mb-1">Date Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-2 py-1 rounded bg-black/40 text-white border border-cyber-blue/30"
              />
              <span className="text-white self-center">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-2 py-1 rounded bg-black/40 text-white border border-cyber-blue/30"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-white mb-1">Camera ID</label>
            <input
              type="text"
              value={cameraId}
              onChange={e => setCameraId(e.target.value)}
              placeholder="e.g., CAM-001"
              className="px-2 py-1 rounded bg-black/40 text-white border border-cyber-blue/30"
            />
          </div>
        </div>
      )}
      <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
        <div className="h-px w-1/2 bg-gradient-to-r from-transparent via-cyber-blue to-transparent"></div>
      </div>
    </form>
  );
};

export default SearchBar;
