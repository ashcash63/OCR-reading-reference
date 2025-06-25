
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  result: {
    camera_id: string;
    timestamp: string;
    video_path: string;
    segment_start_time: number;
    segment_end_time: number;
  } | null;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ 
  isOpen, 
  onClose, 
  videoUrl, 
  result 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-4xl mx-4 animate-fade-in">
        <div className="cyber-card p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-cyber-blue">
                {result.camera_id}
              </h3>
              <p className="text-gray-300">
                Timestamp: <span className="text-cyber-green font-mono">{result.timestamp}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Video Player */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-auto max-h-[70vh]"
              onError={() => {
                console.error('Video failed to load:', videoUrl);
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Video Info */}
          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Camera ID:</span>
                <p className="text-cyber-blue font-medium">{result.camera_id}</p>
              </div>
              <div>
                <span className="text-gray-400">Timestamp:</span>
                <p className="text-cyber-green font-mono">{result.timestamp}</p>
              </div>
              <div>
                <span className="text-gray-400">Duration:</span>
                <p className="text-white">{result.segment_end_time - result.segment_start_time}s</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;
