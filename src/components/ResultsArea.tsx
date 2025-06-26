import React from 'react';
import ResultItem from './ResultItem';
import { SearchResult } from '../lib/api';

interface ResultsAreaProps {
  searchQuery: string;
  isLoading: boolean;
  results: SearchResult[];
  hasSearched: boolean;
  onPlayVideo: (result: SearchResult) => void;
}

const ResultsArea: React.FC<ResultsAreaProps> = ({ 
  searchQuery, 
  isLoading, 
  results, 
  hasSearched, 
  onPlayVideo 
}) => {

  // Display placeholder when loading
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="cyber-card p-6 animate-pulse">
          <div className="flex gap-4">
            <div className="h-40 w-64 bg-gray-700 rounded"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
        </div>
        <div className="cyber-card p-6 animate-pulse">
          <div className="flex gap-4">
            <div className="h-40 w-64 bg-gray-700 rounded"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-2/5 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No results state
  if (hasSearched && results.length === 0) {
    return (
      <div className="cyber-card p-8 text-center">
        <h3 className="text-xl font-semibold text-red-400 mb-2">No Results Found</h3>
        <p className="text-gray-400">
          No matches found for "{searchQuery}". Try a different search term.
        </p>
      </div>
    );
  }

  // Results display
  return (
    <div className="space-y-4">
      {results.length > 0 && (
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Found <span className="text-cyber-blue">{results.length}</span> matches for "{searchQuery}"
        </h2>
      )}
      
      {results.map((result, index) => (
        <ResultItem 
          key={index} 
          result={{
            camera_id: result.camera_id,
            timestamp: new Date(result.timestamp * 1000).toISOString().substr(11, 8), // Convert to timestamp format
            video_path: result.source_video,
            segment_start_time: Math.max(0, result.timestamp - 5), // 5 seconds before
            segment_end_time: result.timestamp + 5, // 5 seconds after
            screenshot_filename: result.screenshot_filename,
            text: result.text
          }} 
          onPlayClick={() => onPlayVideo(result)}
        />
      ))}
    </div>
  );
};

export default ResultsArea;
