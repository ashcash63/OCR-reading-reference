import React from 'react';
import { Play } from 'lucide-react';

interface ResultItemProps {
  result: {
    camera_id: string;
    timestamp: string;
    video_path: string;
    segment_start_time: number;
    segment_end_time: number;
  };
  onPlayClick: () => void;
}

const ResultItem: React.FC<ResultItemProps> = ({ result, onPlayClick }) => {
  return (
    <div className="cyber-card p-6 transition-all duration-300 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-cyber-blue mb-2">
            {result.camera_id}
          </h3>
          <p className="text-gray-300 mb-1">
            Found at <span className="text-cyber-green font-mono">{result.timestamp}</span>
          </p>
          <p className="text-sm text-gray-400">
            Segment: {result.segment_start_time}s - {result.segment_end_time}s
          </p>
        </div>
        <button
          onClick={onPlayClick}
          className="flex items-center gap-2 ml-4 bg-[#178a4c] hover:bg-[#1dbf73] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#178a4c]/50"
        >
          <Play size={16} />
          Play Clip
        </button>
      </div>
    </div>
  );
};

export default ResultItem;
