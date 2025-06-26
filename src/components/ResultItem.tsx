import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { getScreenshotUrl } from '../lib/api';

interface ResultItemProps {
  result: {
    camera_id: string;
    timestamp: string;
    video_path: string;
    segment_start_time: number;
    segment_end_time: number;
    screenshot_filename?: string;
    text?: string;
  };
  onPlayClick: () => void;
}

const ResultItem: React.FC<ResultItemProps> = ({ result, onPlayClick }) => {
  const [imageError, setImageError] = useState(false);
  const screenshotUrl = getScreenshotUrl(result.screenshot_filename);

  return (
    <div className="cyber-card p-6 transition-all duration-300 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Screenshot section */}
        {screenshotUrl && !imageError && (
          <div className="relative w-full md:w-64 h-40 bg-black rounded-md overflow-hidden flex-shrink-0">
            <img
              src={screenshotUrl}
              alt={`Screenshot showing ${result.text || 'detected text'}`}
              className="w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <span className="text-xs text-cyan-400 font-mono">
                Text detected: {result.text || 'unknown'}
              </span>
            </div>
          </div>
        )}

        {/* Info section */}
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-cyber-blue mb-2">
            {result.camera_id}
          </h3>
          <p className="text-gray-300 mb-1">
            Found at{' '}
            <span className="text-cyber-green font-mono">{result.timestamp}</span>
          </p>
          <p className="text-sm text-gray-400">
            Segment: {result.segment_start_time}s - {result.segment_end_time}s
          </p>
        </div>

        {/* Play button */}
        <button
          onClick={onPlayClick}
          className="flex items-center gap-2 bg-[#178a4c] hover:bg-[#1dbf73] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#178a4c]/50"
        >
          <Play size={16} />
          Play Clip
        </button>
      </div>
    </div>
  );
};

export default ResultItem;
