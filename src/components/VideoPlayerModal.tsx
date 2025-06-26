import React, { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, SkipBack, Clock } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getScreenshotUrl } from '../lib/api';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  result: {
    text?: string;
    timestamp: number;
    camera_id: string;
    source_video: string;
    screenshot_filename?: string;
    segment_start_time?: number;
    segment_end_time?: number;
  } | null;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ 
  isOpen, 
  onClose, 
  videoUrl, 
  result 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isImageMode, setIsImageMode] = useState(true); // Start with image mode
  
  const screenshotUrl = result?.screenshot_filename 
    ? getScreenshotUrl(result.screenshot_filename)
    : '';
    
  const formatTime = (timestamp: number): string => {
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl bg-cyber-darkCard/95 border border-cyber-blue/20 text-white backdrop-blur">
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={onClose}
            className="rounded-full p-2 bg-black/50 hover:bg-black/80 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold mb-2 text-cyber-blue">
            {result?.camera_id}: {result?.text || 'Detected Text'}
          </h2>
          
          <div className="text-sm text-gray-300 flex items-center gap-2 mb-4">
            <Clock size={14} />
            <span>
              Timestamp: {result?.timestamp ? formatTime(result.timestamp) : '00:00'} seconds
            </span>
          </div>
          
          {/* Video/Image Container */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {isImageMode ? (
              <>
                {/* Screenshot display */}
                <img 
                  src={screenshotUrl}
                  alt={`Screenshot showing ${result?.text || 'detected text'}`}
                  className="w-full h-full object-contain"
                />
                
                {/* Overlay with button to switch to video */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <button
                    onClick={() => setIsImageMode(false)}
                    className="flex items-center gap-2 bg-cyber-blue hover:bg-cyber-blue/80 text-white font-semibold py-2 px-4 rounded-full transition-all transform hover:scale-105"
                  >
                    <Play size={20} />
                    Play Video Clip
                  </button>
                </div>
              </>
            ) : (
              /* Video Player - In a real app, this would use a proper video player */
              <>
                <div className="w-full h-full flex items-center justify-center bg-black">
                  {/* This is a placeholder. In a real implementation, you'd use a proper video component */}
                  <p className="text-center text-gray-400 p-4">
                    Video player would load here.<br/>
                    Showing segment from {result?.segment_start_time}s to {result?.segment_end_time}s of {result?.source_video}
                  </p>
                </div>
                
                {/* Video controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button 
                        className="rounded-full p-2 bg-white/10 hover:bg-white/20 transition-colors"
                        onClick={() => setIsImageMode(true)}
                      >
                        <SkipBack size={16} />
                      </button>
                      <button 
                        className="rounded-full p-3 bg-white/10 hover:bg-white/20 transition-colors"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                    </div>
                    <div className="text-xs text-gray-300 font-mono">
                      {formatTime(result?.segment_start_time || 0)} / {formatTime(result?.segment_end_time || 10)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;
