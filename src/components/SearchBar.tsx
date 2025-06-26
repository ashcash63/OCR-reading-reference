import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (filters?: any) => void;
  isLoading: boolean;
  compact?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery, onSearch, isLoading, compact }) => {
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
    <form onSubmit={handleSubmit} className={`w-full max-w-xl mx-auto mb-6 relative`}>
      <div className={`flex items-stretch rounded-lg overflow-hidden border-2 border-cyber-blue/30 focus-within:border-cyber-blue/80 bg-black/50 backdrop-blur-lg`}>
        <input
          type="text"
          placeholder="Search for text... e.g., PALLET-A123, Exit Sign, Caution Label."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`bg-transparent text-white focus:outline-none ${compact ? 'text-base py-3 px-4' : 'text-lg py-3 px-6'} w-full`}
          disabled={isLoading}
        />
        <button
          type="button"
          className={`transition-opacity border-r ${compact ? 'px-3 py-3 text-sm bg-[#0a2540] text-white border-cyber-green' : 'px-4 py-3 bg-[#0a2540] text-white border-cyber-green'}`}
          onClick={() => setShowFilters((prev) => !prev)}
          tabIndex={-1}
        >
          Filters
        </button>
        <button
          type="submit"
          className={`transition-opacity ${compact ? 'px-4 py-3 text-lg bg-[#0a2540] text-white' : 'px-6 py-3 bg-[#0a2540] text-white'} ${isLoading ? 'opacity-70' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className={`rounded-full animate-spin ${compact ? 'w-5 h-5 border-2 border-t-transparent border-white' : 'w-6 h-6 border-2 border-t-transparent border-white'}`}></div>
          ) : (
            <Search className="text-white" />
          )}
        </button>
      </div>
      {showFilters && (
        <div className={`flex flex-wrap gap-4 mt-4 p-4 bg-black/60 rounded-lg border border-cyber-blue/30 ${compact ? 'text-sm' : ''}`}>
          <div className="flex flex-col w-full md:w-1/2">
            <label className="text-white mb-1">Date Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                className={`rounded bg-black/40 text-white border border-cyber-blue/30 ${compact ? 'px-1 py-1' : 'px-2 py-1'}`}
              />
              <span className="text-white self-center">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                className={`rounded bg-black/40 text-white border border-cyber-blue/30 ${compact ? 'px-1 py-1' : 'px-2 py-1'}`}
              />
            </div>
          </div>
          <div className="flex flex-col w-full md:w-1/2">
            <label className="text-white mb-1">Camera ID</label>
            <input
              type="text"
              value={cameraId}
              onChange={e => setCameraId(e.target.value)}
              placeholder="e.g., CAM-001"
              className={`w-full rounded bg-black/40 text-white border border-cyber-blue/30 ${compact ? 'px-1 py-1' : 'px-2 py-1'}`}
            />
          </div>
        </div>
      )}
      <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
        <div className={`h-px w-1/2 ${compact ? 'bg-cyber-blue/40' : 'bg-gradient-to-r from-transparent via-cyber-blue to-transparent'}`}></div>
      </div>
    </form>
  );
};

export default SearchBar;
