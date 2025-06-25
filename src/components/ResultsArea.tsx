import React from 'react';
import ResultItem from './ResultItem';

interface SearchResult {
  camera_id: string;
  timestamp: string;
  video_path: string;
  segment_start_time: number;
  segment_end_time: number;
}

interface ResultsAreaProps {
  searchQuery: string;
  isLoading: boolean;
  results: SearchResult[];
  hasSearched: boolean;
  onPlayVideo: (result: SearchResult) => void;
}

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-gray-600 rounded-full animate-spin"></div>
      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-cyber-blue rounded-full animate-spin"></div>
      <div className="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-cyber-green rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
    </div>
    <p className="text-cyber-blue mt-4 text-lg font-medium animate-pulse">
      Analyzing video archive...
    </p>
  </div>
);

const ResultsArea: React.FC<ResultsAreaProps> = ({ 
  searchQuery, 
  isLoading, 
  results, 
  hasSearched, 
  onPlayVideo 
}) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!hasSearched) {
    return null;
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="cyber-card p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-red-400 mb-2">
            No Results Found
          </h2>
          <p className="text-gray-300">
            No results found for <span className="text-cyber-green font-semibold">"{searchQuery}"</span>
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Try different keywords or check your spelling.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cyber-green mb-2">
          Search Results
        </h2>
        <p className="text-gray-300">
          Found {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
          <span className="text-cyber-blue font-semibold">"{searchQuery}"</span>
        </p>
      </div>
      
      <div className="space-y-4">
        {results.map((result, index) => (
          <ResultItem
            key={`${result.camera_id}-${result.timestamp}-${index}`}
            result={result}
            onPlayClick={() => onPlayVideo(result)}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsArea;
