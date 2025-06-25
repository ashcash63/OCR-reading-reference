
import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import ResultsArea from '../components/ResultsArea';
import VideoPlayerModal from '../components/VideoPlayerModal';

interface SearchResult {
  camera_id: string;
  timestamp: string;
  video_path: string;
  segment_start_time: number;
  segment_end_time: number;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<SearchResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      console.log('Searching for:', searchQuery);
      const response = await fetch(`/search?keyword=${encodeURIComponent(searchQuery)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Search results:', data);
        setResults(data);
      } else {
        console.error('Search failed:', response.status, response.statusText);
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      // For demo purposes, let's add some mock data when the API isn't available
      const mockResults: SearchResult[] = [
        {
          camera_id: "Camera_001",
          timestamp: "00:01:25",
          video_path: "vid/warehouse_feed_1.mp4",
          segment_start_time: 83,
          segment_end_time: 93
        },
        {
          camera_id: "Camera_003",
          timestamp: "00:03:42",
          video_path: "vid/warehouse_feed_3.mp4",
          segment_start_time: 220,
          segment_end_time: 235
        }
      ];
      setResults(mockResults);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVideo = (result: SearchResult) => {
    setSelectedVideo(result);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const getVideoUrl = (result: SearchResult) => {
    return `/video_segment?video_path=${encodeURIComponent(result.video_path)}&start_time=${result.segment_start_time}&end_time=${result.segment_end_time}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-cyber-darkCard to-cyber-dark relative overflow-hidden">
      {/* Background gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-radial from-cyber-blue/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-radial from-cyber-green/15 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-radial from-cyan-500/10 to-transparent rounded-full blur-2xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-radial from-cyber-blue/5 to-transparent rounded-full blur-xl"></div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-cyber-gradient bg-clip-text text-transparent relative">
            Video Forensics Search
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto relative">
            Advanced AI-powered video analysis system for forensic investigation and evidence discovery
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        {/* Results Area */}
        <div className="max-w-4xl mx-auto">
          <ResultsArea
            searchQuery={searchQuery}
            isLoading={isLoading}
            results={results}
            hasSearched={hasSearched}
            onPlayVideo={handlePlayVideo}
          />
        </div>

        {/* Video Player Modal */}
        <VideoPlayerModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          videoUrl={selectedVideo ? getVideoUrl(selectedVideo) : ''}
          result={selectedVideo}
        />
      </div>
    </div>
  );
};

export default Index;
